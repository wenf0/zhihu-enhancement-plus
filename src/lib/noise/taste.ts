// @ts-nocheck
import { menuValue, getTastePrefs as readTaste, saveTastePrefs as persistTaste } from '../storage';
import { runtime, invalidateNoise } from '../content/state';
import { jiebaReady, syncJiebaUserDict } from './jieba';

/** 喜欢步长（噪音词 / 分类为负；价值词为正） */
export const TASTE_WORD_LIKE = 2;
export const TASTE_CAT_LIKE = 5;
export const TASTE_VALUE_LIKE = 3;
export const TASTE_LEARNED_LIKE = 1;

/** 不喜欢略强，过滤场景里负反馈更该强硬 */
export const TASTE_WORD_DISLIKE = 3;
export const TASTE_CAT_DISLIKE = 8;
export const TASTE_VALUE_DISLIKE = 4;
export const TASTE_LEARNED_DISLIKE = 2;

/** @deprecated 兼容旧引用：按不喜欢侧步长 */
export const TASTE_WORD_STEP = TASTE_WORD_DISLIKE;
export const TASTE_CAT_STEP = TASTE_CAT_DISLIKE;
export const TASTE_VALUE_STEP = TASTE_VALUE_DISLIKE;
export const TASTE_LEARNED_STEP = TASTE_LEARNED_DISLIKE;

/** 不喜欢侧略宽，避免强负反馈过早触顶 */
export const TASTE_WORD_RANGE = [-8, 14];
export const TASTE_CAT_RANGE = [-24, 32];
export const TASTE_VALUE_RANGE = [-10, 16];
export const TASTE_LEARNED_RANGE = [-8, 12];
export const TASTE_LEARNED_MIN = 2;

export const TASTE_TITLE_MUL = 1.5;
/** 已朝该方向累加越多，单次增量越小；约等于此值时减半 */
export const TASTE_DIMINISH_SPAN = 6;

export function emptyTastePrefs() {
    return { words: {}, cats: {}, value: {}, learned: {}, actions: {}, clicks: 0 };
}

export function tasteEnabled() {
    return !!menuValue('menu_noiseScore') && menuValue('menu_noiseTaste') !== false;
}

export function getTastePrefs() {
    if (runtime.tasteCache) return runtime.tasteCache;
    runtime.tasteCache = readTaste();
    runtime.learnedWords = Object.keys(runtime.tasteCache.learned || {});
    return runtime.tasteCache;
}

export async function saveTastePrefs(data) {
    runtime.tasteCache = data;
    runtime.learnedWords = Object.keys(data.learned || {});
    await persistTaste(data);
    if (jiebaReady) syncJiebaUserDict();
}

export function clampTaste(n, range) {
    return Math.max(range[0], Math.min(range[1], n));
}

export function bumpTasteEntry(map, key, field, fieldDelta, step, range) {
    const cur = map[key] || { like: 0, dislike: 0, delta: 0 };
    const next = {
        like: Math.max(0, (cur.like || 0) + (field === 'like' ? fieldDelta : 0)),
        dislike: Math.max(0, (cur.dislike || 0) + (field === 'dislike' ? fieldDelta : 0)),
        delta: clampTaste((cur.delta || 0) + step, range)
    };
    if (!next.like && !next.dislike && !next.delta) delete map[key];
    else map[key] = next;
}

/**
 * 计算本轮 delta 增量。
 * - 标题词 × TASTE_TITLE_MUL
 * - 正向学习（sign>0）按已有 |delta| 方向衰减
 * - 撤销（sign<0）用未衰减步长，尽量把一次切换撤干净
 */
export function scaleTasteStep(base, curDelta, sign, titleHit) {
    if (!base) return 0;
    const mul = titleHit ? TASTE_TITLE_MUL : 1;
    let directed = base * mul;
    if (sign > 0) {
        const progress = directed > 0 ? Math.max(0, curDelta || 0) : Math.max(0, -(curDelta || 0));
        directed /= 1 + progress / TASTE_DIMINISH_SPAN;
    }
    let step = Math.round(directed);
    if (step === 0) step = directed > 0 ? 1 : -1;
    return step * sign;
}

export function tasteActionBases(like) {
    return like
        ? {
            word: -TASTE_WORD_LIKE,
            cat: -TASTE_CAT_LIKE,
            value: TASTE_VALUE_LIKE,
            learned: -TASTE_LEARNED_LIKE,
        }
        : {
            word: TASTE_WORD_DISLIKE,
            cat: TASTE_CAT_DISLIKE,
            value: -TASTE_VALUE_DISLIKE,
            learned: TASTE_LEARNED_DISLIKE,
        };
}

export function applyTasteSignals(prefs, signals, action, sign) {
    const like = action === 'like';
    const field = like ? 'like' : 'dislike';
    const titleBoost = new Set(signals.titleWords || []);
    const bases = tasteActionBases(like);
    const stepOf = (map, key, base, useTitle) => {
        const cur = map && map[key] ? Number(map[key].delta) || 0 : 0;
        return scaleTasteStep(base, cur, sign, !!(useTitle && titleBoost.has(key)));
    };
    if (!prefs.learned || typeof prefs.learned !== 'object') prefs.learned = {};
    for (const word of signals.noiseWords) {
        bumpTasteEntry(prefs.words, word, field, sign, stepOf(prefs.words, word, bases.word, true), TASTE_WORD_RANGE);
    }
    for (const id of signals.cats) {
        bumpTasteEntry(prefs.cats, id, field, sign, stepOf(prefs.cats, id, bases.cat, false), TASTE_CAT_RANGE);
    }
    for (const word of signals.valueWords) {
        bumpTasteEntry(prefs.value, word, field, sign, stepOf(prefs.value, word, bases.value, true), TASTE_VALUE_RANGE);
    }
    for (const word of signals.learned || []) {
        bumpTasteEntry(prefs.learned, word, field, sign, stepOf(prefs.learned, word, bases.learned, true), TASTE_LEARNED_RANGE);
    }
    const learnedKeys = Object.keys(prefs.learned);
    if (learnedKeys.length > 200) {
        learnedKeys.sort((a, b) => {
            const x = prefs.learned[a];
            const y = prefs.learned[b];
            return (Math.abs(x.delta || 0) + (x.like || 0) + (x.dislike || 0))
                - (Math.abs(y.delta || 0) + (y.like || 0) + (y.dislike || 0));
        }).slice(0, learnedKeys.length - 200).forEach(k => delete prefs.learned[k]);
    }
}

export function tasteDelta(map, key) {
    const item = map && map[key];
    return item ? Number(item.delta) || 0 : 0;
}

export function refreshLearnedWords() {
    runtime.learnedWords = tasteEnabled() ? Object.keys(getTastePrefs().learned || {}) : [];
}

refreshLearnedWords();
void invalidateNoise;
