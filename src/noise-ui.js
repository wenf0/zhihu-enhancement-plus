function injectNoiseStyles() {
    injectStyle('zhihu-plus-noise', `
        .zhihu-plus-noise-hide {display: none !important;}
        .zhihu-plus-noise-demote {opacity: .42; transition: opacity .2s;}
        .zhihu-plus-noise-demote:hover {opacity: .88;}
        #zhihu-plus-noise-tray {position:fixed;right:20px;bottom:92px;z-index:2147483000;padding:8px 14px;border:0;border-radius:999px;background:#1d1d1f;color:#fff;font:12px/1.4 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;cursor:pointer;box-shadow:0 10px 28px rgba(0,0,0,.22);}
        #zhihu-plus-noise-tray-panel {position:fixed;right:20px;bottom:140px;z-index:2147483000;width:min(360px,92vw);max-height:min(420px,60vh);overflow:auto;padding:14px;border-radius:16px;background:#fff;box-shadow:0 18px 50px rgba(0,0,0,.22);font:13px/1.5 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;color:#1d1d1f;}
        #zhihu-plus-noise-tray-panel h4 {margin:0 0 10px;font-size:13px;}
        #zhihu-plus-noise-tray-panel button {display:block;width:100%;margin:0 0 8px;padding:8px 10px;border:1px solid #eee;border-radius:10px;background:#fafafa;text-align:left;font:inherit;cursor:pointer;}
        #zhihu-plus-noise-tray-panel button:hover {background:#fff;border-color:#d4d4d4;}
        #zhihu-plus-noise-tray-panel b {float:right;font-variant-numeric:tabular-nums;}
        .zhihu-plus-noise-tag {display:inline-flex !important;align-items:center;vertical-align:middle;position:static !important;top:auto !important;right:auto !important;z-index:6;margin:0 0 0 8px !important;padding:1px 7px !important;border-radius:999px;font:inherit;font-size:11px !important;font-weight:650;font-variant-numeric:tabular-nums;line-height:1.45;white-space:nowrap;pointer-events:auto;cursor:pointer;width:auto !important;min-width:0 !important;height:auto !important;float:none !important;appearance:none;-webkit-appearance:none;--t:0;background:hsla(calc(145 - 145 * var(--t)), calc(42% + 53% * var(--t)), calc(94% - 42% * var(--t)), calc(0.78 + 0.22 * var(--t)));color:hsl(calc(145 - 145 * var(--t)), calc(48% + 40% * var(--t)), calc(26% + 56% * var(--t)));border:1px solid hsla(calc(145 - 145 * var(--t)), 72%, 38%, calc(0.1 + 0.42 * var(--t)));box-shadow:0 0 calc(2px + 12px * var(--t)) hsla(calc(145 - 145 * var(--t)), 90%, 48%, calc(0.04 + 0.42 * var(--t)));text-shadow:0 1px 2px rgba(0,0,0,calc(0.08 + 0.28 * var(--t)));}
        [data-theme="dark"] .zhihu-plus-noise-tag {background:hsla(calc(145 - 145 * var(--t)), calc(48% + 42% * var(--t)), calc(20% + 10% * var(--t)), calc(0.62 + 0.32 * var(--t)));color:hsl(calc(145 - 145 * var(--t)), 86%, calc(86% - 6% * var(--t)));}
        .zhihu-plus-taste {display:inline-flex !important;align-items:center;gap:6px;margin:0 0 0 8px;vertical-align:middle;position:relative;z-index:7;}
        .zhihu-plus-taste button {height:22px;padding:0 8px;border:1px solid rgba(0,0,0,.08);border-radius:999px;background:#f4f4f5;color:#666;font:11px/22px -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;cursor:pointer;}
        .zhihu-plus-taste button:hover {border-color:#bbb;color:#1d1d1f;}
        .zhihu-plus-taste button.is-on[data-taste="like"] {background:#e8f5e9;color:#2e7d32;border-color:#c8e6c9;}
        .zhihu-plus-taste button.is-on[data-taste="dislike"] {background:#fce8e8;color:#a33;border-color:#f0cfcf;}
        [data-theme="dark"] .zhihu-plus-taste button {background:#343a44;border-color:#3c434d;color:#c5ced8;}
        [data-theme="dark"] .zhihu-plus-taste button.is-on[data-taste="like"] {background:#2f3a34;color:#8fd19a;border-color:#3d5244;}
        [data-theme="dark"] .zhihu-plus-taste button.is-on[data-taste="dislike"] {background:#3a3232;color:#f0b6b6;border-color:#534040;}
    `);
    bindNoiseExplain();
}

function ensureCardPosition(card) {
    if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
}

function noiseBadgeAnchor(card) {
    const titleA = card.querySelector('h2.ContentItem-title a:not(.zhihu_e_toQuestion)');
    if (titleA) return titleA;
    const hotTitle = card.querySelector('h2.HotItem-title');
    if (hotTitle) return hotTitle;
    const searchA = card.querySelector('a[data-za-detail-view-id]');
    if (searchA) return searchA;
    return card.querySelector('h2, .ContentItem-title');
}

function paintNoiseBadge(card, score, titleCss) {
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

function noisePartRows(parts) {
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

function mergeNoiseHits(a, b) {
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

function noiseHitChips(list, fmt) {
    if (!list || !list.length) return '<span class="zhihuE_NxEmpty">无</span>';
    const max = 36;
    const shown = list.slice(0, max);
    const extra = list.length - shown.length;
    return shown.map(fmt).join('') + (extra > 0 ? `<span class="zhihuE_NxMore">+${extra}</span>` : '');
}

function noiseExplainHtml(title, body, result, href) {
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

function showNoiseExplain(card, titleCss) {
    const existing = document.querySelector('.zhihuE_NxHost');
    if (existing) existing.remove();
    const { title, body } = cardNoiseText(card, titleCss);
    if (!title && !body) return;
    const result = scoreFeedNoise(title, body);
    const host = document.createElement('div');
    host.className = 'zhihuE_NxHost';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>
:host {all:initial;display:block;position:fixed;inset:0;z-index:2147483646;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;color:#1d1d1f;line-height:1.5;}
*,*::before,*::after {box-sizing:border-box;}
button {font:inherit;color:inherit;}
.zhihuE_NxMask {position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(18,18,18,.42);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);}
.zhihuE_NxCard {width:min(1120px,96vw);max-height:min(960px,94vh);overflow:auto;padding:36px 40px 32px;border-radius:32px;background:#fff;box-shadow:0 32px 90px rgba(0,0,0,.28);}
.zhihuE_NxHead {display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:22px;}
.zhihuE_NxKicker {margin:0 0 4px;font-size:11px;letter-spacing:.18em;color:#aaa;text-transform:uppercase;}
.zhihuE_NxHead h3 {margin:0;font-size:26px;font-weight:650;}
.zhihuE_NxClose {flex:none;width:36px;height:36px;border:0;border-radius:50%;background:#f4f4f5;color:#666;cursor:pointer;font-size:18px;line-height:1;}
.zhihuE_NxClose:hover {background:#1d1d1f;color:#fff;}
.zhihuE_NxHero {display:flex;align-items:center;gap:22px;padding:22px 24px;border-radius:22px;margin-bottom:22px;border:1px solid #eee;}
.zhihuE_NxHero.is-keep {background:#f6faf6;border-color:#dbe8db;}
.zhihuE_NxHero.is-demote {background:#faf7f1;border-color:#eadfc8;}
.zhihuE_NxHero.is-hide {background:#faf5f5;border-color:#ead4d4;}
.zhihuE_NxScore {font-size:64px;font-weight:650;letter-spacing:-.04em;line-height:1;font-variant-numeric:tabular-nums;}
.zhihuE_NxVerdict {font-size:18px;font-weight:650;}
.zhihuE_NxMix {margin:6px 0 0;font-size:13px;line-height:1.55;color:#8a8a8a;}
.zhihuE_NxBody {display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,.95fr);gap:8px 40px;align-items:start;}
.zhihuE_NxFormula {margin:0 0 16px;font-size:14px;color:#666;font-variant-numeric:tabular-nums;}
.zhihuE_NxRows {display:flex;flex-direction:column;gap:12px;}
.zhihuE_NxRow {display:grid;grid-template-columns:28px 1fr auto;gap:12px;align-items:center;}
.zhihuE_NxKey {font-size:14px;font-weight:700;}
.zhihuE_NxName {font-size:12px;color:#8a8a8a;margin-bottom:5px;}
.zhihuE_NxTrack {height:7px;border-radius:999px;background:#f0f0f0;overflow:hidden;}
.zhihuE_NxTrack i {display:block;height:100%;border-radius:inherit;background:#1d1d1f;}
.zhihuE_NxMath {font-size:13px;color:#8a8a8a;font-variant-numeric:tabular-nums;white-space:nowrap;}
.zhihuE_NxMath b {color:#1d1d1f;font-weight:650;margin-left:6px;}
.zhihuE_NxHits {display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;margin:0;}
.zhihuE_NxBlock span {display:block;font-size:11px;letter-spacing:.12em;color:#aaa;margin-bottom:6px;text-transform:uppercase;}
.zhihuE_NxBlock div {display:flex;flex-wrap:wrap;gap:6px;}
.zhihuE_NxChip {display:inline-flex;align-items:center;gap:6px;padding:4px 8px 4px 10px;border-radius:999px;background:#f6f6f6;font-size:12px;}
.zhihuE_NxChip b {font-weight:650;color:#888;}
.zhihuE_NxChip.is-win {background:#1d1d1f;color:#fff;}
.zhihuE_NxChip.is-win b {color:rgba(255,255,255,.72);}
.zhihuE_NxEmpty,.zhihuE_NxMore {font-size:12px;color:#bbb;}
.zhihuE_NxQuote {margin:20px 0 0;font-size:14px;line-height:1.65;color:#666;}
.zhihuE_NxLink {margin:6px 0 0;font-size:12px;line-height:1.5;color:#8a8a8a;word-break:break-all;user-select:all;}
.zhihuE_NxNote {margin:10px 0 0;font-size:12px;line-height:1.65;color:#8a8a8a;}
@media (max-width: 820px) {
  .zhihuE_NxCard {width:min(720px,96vw);padding:24px 22px 20px;border-radius:24px;}
  .zhihuE_NxBody,.zhihuE_NxHits {grid-template-columns:1fr;}
}
[data-theme="dark"] .zhihuE_NxCard {background:#2b2f36;color:#e8edf2;}
[data-theme="dark"] .zhihuE_NxClose,[data-theme="dark"] .zhihuE_NxChip,[data-theme="dark"] .zhihuE_NxTrack {background:#343a44;color:#c5ced8;}
[data-theme="dark"] .zhihuE_NxChip.is-win {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_NxChip.is-win b {color:rgba(29,29,31,.55);}
[data-theme="dark"] .zhihuE_NxClose:hover {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_NxHero {border-color:#3c434d;}
[data-theme="dark"] .zhihuE_NxHero.is-keep {background:#2f3a34;border-color:#3d5244;}
[data-theme="dark"] .zhihuE_NxHero.is-demote {background:#3a372f;border-color:#534832;}
[data-theme="dark"] .zhihuE_NxHero.is-hide {background:#3a3232;border-color:#534040;}
[data-theme="dark"] .zhihuE_NxKicker,[data-theme="dark"] .zhihuE_NxMix,[data-theme="dark"] .zhihuE_NxName,[data-theme="dark"] .zhihuE_NxMath,[data-theme="dark"] .zhihuE_NxNote,[data-theme="dark"] .zhihuE_NxLink,[data-theme="dark"] .zhihuE_NxBlock span {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_NxTrack i,[data-theme="dark"] .zhihuE_NxMath b {background:#e8edf2;color:#e8edf2;}
</style>
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

let noiseExplainBound = false;
function bindNoiseExplain() {
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

function sanitizeZhihuUrl(raw) {
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

function cardNoiseLink(card) {
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

function cardNoiseText(card, titleCss) {
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

function tasteCardKey(card, titleCss) {
    const href = cardNoiseLink(card);
    if (href) return href;
    const { title } = cardNoiseText(card, titleCss);
    return title ? 't:' + title.slice(0, 96) : '';
}

function paintTasteBar(card, titleCss) {
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

let tasteClickBound = false;
function bindTasteClicks() {
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

const tastePending = new Set();

function applyCardTaste(card, titleCss, nextAction) {
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

function applyCardTasteNow(card, titleCss, nextAction) {
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

function resetNoiseCardVisual(card) {
    card.classList.remove('zhihu-plus-noise-hide', 'zhihu-plus-noise-demote');
    card.hidden = false;
    card.style.display = '';
    delete card.dataset.zhihuPlusNoise;
    delete card.dataset.zhihuPlusTasteGen;
}

function refreshNoiseFeed() {
    noiseTasteGen += 1;
    hiddenNoiseItems.length = 0;
    resetNoiseTray();
    document.querySelectorAll('[data-zhihu-plus-noise]').forEach(resetNoiseCardVisual);
    if (typeof noiseRescan === 'function') noiseRescan();
}

const hiddenNoiseItems = [];

function resetNoiseTray() {
    hiddenNoiseItems.length = 0;
    const tray = document.getElementById('zhihu-plus-noise-tray');
    const panel = document.getElementById('zhihu-plus-noise-tray-panel');
    if (tray) tray.remove();
    if (panel) panel.remove();
}

function renderNoiseTray() {
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

function fillNoiseTrayPanel(panel) {
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

function toggleNoiseTrayPanel() {
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

function applyNoiseToCard(card, titleCss) {
    if (!card) return;
    const gen = String(noiseTasteGen);
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

function blockKeywords(type) {
    if (!menuValue('menu_noiseScore')) return;
    if (!jiebaReady && !jiebaUnavailable) {
        ensureJieba().then(() => blockKeywords(type));
        return;
    }
    noiseIndex = null;
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

function blockKeywordsFeed(selector, className) {
    const scan = () => {
        if (location.pathname === '/hot') {
            document.querySelectorAll('.HotItem').forEach(item => applyNoiseToCard(item, 'h2.HotItem-title'));
        } else {
            document.querySelectorAll(selector).forEach(item => {
                applyNoiseToCard(item, 'h2.ContentItem-title meta[itemprop="name"], meta[itemprop="headline"]');
            });
        }
    };
    noiseRescan = scan;
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

function blockKeywordsSearch() {
    const scan = () => {
        if (!location.search.includes('type=content')) return;
        document.querySelectorAll('.HotLanding-contentItem, .Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"], .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"]').forEach(item => {
            applyNoiseToCard(item, 'a[data-za-detail-view-id]');
        });
    };
    noiseRescan = scan;
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

function blockKeywordsComment() {
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
