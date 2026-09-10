// @ts-nocheck
import { runtime } from './state';
import { NOISE_HIDE, NOISE_DEMOTE, NOISE_WEIGHTS, CUSTOM_LEVELS } from '../noise/const';
import { menuValue, readFilterMode } from '../storage';
import { escapeHtml, injectStyle, observeTree, forAddedElements, notify } from '../utils';
import { ensureJieba, jiebaReady, jiebaUnavailable } from '../noise/jieba';
import { scoreFeedNoise, scoreText, collectTasteSignals, noiseVerdict, noiseTint } from '../noise/score';
import { getTastePrefs, saveTastePrefs, applyTasteSignals, tasteEnabled, TASTE_LEARNED_MIN } from '../noise/taste';
import noiseCss from '../../assets/noise.css?inline';
import explainCss from '../../assets/explain.css?inline';

export function injectNoiseStyles() {
    injectStyle('zhihu-plus-noise', noiseCss);
    bindNoiseExplain();
}

export function ensureCardPosition(card) {
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
}

export function noiseBadgeAnchor(card) {
    const titleA = card.querySelector('h2.ContentItem-title a:not(.zhihu_e_toQuestion)');
    if (titleA) return titleA;
    const hotTitle = card.querySelector('h2.HotItem-title');
    if (hotTitle) return hotTitle;
    const searchA = card.querySelector('a[data-za-detail-view-id]');
    if (searchA) return searchA;
    return card.querySelector('h2, .ContentItem-title');
}

export function paintNoiseBadge(card, score, titleCss) {
    if (score <= 0) {
        const old = card.querySelector('.zhihu-plus-noise-tag');
        if (old) old.remove();
        return;
    }
    const anchor = noiseBadgeAnchor(card);
    let tag = card.querySelector('.zhihu-plus-noise-tag');
    if (!tag) {
        tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'zhihu-plus-noise-tag';
        tag.setAttribute('aria-label', '查看噪音评分过程');
    }
    if (anchor) {
        if (anchor.tagName === 'A' || anchor.tagName === 'H2') anchor.appendChild(tag);
        else anchor.insertAdjacentElement('afterend', tag);
    } else {
        ensureCardPosition(card);
        card.insertAdjacentElement('afterbegin', tag);
    }
    tag.style.setProperty('--t', noiseTint(score).toFixed(3));
    tag.textContent = String(score);
    if (titleCss) tag.dataset.titleCss = titleCss;
}

export function noisePartRows(parts) {
    const w = NOISE_WEIGHTS;
    return [
        ['K', '关键词', parts.K, w.k, 1],
        ['C', '分类', parts.C, w.c, 1],
        ['E', '情绪', parts.E, w.e, 1],
        ['S', '争议', parts.S, w.s, 1],
        ['B', '标题党', parts.B, w.b, 1],
        ['V', '价值', parts.V, w.v, -1]
    ].map(([k, name, v, weight, sign]) => {
        const n = Number(v) || 0;
        const contrib = sign * weight * n;
        return { k, name, v: n, weight, sign, contrib };
    });
}

export function mergeNoiseHits(a, b) {
    const out = [];
    const seen = new Set();
    for (const item of [...(a || []), ...(b || [])]) {
        const key = String(item.word || item).toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(item.word != null ? item : { word: item });
    }
    return out;
}

export function noiseHitChips(list, fmt) {
    if (!list || !list.length) return '<span class="zhihuE_NxEmpty">无</span>';
    const max = 36;
    const shown = list.slice(0, max);
    const extra = list.length - shown.length;
    return shown.map(fmt).join('') + (extra > 0 ? `<span class="zhihuE_NxMore">+${extra}</span>` : '');
}

export function noiseExplainHtml(title, body, result, href) {
    const { final, titleScore, bodyScore, rule } = result;
    const verdict = noiseVerdict(final, rule);
    const mixed = titleScore.final * 0.72 + bodyScore.final * 0.28;
    const used = final === titleScore.final ? 'title' : 'mix';
    const mode = readFilterMode();
    const rows = noisePartRows(titleScore);
    const w = NOISE_WEIGHTS;
    const n = x => (Math.round(x * 10) / 10).toFixed(1);
    const hits = titleScore.hits || { words: [], custom: [], cats: [], emotion: [], controversy: [], clickbait: [], value: [] };
    const customHits = mergeNoiseHits(hits.custom, bodyScore.hits && bodyScore.hits.custom);
    const classHits = mergeNoiseHits(hits.cats, bodyScore.hits && bodyScore.hits.cats);
    const catHits = (hits.words || []).filter(item => item.source !== 'custom');
    const notes = [];
    if (titleScore.winningCat) notes.push(`分类取「${titleScore.winningCat}」`);
    if (titleScore.exclude) notes.push(`排除词「${titleScore.exclude}」使 C ×0.35`);
    if (titleScore.cFallback) notes.push('无关键词但情绪和标题党偏高，C 保底 42');
    if (customHits.length) {
        const names = customHits.map(item => {
            const label = (CUSTOM_LEVELS[item.level] || CUSTOM_LEVELS.weight).name;
            return `${item.word}（${label}）`;
        }).join('、');
        notes.push(rule && rule.action
            ? `自定义规则「${names}」，分数仍是模型分`
            : `命中自定义词「${names}」，只加权`);
    }
    if (mode === 'off') notes.push('过滤已关闭，信息流只打分不处理');
    else if (mode === 'demote') notes.push('过滤为仅降权，不会移出信息流');
    const learnedHits = mergeNoiseHits(hits.learned, bodyScore.hits && bodyScore.hits.learned);
    if (tasteEnabled() && getTastePrefs().clicks) notes.push('分数已叠加本地「喜欢 / 不感兴趣」增量（词库对照 + 结巴新词）');
    if (learnedHits.length) notes.push(`口味新词 ${learnedHits.length} 个（同一词点满 ${TASTE_LEARNED_MIN} 次后计分）`);
    const bar = row => {
        const pct = Math.max(0, Math.min(100, row.v));
        return `<div class="zhihuE_NxRow">
            <div class="zhihuE_NxKey">${row.k}</div>
            <div class="zhihuE_NxMid">
                <div class="zhihuE_NxName">${row.name}</div>
                <div class="zhihuE_NxTrack"><i style="width:${pct}%"></i></div>
            </div>
            <div class="zhihuE_NxMath">${n(row.weight)} × ${n(row.v)} <b>${row.sign < 0 ? '−' : '+'}${n(Math.abs(row.contrib))}</b></div>
        </div>`;
    };
    const chip = item => {
        const tag = item.level && CUSTOM_LEVELS[item.level]
            ? CUSTOM_LEVELS[item.level].name
            : (item.cat && item.source !== 'custom' ? item.cat : (item.w != null ? (item.w % 1 ? item.w.toFixed(1) : item.w) : ''));
        return `<span class="zhihuE_NxChip"><em>${escapeHtml(item.word)}</em>${tag !== '' ? `<b>${escapeHtml(String(tag))}</b>` : ''}</span>`;
    };
    const classChip = item => {
        const win = item.word === titleScore.winningCat;
        const tag = item.w != null ? Math.round(item.w) : '';
        return `<span class="zhihuE_NxChip${win ? ' is-win' : ''}"><em>${escapeHtml(item.word)}</em>${tag !== '' ? `<b>${tag}</b>` : ''}</span>`;
    };
    return `<div class="zhihuE_NxHead">
        <div>
            <p class="zhihuE_NxKicker">Noise Score</p>
            <h3>评分过程</h3>
        </div>
        <button type="button" class="zhihuE_NxClose" aria-label="关闭">×</button>
    </div>
    <div class="zhihuE_NxHero is-${verdict.id}">
        <div class="zhihuE_NxScore">${Math.round(final)}</div>
        <div>
            <div class="zhihuE_NxVerdict">${escapeHtml(verdict.name)}</div>
            <p class="zhihuE_NxMix">max(标题 ${Math.round(titleScore.final)}${body ? `，0.72×标题 + 0.28×摘要 = ${Math.round(mixed)}` : ''})</p>
            <p class="zhihuE_NxMix">${used === 'title' ? '本条取标题分' : '本条取标题与摘要加权'}</p>
        </div>
    </div>
    <div class="zhihuE_NxBody">
        <div class="zhihuE_NxCol">
            <p class="zhihuE_NxFormula">clamp(${n(w.k)}K + ${n(w.c)}C + ${n(w.e)}E + ${n(w.s)}S + ${n(w.b)}B − ${n(w.v)}V)</p>
            <div class="zhihuE_NxRows">${rows.map(bar).join('')}</div>
        </div>
        <div class="zhihuE_NxHits">
            <div class="zhihuE_NxBlock"><span>自定义</span><div>${noiseHitChips(customHits, chip)}</div></div>
            <div class="zhihuE_NxBlock"><span>分类</span><div>${noiseHitChips(classHits, classChip)}</div></div>
            <div class="zhihuE_NxBlock"><span>关键词</span><div>${noiseHitChips(catHits, chip)}</div></div>
            <div class="zhihuE_NxBlock"><span>情绪</span><div>${noiseHitChips(hits.emotion, chip)}</div></div>
            <div class="zhihuE_NxBlock"><span>争议</span><div>${noiseHitChips(hits.controversy.map(word => ({ word })), chip)}</div></div>
            <div class="zhihuE_NxBlock"><span>标题党</span><div>${noiseHitChips(hits.clickbait.map(word => ({ word })), chip)}</div></div>
            <div class="zhihuE_NxBlock"><span>价值</span><div>${noiseHitChips(hits.value, chip)}</div></div>
            <div class="zhihuE_NxBlock"><span>口味新词</span><div>${noiseHitChips(learnedHits, chip)}</div></div>
        </div>
    </div>
    ${title ? `<p class="zhihuE_NxQuote">${escapeHtml(title.slice(0, 180))}</p>` : ''}
    ${href ? `<p class="zhihuE_NxLink">${escapeHtml(href)}</p>` : ''}
    ${notes.length ? `<p class="zhihuE_NxNote">${notes.map(escapeHtml).join(' · ')}</p>` : ''}`;
}

export function showNoiseExplain(card, titleCss) {
    const existing = document.querySelector('.zhihuE_NxHost');
    if (existing) existing.remove();
    const { title, body } = cardNoiseText(card, titleCss);
    if (!title && !body) return;
    const result = scoreFeedNoise(title, body);
    const host = document.createElement('div');
    host.className = 'zhihuE_NxHost';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>${explainCss}</style>
<div class="zhihuE_NxMask"><div class="zhihuE_NxCard"></div></div>`;
    const mask = shadow.querySelector('.zhihuE_NxMask');
    const pane = shadow.querySelector('.zhihuE_NxCard');
    const theme = document.documentElement.getAttribute('data-theme') || '';
    if (theme === 'dark') mask.setAttribute('data-theme', 'dark');
    pane.innerHTML = noiseExplainHtml(title, body, result, cardNoiseLink(card));
    const close = () => {
        document.removeEventListener('keydown', onKey, true);
        host.remove();
    };
    const onKey = event => {
        if (event.key === 'Escape') close();
    };
    mask.addEventListener('click', event => {
        if (event.target === mask) close();
    });
    pane.querySelector('.zhihuE_NxClose').onclick = close;
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(host);
}

export let noiseExplainBound = false;
export function bindNoiseExplain() {
    if (noiseExplainBound) return;
    noiseExplainBound = true;
    document.addEventListener('click', event => {
        const tag = event.target.closest('.zhihu-plus-noise-tag');
        if (!tag) return;
        event.preventDefault();
        event.stopPropagation();
        const card = tag.closest('[data-zhihu-plus-noise]') || tag.parentElement;
        showNoiseExplain(card, tag.dataset.titleCss || '');
    }, true);
}

export function sanitizeZhihuUrl(raw) {
    try {
        const u = new URL(String(raw || ''), location.href);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
        if (!/(^|\.)zhihu\.com$/.test(u.hostname)) return '';
        u.hash = '';
        return u.href;
    } catch {
        return '';
    }
}

export function cardNoiseLink(card) {
    if (!card) return '';
    const candidates = [];
    const titleA = card.querySelector('h2.ContentItem-title a:not(.zhihu_e_toQuestion)');
    if (titleA) candidates.push(titleA);
    const hotTitle = card.querySelector('h2.HotItem-title');
    if (hotTitle) {
        const hotA = hotTitle.closest('a') || hotTitle.querySelector('a');
        if (hotA) candidates.push(hotA);
    }
    card.querySelectorAll('a[data-za-detail-view-id][href], .HotItem-content a[href]').forEach(a => candidates.push(a));
    const meta = card.querySelector('meta[itemprop="url"]');
    if (meta) candidates.push(meta);
    for (const el of candidates) {
        const url = sanitizeZhihuUrl(el.href || el.getAttribute('href') || el.content);
        if (url) return url;
    }
    return '';
}

export function cardNoiseText(card, titleCss) {
    let title = '';
    if (titleCss) {
        const el = card.querySelector(titleCss);
        if (el) title = el.content || el.textContent || '';
    }
    if (!title) {
        const fallback = card.querySelector('h2.ContentItem-title, h2.HotItem-title, .ContentItem-title, a[data-za-detail-view-id]');
        if (fallback) title = fallback.content || fallback.textContent || '';
    }
    const bodyEl = card.querySelector('.RichContent-inner, .ContentItem-excerpt, .HotItem-excerpt, .RichText.ztext');
    const body = bodyEl ? String(bodyEl.textContent || '').slice(0, 280) : '';
    return { title: title.trim(), body };
}

export function tasteCardKey(card, titleCss) {
    const href = cardNoiseLink(card);
    if (href) return href;
    const { title } = cardNoiseText(card, titleCss);
    return title ? 't:' + title.slice(0, 96) : '';
}

export function paintTasteBar(card, titleCss) {
    if (!tasteEnabled()) {
        const old = card.querySelector('.zhihu-plus-taste');
        if (old) old.remove();
        return;
    }
    const key = tasteCardKey(card, titleCss);
    if (!key) return;
    const anchor = noiseBadgeAnchor(card);
    let bar = card.querySelector('.zhihu-plus-taste');
    if (!bar) {
        bar = document.createElement('span');
        bar.className = 'zhihu-plus-taste';
        bar.innerHTML = '<button type="button" data-taste="like">喜欢</button><button type="button" data-taste="dislike">不感兴趣</button>';
        const host = anchor && (anchor.closest('h2') || anchor.parentElement);
        if (host) host.appendChild(bar);
        else {
            ensureCardPosition(card);
            card.insertAdjacentElement('afterbegin', bar);
        }
    }
    const action = getTastePrefs().actions[key] || '';
    bar.dataset.key = key;
    bar.dataset.titleCss = titleCss || '';
    bar.querySelector('[data-taste="like"]').classList.toggle('is-on', action === 'like');
    bar.querySelector('[data-taste="dislike"]').classList.toggle('is-on', action === 'dislike');
}

export let tasteClickBound = false;
export function bindTasteClicks() {
    if (tasteClickBound) return;
    tasteClickBound = true;
    document.addEventListener('click', event => {
        const btn = event.target.closest('.zhihu-plus-taste [data-taste]');
        if (!btn) return;
        event.preventDefault();
        event.stopPropagation();
        const bar = btn.closest('.zhihu-plus-taste');
        const card = bar.closest('[data-zhihu-plus-noise]') || bar.closest('.Card, .HotItem, .List-item, .TopstoryItem');
        if (!card) return;
        applyCardTaste(card, bar.dataset.titleCss || '', btn.dataset.taste);
    }, true);
}

export const tastePending = new Set();

export function applyCardTaste(card, titleCss, nextAction) {
    if (!tasteEnabled() || (nextAction !== 'like' && nextAction !== 'dislike')) return;
    const key = tasteCardKey(card, titleCss);
    if (!key || tastePending.has(key)) return;
    const run = () => {
        tastePending.delete(key);
        applyCardTasteNow(card, titleCss, nextAction);
    };
    if (jiebaReady || jiebaUnavailable) {
        applyCardTasteNow(card, titleCss, nextAction);
        return;
    }
    tastePending.add(key);
    ensureJieba().then(run);
}

export function applyCardTasteNow(card, titleCss, nextAction) {
    const { title, body } = cardNoiseText(card, titleCss);
    const key = tasteCardKey(card, titleCss);
    if (!key) return;
    const prefs = getTastePrefs();
    const prev = prefs.actions[key] || '';
    const signals = collectTasteSignals(title, body);
    if (prev) applyTasteSignals(prefs, signals, prev, -1);
    if (prev === nextAction) delete prefs.actions[key];
    else {
        applyTasteSignals(prefs, signals, nextAction, 1);
        prefs.actions[key] = nextAction;
        prefs.clicks = (prefs.clicks || 0) + 1;
        const actionKeys = Object.keys(prefs.actions);
        if (actionKeys.length > 400) delete prefs.actions[actionKeys[0]];
    }
    saveTastePrefs(prefs);
    const lexHits = signals.noiseWords.length + signals.valueWords.length + signals.cats.length;
    const newHits = (signals.learned || []).length;
    const current = prefs.actions[key] || '';
    if (!current) notify('已撤销这次口味。');
    else if (lexHits || newHits) {
        notify(current === 'dislike'
            ? `已隐藏。对照词库 ${lexHits} 个，新实词 ${newHits} 个已记入口味。`
            : `已记下喜欢。对照词库 ${lexHits} 个，新实词 ${newHits} 个。`);
    } else {
        notify(current === 'dislike'
            ? '已隐藏这条。分词后没打中可学习的词。'
            : '已记下喜欢。分词后没打中可学习的词。');
    }
    refreshNoiseFeed();
}

export function resetNoiseCardVisual(card) {
    card.classList.remove('zhihu-plus-noise-hide', 'zhihu-plus-noise-demote');
    card.hidden = false;
    card.style.display = '';
    delete card.dataset.zhihuPlusNoise;
    delete card.dataset.zhihuPlusTasteGen;
}

export function refreshNoiseFeed() {
    runtime.noiseTasteGen += 1;
    hiddenNoiseItems.length = 0;
    resetNoiseTray();
    document.querySelectorAll('[data-zhihu-plus-noise]').forEach(resetNoiseCardVisual);
    if (typeof runtime.noiseRescan === 'function') runtime.noiseRescan();
}

export const hiddenNoiseItems = [];

export function resetNoiseTray() {
    hiddenNoiseItems.length = 0;
    const tray = document.getElementById('zhihu-plus-noise-tray');
    const panel = document.getElementById('zhihu-plus-noise-tray-panel');
    if (tray) tray.remove();
    if (panel) panel.remove();
}

export function renderNoiseTray() {
    let tray = document.getElementById('zhihu-plus-noise-tray');
    const panel = document.getElementById('zhihu-plus-noise-tray-panel');
    if (!hiddenNoiseItems.length) {
        if (tray) tray.remove();
        if (panel) panel.remove();
        return;
    }
    if (!tray) {
        tray = document.createElement('button');
        tray.id = 'zhihu-plus-noise-tray';
        tray.type = 'button';
        tray.addEventListener('click', toggleNoiseTrayPanel);
        document.body.appendChild(tray);
    }
    tray.textContent = `已过滤 ${hiddenNoiseItems.length} 条`;
    if (panel) fillNoiseTrayPanel(panel);
}

export function fillNoiseTrayPanel(panel) {
    panel.innerHTML = `<h4>已过滤 ${hiddenNoiseItems.length} 条</h4>` + hiddenNoiseItems.map((item, index) => {
        const why = item.why || (item.rule && item.rule.action === 'hide'
            ? '规则隐藏'
            : item.rule && item.rule.action === 'demote'
                ? '规则降权'
                : '分数隐藏');
        const title = item.title || '（无标题）';
        return `<button type="button" data-hidden="${index}"><b>${item.score}</b>${escapeHtml(title.slice(0, 42))}<div style="margin-top:4px;font-size:12px;color:#8a8a8a;">${why}</div></button>`;
    }).join('');
    panel.querySelectorAll('[data-hidden]').forEach(btn => {
        btn.onclick = () => {
            const item = hiddenNoiseItems[Number(btn.dataset.hidden)];
            if (item) showNoiseExplain(item.card, item.titleCss || '');
        };
    });
}

export function toggleNoiseTrayPanel() {
    const existing = document.getElementById('zhihu-plus-noise-tray-panel');
    if (existing) {
        existing.remove();
        return;
    }
    const panel = document.createElement('div');
    panel.id = 'zhihu-plus-noise-tray-panel';
    fillNoiseTrayPanel(panel);
    document.body.appendChild(panel);
}

export function applyNoiseToCard(card, titleCss) {
    if (!card) return;
    const gen = String(runtime.noiseTasteGen);
    if (card.dataset.zhihuPlusNoise && card.dataset.zhihuPlusTasteGen === gen) return;
    if (card.dataset.zhihuPlusNoise) resetNoiseCardVisual(card);
    const { title, body } = cardNoiseText(card, titleCss);
    if (!title && !body) return;
    const { final, rule } = scoreFeedNoise(title, body);
    const rounded = Math.round(final);
    const tasteKey = tasteEnabled() ? tasteCardKey(card, titleCss) : '';
    const tasteAction = tasteKey ? (getTastePrefs().actions[tasteKey] || '') : '';
    card.dataset.zhihuPlusNoise = String(rounded);
    card.dataset.zhihuPlusTasteGen = gen;
    const mode = readFilterMode();
    const hideByRule = rule && rule.action === 'hide';
    const demoteByRule = rule && (rule.action === 'demote' || rule.action === 'hide');
    const hideByTaste = tasteAction === 'dislike';
    const keepByTaste = tasteAction === 'like';
    const hide = !keepByTaste && (hideByTaste || (mode === 'hide' && (hideByRule || final >= NOISE_HIDE)));
    const demote = !keepByTaste && !hide && (mode === 'hide' || mode === 'demote') && (demoteByRule || final >= NOISE_DEMOTE);
    if (hide) {
        card.classList.add('zhihu-plus-noise-hide');
        card.hidden = true;
        card.style.display = 'none';
        hiddenNoiseItems.push({
            card, titleCss, title, score: rounded, rule,
            why: hideByTaste ? '不感兴趣' : ''
        });
        renderNoiseTray();
        return;
    }
    if (demote) {
        card.classList.add('zhihu-plus-noise-demote');
        ensureCardPosition(card);
    }
    if (menuValue('menu_noiseBadge')) paintNoiseBadge(card, rounded, titleCss);
    paintTasteBar(card, titleCss);
}

export function blockKeywords(type) {
    if (!menuValue('menu_noiseScore')) return;
    if (!jiebaReady && !jiebaUnavailable) {
        ensureJieba().then(() => blockKeywords(type));
        return;
    }
    runtime.noiseIndex = null;
    injectNoiseStyles();
    bindTasteClicks();

    switch (type) {
        case 'index':
            blockKeywordsFeed('.Card.TopstoryItem.TopstoryItem-isRecommend', 'Card TopstoryItem TopstoryItem-isRecommend');
            break;
        case 'topic':
            blockKeywordsFeed('.List-item.TopicFeedItem', 'List-item TopicFeedItem');
            break;
        case 'people':
            blockKeywordsFeed('.List-item', 'List-item');
            break;
        case 'collection':
            blockKeywordsFeed('.Card.CollectionDetailPageItem', 'Card CollectionDetailPageItem');
            break;
        case 'search':
            blockKeywordsSearch();
            break;
        case 'comment':
            blockKeywordsComment();
            break;
    }
}

export function blockKeywordsFeed(selector, className) {
    const scan = () => {
        if (location.pathname === '/hot') {
            document.querySelectorAll('.HotItem').forEach(item => applyNoiseToCard(item, 'h2.HotItem-title'));
        } else {
            document.querySelectorAll(selector).forEach(item => {
                applyNoiseToCard(item, 'h2.ContentItem-title meta[itemprop="name"], meta[itemprop="headline"]');
            });
        }
    };
    runtime.noiseRescan = scan;
    scan();
    window.addEventListener('urlchange', () => {
        resetNoiseTray();
        setTimeout(scan, 1000);
    });
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.className === className) {
                applyNoiseToCard(target, 'h2.ContentItem-title meta[itemprop="name"], meta[itemprop="headline"]');
            }
        });
    });
}

export function blockKeywordsSearch() {
    const scan = () => {
        if (!location.search.includes('type=content')) return;
        document.querySelectorAll('.HotLanding-contentItem, .Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"], .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"]').forEach(item => {
            applyNoiseToCard(item, 'a[data-za-detail-view-id]');
        });
    };
    runtime.noiseRescan = scan;
    setTimeout(scan, 2000);
    window.addEventListener('urlchange', () => {
        resetNoiseTray();
        setTimeout(scan, 1000);
    });
    observeTree(mutations => {
        if (!location.search.includes('type=content')) return;
        forAddedElements(mutations, target => {
            if (target.tagName === 'DIV' && target.className === '') {
                const tt = target.querySelector('div[class="Card SearchResult-Card"][data-za-detail-view-path-module="AnswerItem"], div[class="Card SearchResult-Card"][data-za-detail-view-path-module="PostItem"]');
                if (tt) applyNoiseToCard(target.childNodes[0], 'a[data-za-detail-view-id]');
            }
        });
    });
}

export function blockKeywordsComment() {
    if (readFilterMode() === 'off') return;
    const filterComment = comment => {
        const content = comment.querySelector('.RichText');
        if (!content || content.dataset.zhihuPlusNoise) return;
        const score = scoreText(content.textContent || '');
        const mode = readFilterMode();
        content.dataset.zhihuPlusNoise = String(Math.round(score.final));
        const hide = mode === 'hide' && ((score.rule && score.rule.action === 'hide') || score.final >= NOISE_HIDE);
        const demote = !hide && (mode === 'hide' || mode === 'demote')
            && ((score.rule && score.rule.action) || score.final >= NOISE_DEMOTE);
        if (hide) {
            content.textContent = '[该评论已降噪]';
        } else if (demote) {
            content.style.opacity = '0.45';
        }
    };
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            target.querySelectorAll('.CommentItemV2-metaSibling').forEach(filterComment);
        });
    });
}
