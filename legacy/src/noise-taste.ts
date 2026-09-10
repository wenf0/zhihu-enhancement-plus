import { GM_getValue, GM_setValue } from '$';
import { TASTE_KEY, menuValue, writeSettingsBackup } from './config';
import { state } from './state';
import { jiebaReady, syncJiebaUserDict } from './noise-jieba';

export const TASTE_WORD_STEP = 2;
export const TASTE_CAT_STEP = 5;
export const TASTE_VALUE_STEP = 3;
export const TASTE_LEARNED_STEP = 1;
export const TASTE_WORD_RANGE = [-8, 12];
export const TASTE_CAT_RANGE = [-24, 28];
export const TASTE_VALUE_RANGE = [-8, 16];
export const TASTE_LEARNED_RANGE = [-10, 10];
export const TASTE_LEARNED_MIN = 2;

export function emptyTastePrefs() {
    return { words: {}, cats: {}, value: {}, learned: {}, actions: {}, clicks: 0 };
}

export function tasteEnabled() {
    return !!menuValue('menu_noiseScore') && menuValue('menu_noiseTaste') !== false;
}

export function getTastePrefs() {
    if (state.tasteCache) return state.tasteCache;
    const saved = GM_getValue(TASTE_KEY);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
        state.tasteCache = emptyTastePrefs();
        return state.tasteCache;
    }
    state.tasteCache = {
        words: saved.words && typeof saved.words === 'object' && !Array.isArray(saved.words) ? saved.words : {},
        cats: saved.cats && typeof saved.cats === 'object' && !Array.isArray(saved.cats) ? saved.cats : {},
        value: saved.value && typeof saved.value === 'object' && !Array.isArray(saved.value) ? saved.value : {},
        learned: saved.learned && typeof saved.learned === 'object' && !Array.isArray(saved.learned) ? saved.learned : {},
        actions: saved.actions && typeof saved.actions === 'object' && !Array.isArray(saved.actions) ? saved.actions : {},
        clicks: Number(saved.clicks) || 0
    };
    return state.tasteCache;
}

export function saveTastePrefs(data) {
    state.tasteCache = data;
    GM_setValue(TASTE_KEY, data);
    writeSettingsBackup();
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

export function applyTasteSignals(prefs, signals, action, sign) {
    const like = action === 'like';
    const field = like ? 'like' : 'dislike';
    const titleBoost = new Set(signals.titleWords || []);
    const stepFor = (base, word) => Math.round(base * (titleBoost.has(word) ? 1.5 : 1)) * sign;
    const wordStep = like ? -TASTE_WORD_STEP : TASTE_WORD_STEP;
    const catStep = (like ? -TASTE_CAT_STEP : TASTE_CAT_STEP) * sign;
    const valueStep = like ? TASTE_VALUE_STEP : -TASTE_VALUE_STEP;
    const learnedStep = like ? -TASTE_LEARNED_STEP : TASTE_LEARNED_STEP;
    if (!prefs.learned || typeof prefs.learned !== 'object') prefs.learned = {};
    for (const word of signals.noiseWords) {
        bumpTasteEntry(prefs.words, word, field, sign, stepFor(wordStep, word), TASTE_WORD_RANGE);
    }
    for (const id of signals.cats) {
        bumpTasteEntry(prefs.cats, id, field, sign, catStep, TASTE_CAT_RANGE);
    }
    for (const word of signals.valueWords) {
        bumpTasteEntry(prefs.value, word, field, sign, stepFor(valueStep, word), TASTE_VALUE_RANGE);
    }
    for (const word of signals.learned || []) {
        bumpTasteEntry(prefs.learned, word, field, sign, stepFor(learnedStep, word), TASTE_LEARNED_RANGE);
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

state.learnedWords = () => tasteEnabled() ? Object.keys(getTastePrefs().learned || {}) : [];
