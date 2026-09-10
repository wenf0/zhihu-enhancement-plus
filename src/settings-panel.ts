import { GM_getValue, GM_registerMenuCommand, GM_unregisterMenuCommand, GM_openInTab } from '$';
import settingsCss from './styles/settings.css?inline';
import { MENU_ITEMS, menuValue, menuSet, settingsMetaText } from './config';
import { escapeHtml } from './utils';
import { state } from './state';
import {
    settingsSwitchRow, settingsFilterRow, settingsToggleCard, settingsNoiseCards, settingsTypeCards,
    settingsNoiseFormulaHtml, mountNoiseTestPane, mountKeywordEditor, mountTastePane, mountListEditor,
    mountLexiconEditor, mountIoPane
} from './settings-panes';

export function openSettingsPanel() {
    if (document.querySelector('.zhihuE_StHost')) return;

    const lookKeys = ['menu_lowProfile', 'menu_fullWidth', 'menu_blankTitleFavicon', 'menu_cleanTitles', 'menu_cleanSearch'];
    const readKeys = ['menu_defaultCollapsedAnswer', 'menu_collapsedAnswer', 'menu_collapsedNowAnswer', 'menu_backToTop', 'menu_questionRichTextMore', 'menu_publishTop', 'menu_typeTips', 'menu_toQuestion'];
    const navItems = [
        { id: 'look', name: '外观', hint: '页面气质' },
        { id: 'read', name: '阅读', hint: '浏览节奏' }
    ];
    const blockItems = [
        { id: 'block-users', name: '屏蔽用户', hint: '黑名单' },
        { id: 'block-words', name: '关键词', hint: '噪音与词库' },
        { id: 'block-types', name: '指定类别', hint: '内容类型' }
    ];
    const dataItem = { id: 'data', name: '配置', hint: '导入导出' };
    let current = 'look';
    let wordTab = 'levels';

    const html = `<style class="zhihuE_StStyle">${settingsCss}</style>
<div class="zhihuE_StMask">
  <div class="zhihuE_StRoot">
    <div class="zhihuE_StHead">
      <div>
        <p class="zhihuE_StKicker">Zhihu Enhancement Plus</p>
        <h3 class="zhihuE_StTitle">设置</h3>
        <p class="zhihuE_StMeta"></p>
        <p class="zhihuE_StTips">开关即时保存，刷新后生效。屏蔽相关已放在左侧二级菜单，内容直接铺在右侧。</p>
      </div>
      <button type="button" class="zhihuE_StClose" aria-label="关闭">×</button>
    </div>
    <div class="zhihuE_StMain">
      <div class="zhihuE_StNav"></div>
      <div class="zhihuE_StBody"></div>
    </div>
  </div>
</div>`;

    const host = document.createElement('div');
    host.className = 'zhihuE_StHost';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = html;
    document.body.appendChild(host);
    const mask = shadow.querySelector('.zhihuE_StMask');
    const navEl = mask.querySelector('.zhihuE_StNav');
    const bodyEl = mask.querySelector('.zhihuE_StBody');
    const metaEl = mask.querySelector('.zhihuE_StMeta');
    const pageTheme = document.documentElement.getAttribute('data-theme')
        || document.documentElement.getAttribute('data-theme-type')
        || document.body.getAttribute('data-theme')
        || '';
    if (pageTheme === 'dark') mask.setAttribute('data-theme', 'dark');

    const refreshMeta = () => {
        metaEl.textContent = settingsMetaText();
    };

    const close = () => {
        document.removeEventListener('keydown', onKey);
        host.remove();
    };
    const onKey = event => {
        if (event.key === 'Escape') close();
    };

    const navButton = (item, extra = '') =>
        `<button type="button" class="zhihuE_StNavBtn${extra}${item.id === current ? ' zhihuE_isOn' : ''}" data-id="${item.id}"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.hint)}</span></button>`;

    const renderNav = () => {
        navEl.innerHTML = navItems.map(item => navButton(item)).join('') +
            `<div class="zhihuE_StGroup"><div class="zhihuE_StGroupLabel">屏蔽</div>${blockItems.map(item => navButton(item, ' zhihuE_StNavSub')).join('')}</div>` +
            navButton(dataItem) +
            '<div class="zhihuE_StNavFoot"><button type="button" class="zhihuE_StLink">反馈与建议</button></div>';
    };

    const renderBody = () => {
        const scoreOn = !!menuValue('menu_noiseScore');
        const usersOn = !!menuValue('menu_blockUsers');
        const fill = (current === 'block-users' && usersOn) || (current === 'block-words' && scoreOn) || current === 'data';
        bodyEl.classList.toggle('is-fill', fill);
        if (current === 'look') {
            bodyEl.innerHTML = lookKeys.map(key => settingsSwitchRow(key)).join('');
            return;
        }
        if (current === 'read') {
            bodyEl.innerHTML = readKeys.map(key => settingsSwitchRow(key)).join('');
            return;
        }
        if (current === 'block-users') {
            bodyEl.innerHTML = settingsSwitchRow('menu_blockUsers') + (usersOn
                ? ''
                : '<p class="zhihuE_StPaneTips">关闭后不再屏蔽名单中的用户。名单已折叠，打开后仍用上次的名单。</p>');
            if (!usersOn) return;
            mountListEditor(bodyEl, {
                storageKey: 'menu_customBlockUsers',
                placeholder: '例如：盐选推荐, 故事档案局',
                tips: '用户名需完全匹配。预置名单只能开关，自己加的可以开关或删除。'
            });
            return;
        }
        if (current === 'block-words') {
            bodyEl.innerHTML = settingsSwitchRow('menu_noiseScore') + (scoreOn
                ? settingsFilterRow() +
                    settingsSwitchRow('menu_noiseBadge', ' is-sub') +
                    settingsSwitchRow('menu_noiseTaste', ' is-sub') +
                    `<div class="zhihuE_StTabs">
                    <button type="button" class="zhihuE_StTab${wordTab === 'levels' ? ' zhihuE_isOn' : ''}" data-tab="levels">过滤档位</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'custom' ? ' zhihuE_isOn' : ''}" data-tab="custom">自定义词</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'lexicon' ? ' zhihuE_isOn' : ''}" data-tab="lexicon">噪音词库</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'taste' ? ' zhihuE_isOn' : ''}" data-tab="taste">口味</button>
                    <button type="button" class="zhihuE_StTab${wordTab === 'test' ? ' zhihuE_isOn' : ''}" data-tab="test">试算</button>
                </div>
                <div class="zhihuE_StPane${wordTab === 'levels' || wordTab === 'test' || wordTab === 'taste' ? '' : ' is-fill'}"></div>`
                : '<p class="zhihuE_StPaneTips">评分关闭后，过滤和角标都不会生效。档位、词库和试算已折叠，打开后仍用上次的设置。</p>');
            if (!scoreOn) return;
            const pane = bodyEl.querySelector('.zhihuE_StPane');
            if (wordTab === 'levels') {
                pane.innerHTML = settingsNoiseFormulaHtml() + settingsNoiseCards().map(settingsToggleCard).join('');
            } else if (wordTab === 'custom') {
                mountKeywordEditor(pane);
            } else if (wordTab === 'lexicon') {
                mountLexiconEditor(pane);
            } else if (wordTab === 'taste') {
                mountTastePane(pane);
            } else {
                mountNoiseTestPane(pane);
            }
            return;
        }
        if (current === 'block-types') {
            bodyEl.innerHTML = '<p class="zhihuE_StPaneTips">勾选后隐藏对应类型的信息流，刷新页面后生效。</p>' +
                settingsTypeCards().map(settingsToggleCard).join('');
            return;
        }
        mountIoPane(bodyEl);
    };

    const render = () => {
        renderNav();
        renderBody();
        refreshMeta();
    };

    mask.querySelector('.zhihuE_StClose').onclick = close;
    mask.addEventListener('click', event => {
        if (event.target === mask) close();
    });
    navEl.addEventListener('click', event => {
        const link = event.target.closest('.zhihuE_StLink');
        if (link) {
            GM_openInTab('https://github.com/wenf0/zhihu-enhancement-plus/issues', { active: true, insert: true, setParent: true });
            return;
        }
        const btn = event.target.closest('.zhihuE_StNavBtn');
        if (!btn) return;
        current = btn.dataset.id;
        render();
    });
    bodyEl.addEventListener('click', event => {
        const tab = event.target.closest('.zhihuE_StTab');
        if (tab && tab.dataset.tab) {
            wordTab = tab.dataset.tab;
            renderBody();
            return;
        }
        const filterBtn = event.target.closest('[data-filter]');
        if (filterBtn && filterBtn.dataset.filter) {
            menuSet('menu_blockKeywords', filterBtn.dataset.filter);
            renderBody();
            return;
        }
        const sw = event.target.closest('[data-zplus-switch]');
        if (!sw) return;
        const key = sw.dataset.key;
        const next = !menuValue(key);
        menuSet(key, next);
        if (key === 'menu_noiseScore' || key === 'menu_blockUsers') {
            renderBody();
            return;
        }
        sw.toggleAttribute('data-on', next);
        const row = sw.closest('[data-zplus-row], [data-zplus-card]');
        if (row) row.toggleAttribute('data-on', next);
    });
    document.addEventListener('keydown', onKey);
    render();
}

export function parseWeightedWords(input, fallback = 6) {
    const out = Object.create(null);
    for (const part of String(input || '').split(/[,，|/\n\r]+/)) {
        const raw = part.trim();
        if (!raw) continue;
        const m = raw.match(/^(.+?)[:：]\s*(\d+(?:\.\d+)?)$/);
        const word = (m ? m[1] : raw).replace(/\s+/g, '');
        const weight = m ? Number(m[2]) : fallback;
        if (!word) continue;
        out[word] = Math.max(1, Math.min(20, weight));
    }
    return out;
}

export function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

export function parseWords(input) {
    return String(input || '').split(/[,，|/\n\r]+/).map(s => s.replace(/\s+/g, '')).filter(Boolean);
}

export function uniqueWords(words) {
    const seen = new Set();
    const out = [];
    for (const word of words) {
        const key = word.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(word);
    }
    return out;
}


export function registerMenuCommand() {
    for (const id of state.menuCommandIds) GM_unregisterMenuCommand(id);
    state.menuCommandIds.length = 0;
    for (const item of MENU_ITEMS) {
        state.cache[item.key] = GM_getValue(item.key);
    }
    state.menuCommandIds.push(GM_registerMenuCommand('setting', openSettingsPanel));
}
