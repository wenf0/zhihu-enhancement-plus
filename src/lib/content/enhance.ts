// @ts-nocheck
import { menuValue } from '../storage';
import { injectStyle, removeStyle, observeTree, forAddedElements, onReadyNodes, getUTC8, qs, qsa, eachMatch, on, getXpath, page } from '../utils';

/* -------------------------------------------------------------------------- */
/* 界面增强                                                                   */
/* -------------------------------------------------------------------------- */

export function fullWidthLayout() {
    if (!menuValue('menu_fullWidth')) {
        removeStyle('zhihu-plus-full-width');
        return;
    }
    injectStyle('zhihu-plus-full-width', `
        .RightSideBar,
        .Question-sideColumn,
        .SearchSideBar,
        .ContentLayout-sideColumn,
        [data-za-detail-view-path-module="RightSideBar"],
        [data-za-detail-view-path-module="QuestionSideBar"],
        .HotSearchCard,
        .GlobalSideBar {
            display: none !important;
            width: 0 !important;
            min-width: 0 !important;
            max-width: 0 !important;
            overflow: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
        }

        :root {
            --right-sidebar-width: 0px !important;
            --container-gap: 0px !important;
            --container-main-column-width: var(--container-width, 1000px) !important;
        }

        .Topstory-container,
        .Question-main,
        .Search-container,
        .ContentLayout {
            width: 100% !important;
            max-width: none !important;
            justify-content: center !important;
        }

        .ListShortcut,
        .Topstory-mainColumn,
        .Topstory-mainColumnCard,
        #TopstoryContent,
        .Topstory-recommend,
        .Question-mainColumn,
        .SearchMain,
        .ContentLayout-mainColumn {
            width: var(--container-width, 1000px) !important;
            max-width: var(--container-width, 1000px) !important;
            flex: 0 1 var(--container-width, 1000px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
    `);
}

export function lowProfileMode() {
    if (!menuValue('menu_lowProfile')) {
        removeStyle('zhihu-plus-low-profile');
        return;
    }
    injectStyle('zhihu-plus-low-profile', `
        a { color: #888 !important; }
        a:hover { color: #999 !important; }

        .Button--primary,
        .Button--blue {
            background: #ddd !important;
            border-color: #ddd !important;
            color: #666 !important;
        }

        button.VoteButton {
            background: transparent !important;
            border: none !important;
            color: #888 !important;
            padding: 0 4px !important;
            box-shadow: none !important;
        }
        button.VoteButton:hover { color: #999 !important; }
        button.VoteButton svg { display: none !important; }

        .ContentItem-more {
            background: transparent !important;
            border: none !important;
            color: #888 !important;
            padding: 0 !important;
        }
        .ContentItem-more:hover { color: #999 !important; }
        .ContentItem-more svg { display: none !important; }

        .FollowButton {
            background: transparent !important;
            border: none !important;
            color: #888 !important;
        }

        .zhihu_e_toQuestion {
            color: #666 !important;
            text-decoration: none !important;
            background: #f4f4f5 !important;
            border-color: rgba(0,0,0,.08) !important;
        }

        .ContentItem-action { color: #888 !important; }
        .ContentItem-action:hover { color: #999 !important; }

        .TopstoryTabs-link.is-active { color: #666 !important; }

        .Badge,
        span[class*="Badge"] {
            display: none !important;
        }

        a[class*="blue"],
        button[class*="blue"] {
            color: #888 !important;
        }

        .Button { box-shadow: none !important; }
    `);
    bindEmptySearchPlaceholder();
}

export function bindEmptySearchPlaceholder() {
    const nodes = document.querySelectorAll('.SearchBar-input > input, input#Popover1-toggle');
    nodes.forEach(el => {
        if (el.dataset.zhihuPlusPlaceholderBound) return;
        el.dataset.zhihuPlusPlaceholderBound = '1';
        el.placeholder = '';
        new MutationObserver(() => {
            if (el.placeholder !== '') el.placeholder = '';
        }).observe(el, { attributes: true, attributeFilter: ['placeholder'] });
    });
}

export function removeHighlightLink() {
    const replaceLink = el => {
        if (el.parentElement) el.parentElement.replaceWith(el.textContent);
    };
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.tagName !== 'A') return;
            if (target.dataset.zaNotTrackLink && target.href.includes('https://www.zhihu.com/search?q=')) replaceLink(target);
        });
    });
    document.querySelectorAll('span > a[data-za-not-track-link][href^="https://www.zhihu.com/search?q="]').forEach(replaceLink);
}

const TYPE_TIP_CLASS = 'zhihu_e_typeTip';

function typeTipKind(titleEl) {
    const item = titleEl.closest('.AnswerItem, .TopstoryQuestionAskItem, .ZVideoItem, .ZvideoItem, .PinItem, .ArticleItem');
    if (!item) return null;
    if (item.classList.contains('AnswerItem')) return { text: '问题', mod: 'question' };
    if (item.classList.contains('TopstoryQuestionAskItem')) return { text: '问题', mod: 'questionAsk' };
    if (item.classList.contains('ZVideoItem') || item.classList.contains('ZvideoItem')) return { text: '视频', mod: 'video' };
    if (item.classList.contains('PinItem')) return { text: '想法', mod: 'pin' };
    if (item.classList.contains('ArticleItem')) return { text: '文章', mod: 'article' };
    return null;
}

function clearTypeTips() {
    removeStyle('zhihu-plus-type-tips');
    qsa(`.${TYPE_TIP_CLASS}`).forEach(el => el.remove());
}

function titleTagFeaturesOn() {
    return !!(menuValue('menu_typeTips') || menuValue('menu_toQuestion'));
}

/** 标题行 flex 对齐 + 清掉旧版 ::before 双标签 + 圆角 pill 基底 */
function syncTitleTagChrome() {
    if (!titleTagFeaturesOn()) {
        removeStyle('zhihu-plus-title-chrome');
        return;
    }
    injectStyle('zhihu-plus-title-chrome', `
/* h2 子级是「问题包装 div」+ 口味条，先对齐这两块 */
h2.ContentItem-title {
  display: flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 8px !important;
  line-height: 1.5 !important;
}
/* 真正的标题/标签在内侧 schema div 里，必须也是 flex 才会垂直居中 */
h2.ContentItem-title > div[itemprop="zhihu:question"],
h2.ContentItem-title > div[itemtype*="Question"] {
  display: inline-flex !important;
  flex-wrap: wrap !important;
  align-items: center !important;
  gap: 8px !important;
  min-width: 0 !important;
  flex: 0 1 auto !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
h2.ContentItem-title a[data-za-detail-view-element_name="Title"],
h2.ContentItem-title > div[itemprop="zhihu:question"] > a:not(.zhihu_e_toQuestion),
h2.ContentItem-title > div[itemtype*="Question"] > a:not(.zhihu_e_toQuestion) {
  display: inline-flex !important;
  align-items: center !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
  min-width: 0 !important;
  max-width: 100% !important;
  margin: 0 !important;
}
/* 清掉一切旧版伪元素「问题」，含直达按钮上的 ::before */
h2.ContentItem-title::before,
h2.ContentItem-title::after,
h2.ContentItem-title a::before,
h2.ContentItem-title a::after,
h2.ContentItem-title .${TYPE_TIP_CLASS}::before,
h2.ContentItem-title .${TYPE_TIP_CLASS}::after,
.AnswerItem .ContentItem-title::before,
.TopstoryQuestionAskItem .ContentItem-title::before,
.ZVideoItem .ContentItem-title::before,
.ZvideoItem .ContentItem-title::before,
.PinItem .ContentItem-title::before,
.ArticleItem .ContentItem-title::before {
  content: none !important;
  display: none !important;
}
.${TYPE_TIP_CLASS},
a.zhihu_e_toQuestion {
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex: 0 0 auto !important;
  align-self: center !important;
  height: 22px !important;
  padding: 0 8px !important;
  margin: 0 !important;
  border: 1px solid rgba(0,0,0,.08) !important;
  border-radius: 999px !important;
  background: #f4f4f5 !important;
  color: #666 !important;
  font: 11px/22px -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif !important;
  font-weight: 400 !important;
  letter-spacing: 0 !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  vertical-align: middle !important;
  box-shadow: none !important;
  background-image: none !important;
  text-shadow: none !important;
  position: relative !important;
  top: 0 !important;
  transform: none !important;
  cursor: default !important;
}
a.zhihu_e_toQuestion {
  cursor: pointer !important;
}
a.zhihu_e_toQuestion:hover,
.${TYPE_TIP_CLASS}:hover {
  border-color: #bbb !important;
  color: #1d1d1f !important;
  background: #f4f4f5 !important;
}
[data-theme="dark"] .${TYPE_TIP_CLASS},
[data-theme="dark"] a.zhihu_e_toQuestion {
  background: #343a44 !important;
  border-color: #3c434d !important;
  color: #c5ced8 !important;
}
h2.ContentItem-title .zhihu-plus-taste {
  display: inline-flex !important;
  align-items: center !important;
  align-self: center !important;
  gap: 6px !important;
  margin: 0 !important;
  flex: 0 0 auto !important;
}
`);
}

function decorateTypeTip(titleEl) {
    if (!menuValue('menu_typeTips')) return;
    if (!titleEl || titleEl.querySelector(`.${TYPE_TIP_CLASS}`)) return;
    const kind = typeTipKind(titleEl);
    if (!kind) return;
    const tip = document.createElement('span');
    tip.className = `${TYPE_TIP_CLASS} ${TYPE_TIP_CLASS}--${kind.mod}`;
    tip.textContent = kind.text;
    tip.setAttribute('aria-hidden', 'true');
    const toQ = titleEl.querySelector('a.zhihu_e_toQuestion');
    if (toQ) {
        toQ.insertAdjacentElement('beforebegin', tip);
        return;
    }
    const titleA = titleEl.querySelector('a:not(.zhihu_e_toQuestion)');
    if (titleA) titleA.insertAdjacentElement('afterend', tip);
    else titleEl.appendChild(tip);
}

let typeTipsBound = false;

export function addTypeTips() {
    syncTitleTagChrome();
    if (!menuValue('menu_typeTips')) {
        clearTypeTips();
        return;
    }
    injectStyle('zhihu-plus-type-tips', `/* 类型 tip 颜色已统一到 title-chrome 低调灰 */`);

    const titleSel = 'h2.ContentItem-title';
    if (location.pathname === '/search') onReadyNodes(titleSel, decorateTypeTip);
    else qsa(titleSel).forEach(decorateTypeTip);

    if (typeTipsBound) return;
    typeTipsBound = true;
    observeTree(mutations => {
        if (!menuValue('menu_typeTips')) return;
        forAddedElements(mutations, target => eachMatch(target, titleSel, decorateTypeTip));
    });
    on(window, 'urlchange', () => {
        syncTitleTagChrome();
        if (!menuValue('menu_typeTips')) {
            clearTypeTips();
            return;
        }
        onReadyNodes(titleSel, decorateTypeTip);
    });
}

let toQuestionBound = false;

export function addToQuestion() {
    syncTitleTagChrome();
    if (!menuValue('menu_toQuestion')) {
        removeStyle('zhihu-plus-to-question');
        qsa('a.zhihu_e_toQuestion').forEach(el => el.remove());
        if (!menuValue('menu_typeTips')) removeStyle('zhihu-plus-title-chrome');
        return;
    }
    // 样式已在 title-chrome；保留空壳 id 便于开关拆除时对齐
    injectStyle('zhihu-plus-to-question', `a.zhihu_e_toQuestion { cursor: pointer !important; }`);

    const decorate = titleA => {
        if (!menuValue('menu_toQuestion')) return;
        if (!titleA || titleA.classList.contains('zhihu_e_toQuestion')) return;
        if (titleA.closest('a.zhihu_e_toQuestion')) return;
        if (!titleA.parentElement || titleA.parentElement.querySelector('a.zhihu_e_toQuestion')) return;
        // 只改文本节点，避免 textContent 赋值拆掉噪音分按钮
        for (const node of titleA.childNodes) {
            if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('?')) {
                node.textContent = node.textContent.replace(/\?/g, '？');
            }
        }
        if (!/answer\/\d+/.test(titleA.href)) return;
        const meta = titleA.parentElement.querySelector('meta[itemprop="url"]');
        if (!meta) return;
        const tip = titleA.parentElement.querySelector(`.${TYPE_TIP_CLASS}`);
        const anchor = tip || titleA;
        anchor.insertAdjacentHTML('afterend', `<a class="zhihu_e_toQuestion" href="${meta.content}" target="_blank">直达问题</a>`);
    };

    const titleSel = 'h2.ContentItem-title a[href*="/answer/"]:not(.zhihu_e_toQuestion)';
    if (location.pathname === '/search') onReadyNodes(titleSel, decorate);
    else qsa(titleSel).forEach(decorate);

    if (toQuestionBound) return;
    toQuestionBound = true;
    observeTree(mutations => {
        if (!menuValue('menu_toQuestion')) return;
        forAddedElements(mutations, target => eachMatch(target, titleSel, decorate));
    });
    on(window, 'urlchange', () => {
        syncTitleTagChrome();
        if (!menuValue('menu_toQuestion')) return;
        onReadyNodes(titleSel, decorate);
    });
}

export function questionRichTextMore() {
    if (!menuValue('menu_questionRichTextMore')) return;
    const button = document.querySelector('button.QuestionRichText-more');
    if (button) button.click();
}

export function removeLogin() {
    const removeLoginModal = mutations => {
        forAddedElements(mutations, target => {
            if (target.querySelector('.signFlowModal')) {
                const button = target.querySelector('.Button.Modal-closeButton.Button--plain');
                if (button) button.click();
            } else if (getXpath('//button[text()="立即登录/注册"]', target)) {
                target.remove();
            }
        });
    };

    const loggedIn = page().isZhuanlan
        ? document.querySelector('.ColumnPageHeader-profile>.AppHeader-menu')
        : document.querySelector('.AppHeader-profile>.AppHeader-menu');
    if (loggedIn) return;

    observeTree(removeLoginModal);
    if (!page().isZhuanlan) {
        injectStyle('zhihu-plus-hide-login', '.Question-mainColumnLogin, button.AppHeader-login {display: none !important;}');
    }
    const loginBtn = getXpath('//button[text()="登录/注册"]');
    if (loginBtn) loginBtn.outerHTML = '<a class="Button AppHeader-login Button--blue" href="https://www.zhihu.com/signin" target="_blank">登录/注册</a>';
}

export function cleanTitles() {
    if (!menuValue('menu_cleanTitles')) return;
    if (menuValue('menu_blankTitleFavicon')) return;
    const elTitle = document.head.querySelector('title');
    if (!elTitle) return;
    const original = elTitle.textContent;
    new MutationObserver(() => {
        if (elTitle.textContent !== original) elTitle.textContent = original;
    }).observe(elTitle, { childList: true });
}

export function blankTitleAndFavicon() {
    if (!menuValue('menu_blankTitleFavicon')) return;

    const BLANK_ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";
    const ICON_ID = 'zhihu-plus-blank-favicon';
    let applying = false;

    try {
        const proto = Document.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, 'title');
        if (desc && desc.configurable !== false) {
            Object.defineProperty(proto, 'title', {
                configurable: true,
                enumerable: desc.enumerable,
                get() { return ''; },
                set() {}
            });
        }
    } catch (e) { /* sandbox 下改不了原型时，后面用 DOM 观察兜底 */ }

    function apply() {
        if (applying) return;
        applying = true;
        try {
            const titleEl = document.head && document.head.querySelector('title');
            if (titleEl && titleEl.textContent !== '') titleEl.textContent = '';
            if (!document.head) return;

            document.head.querySelectorAll('link[rel*="icon"]').forEach(el => {
                if (el.id !== ICON_ID) el.remove();
            });
            if (!document.getElementById(ICON_ID)) {
                const icon = document.createElement('link');
                icon.id = ICON_ID;
                icon.rel = 'icon';
                icon.href = BLANK_ICON;
                document.head.appendChild(icon);
            }
        } finally {
            applying = false;
        }
    }

    function startObserve() {
        if (!document.head) return false;
        new MutationObserver(apply).observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true
        });
        apply();
        return true;
    }

    apply();
    if (startObserve()) return;

    const waitHead = new MutationObserver(() => {
        if (startObserve()) waitHead.disconnect();
    });
    waitHead.observe(document.documentElement, { childList: true });
}

export function cleanSearch() {
    if (!menuValue('menu_cleanSearch')) {
        removeStyle('zhihu-plus-clean-search');
        return;
    }
    bindEmptySearchPlaceholder();
    injectStyle('zhihu-plus-clean-search', '.AutoComplete-group > .SearchBar-label:not(.SearchBar-label--history), .AutoComplete-group > [id^="AutoComplete2-topSearch-"], .AutoComplete-group > [id^="AutoComplete3-topSearch-"] {display: none !important;}');
}

export function questionAuthor() {
    if (document.querySelector('.BrandQuestionSymbol, .QuestionAuthor')) return;
    const boot = document.querySelector('#js-initialData');
    const topics = document.querySelector('.QuestionHeader-topics');
    if (!boot || !topics) return;
    try {
        const id = /\d+/.exec(location.pathname)[0];
        const qJson = JSON.parse(boot.textContent).initialState.entities.questions[id].author;
        topics.insertAdjacentHTML('beforebegin', `<div class="BrandQuestionSymbol"><a class="BrandQuestionSymbol-brandLink" href="/people/${qJson.urlToken}"><img role="presentation" src="${qJson.avatarUrl}" class="BrandQuestionSymbol-logo" alt=""><span class="BrandQuestionSymbol-name">${qJson.name}</span></a><div class="BrandQuestionSymbol-divider" style="margin-left: 5px;margin-right: 10px;"></div></div>`);
    } catch (e) { /* 页面结构变化时忽略 */ }
}

export function topTime(css, classs) {
    document.querySelectorAll(css).forEach(_this => {
        const t = _this.querySelector('.ContentItem-time');
        if (!t || t.classList.contains('full') || !t.querySelector('span') || t.querySelector('span').textContent == null) return;
        topTimeAllTime(t);
        topTimePublishTop(t, _this, classs);
    });
}

export function topTimePost() {
    const t = document.querySelector('.ContentItem-time:not(.xiu-time)');
    if (!t) return;
    if (t.textContent.includes('编辑于') && !t.classList.contains('xiu-time')) {
        const tt = t.textContent;
        t.click();
        t.textContent = t.textContent + ' ，' + tt;
        t.classList.add('xiu-time');
    }
    if (menuValue('menu_publishTop') && !document.querySelector('.Post-Header > .ContentItem-time') && !document.querySelector('.ContentItem-meta > .ContentItem-time')) {
        const temp = t.cloneNode(true);
        temp.style.padding = '0px';
        const header = document.querySelector('.Post-Header');
        if (header) header.insertAdjacentElement('beforeEnd', temp);
    }
}

export function topTimeAllTime(t) {
    const span = t.querySelector('span');
    if (t.textContent.includes('发布于') && !t.textContent.includes('编辑于')) {
        span.textContent = span.dataset.tooltip;
        t.classList.add('full');
    } else if (!t.textContent.includes('发布于') && t.textContent.includes('编辑于')) {
        span.textContent = span.dataset.tooltip + ' ，' + span.textContent;
        t.classList.add('full');
    }
}

export function topTimePublishTop(t, _this, _class) {
    if (!menuValue('menu_publishTop')) return;
    if (t.parentNode.classList.contains(_class)) return;
    const temp = t.cloneNode(true);
    temp.style.padding = '0px';
    if (_this.offsetHeight < 600) t.style.display = 'none';
    const host = _this.querySelector('.' + _class);
    if (host) host.insertAdjacentElement('beforeEnd', temp);
}

export function questionTime() {
    if (document.querySelector('.QuestionPage .QuestionHeader-side .QuestionTime-xiu')) return;
    const side = document.querySelector('.QuestionPage .QuestionHeader-side');
    const created = document.querySelector('.QuestionPage > meta[itemprop=dateCreated]');
    const modified = document.querySelector('.QuestionPage > meta[itemprop=dateModified]');
    if (!side || !created || !modified) return;
    side.insertAdjacentHTML('beforeEnd', `<div class="QuestionTime-xiu" style="color: #9098ac; margin-top: 5px; font-size: 13px; font-style: italic;"><p>创建时间：${getUTC8(new Date(created.content))}</p><p>最后编辑：${getUTC8(new Date(modified.content))}</p></div>`);
}

export function questionInvitation() {
    const time = setInterval(() => {
        const q = document.querySelector('.QuestionInvitation-content');
        if (!q) return;
        clearInterval(time);
        q.style.display = 'none';
        const title = document.querySelector('.QuestionInvitation-title');
        if (title) title.innerHTML = title.innerText + '<span style="cursor: pointer; font-size: 14px; color: #919aae;"> 展开/折叠</span>';
        const bar = document.querySelector('.Topbar');
        if (bar) {
            bar.onclick = function () {
                const box = document.querySelector('.QuestionInvitation-content');
                if (box) box.style.display = box.style.display === 'none' ? '' : 'none';
            };
        }
    }, 200);
    setTimeout(() => clearInterval(time), 8000);
}

export function directLink(root = document) {
    root.querySelectorAll('a.external[href*="link.zhihu.com/?target="], a.LinkCard[href*="link.zhihu.com/?target="]:not(.MCNLinkCard):not(.ZVideoLinkCard):not(.ADLinkCardContainer)').forEach(a => {
        a.href = decodeURIComponent(a.href.substring(a.href.indexOf('link.zhihu.com/?target=') + 23));
    });
}

export function originalPic(root = document) {
    root.querySelectorAll('img[data-original]:not(.comment_sticker):not(.Avatar)').forEach(img => {
        if (img.src !== img.dataset.original) img.src = img.dataset.original;
    });
}

/* 原图 + 直链：用节流观察器替代 100ms 轮询 */
export function enhanceMediaAndLinks() {
    originalPic();
    directLink();
    let pending = false;
    observeTree(mutations => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            forAddedElements(mutations, target => {
                originalPic(target);
                directLink(target);
                if (target.matches && target.matches('img[data-original]:not(.comment_sticker):not(.Avatar)') && target.src !== target.dataset.original) {
                    target.src = target.dataset.original;
                }
            });
        });
    });
}

export function watchTopTime(css, classs) {
    topTime(css, classs);
    let pending = false;
    observeTree(() => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            topTime(css, classs);
        });
    });
}

/* -------------------------------------------------------------------------- */
/* 短内容自动展开「阅读全文」                                                   */
/* -------------------------------------------------------------------------- */

const SHORT_EXPAND_MARK = 'zhihuEShortExpand';
const SHORT_EXPAND_TRIES = 'zhihuEShortExpandTries';
const SHORT_EXPAND_CLAMP_CLASS = 'zhihu-plus-short-clamped';
const SHORT_EXPAND_MORE_CLASS = 'zhihu-plus-short-more';
/** 这些标记已成定局，扫描时直接跳过 */
const SHORT_EXPAND_SETTLED = new Set(['open', 'long', 'none', 'probe']);
/** CSS 截断：隐藏高度不超过约 N 行才直接展开 */
const SHORT_EXPAND_MAX_LINES = 3;
/** 探测展开后：正文高度不超过约 N 行才保留 */
const SHORT_EXPAND_KEEP_LINES = 12;
/** 全文字数上限的兜底值，设置项没读到时用 */
const SHORT_EXPAND_KEEP_CHARS = 450;
/** 摘要已超过该字数则不再探测 */
const SHORT_EXPAND_PREVIEW_PROBE_MAX = 220;
/** 段/图/标题过多视为长文 */
const SHORT_EXPAND_KEEP_BLOCK_MAX = 10;
/** 只处理视口上下这个像素范围内的卡片，避免整页都去点展开 */
const SHORT_EXPAND_VIEWPORT_MARGIN = 600;
/** 正文长度连续这么久没变，算加载完 */
const SHORT_EXPAND_STABLE_MS = 220;
/** 等展开结果的总上限 */
const SHORT_EXPAND_TIMEOUT_MS = 2500;

function shortExpandKeepChars() {
    const n = Number(menuValue('menu_autoExpandShortChars'));
    return Number.isFinite(n) && n > 0 ? n : SHORT_EXPAND_KEEP_CHARS;
}

/** 问题页开着「默认收起回答」时让路：两个功能会对同一批回答一个点开一个点收。 */
function shortExpandAllowed() {
    if (!menuValue('menu_autoExpandShort')) return false;
    const p = page();
    if (p.isQuestion && !p.isAnswer && !p.isQuestionWaiting && menuValue('menu_defaultCollapsedAnswer')) return false;
    return true;
}

function nearViewport(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 && rect.height <= 0) return false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh + SHORT_EXPAND_VIEWPORT_MARGIN && rect.bottom > -SHORT_EXPAND_VIEWPORT_MARGIN;
}

function shortExpandLineHeight(el) {
    const style = getComputedStyle(el);
    const lh = parseFloat(style.lineHeight);
    if (Number.isFinite(lh) && lh > 0) return lh;
    const fs = parseFloat(style.fontSize);
    return (Number.isFinite(fs) && fs > 0 ? fs : 15) * 1.6;
}

function findReadMoreButton(scope) {
    if (!(scope instanceof Element)) return null;
    const named = scope.querySelector('button.ContentItem-more, button.ContentItem-expandButton, .ContentItem-more');
    if (named) return named;
    for (const el of scope.querySelectorAll('button, a')) {
        const text = (el.textContent || '').replace(/\s+/g, '');
        if (text.includes('阅读全文') || text.includes('展开全文')) return el;
    }
    return null;
}

function findRetractButton(scope) {
    if (!(scope instanceof Element)) return null;
    const named = scope.querySelector(
        '.ContentItem-actions [data-zop-retract-question], .ContentItem-rightButton[data-zop-retract-question], button[data-zop-retract-question]'
    );
    if (named) return named;
    for (const el of scope.querySelectorAll('button')) {
        const text = (el.textContent || '').replace(/\s+/g, '');
        if (text.includes('收起') && !text.includes('收起评论')) return el;
    }
    return null;
}

function richTextNode(inner) {
    return inner.querySelector('.RichText, [itemprop="text"], [itemprop="articleBody"]') || inner;
}

/** 只在判断「正文还在不在变」时用：不做归一化，长文上省下整轮正则。 */
function rawTextLen(inner) {
    return (richTextNode(inner).textContent || '').length;
}

/** 真正拿来和字数上限比的长度，按码点算。 */
function normalizedCharLen(inner) {
    const text = (richTextNode(inner).textContent || '').replace(/\s+/g, ' ').trim();
    return Array.from(text).length;
}

function isExpandedShortEnough(inner) {
    if (!(inner instanceof HTMLElement)) return false;
    const chars = normalizedCharLen(inner);
    if (chars <= 0) return false;
    if (chars > shortExpandKeepChars()) return false;

    const line = shortExpandLineHeight(inner);
    const maxH = line * SHORT_EXPAND_KEEP_LINES + 8;
    const h = Math.max(inner.scrollHeight, inner.getBoundingClientRect().height);
    if (h > maxH) return false;

    const blocks = inner.querySelectorAll('p, li, h2, h3, h4, figure, img').length;
    if (blocks > SHORT_EXPAND_KEEP_BLOCK_MAX) return false;
    return true;
}

/** 没有「收起」按钮可点时的兜底：自己把正文夹住，并补一个展开入口。 */
function clampLongRich(rich) {
    if (rich.classList.contains(SHORT_EXPAND_CLAMP_CLASS)) return;
    injectStyle('zhihu-plus-short-clamp', `
        .${SHORT_EXPAND_CLAMP_CLASS} .RichContent-inner {
            max-height: ${SHORT_EXPAND_KEEP_LINES}em;
            overflow: hidden;
        }
        .${SHORT_EXPAND_MORE_CLASS} {
            display: block;
            margin-top: 4px;
            padding: 0;
            border: 0;
            background: none;
            color: #175199;
            font-size: 15px;
            cursor: pointer;
        }
    `);
    rich.classList.add(SHORT_EXPAND_CLAMP_CLASS);
    const more = document.createElement('button');
    more.type = 'button';
    more.className = SHORT_EXPAND_MORE_CLASS;
    more.textContent = '阅读全文';
    more.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        rich.classList.remove(SHORT_EXPAND_CLAMP_CLASS);
        more.remove();
    });
    rich.appendChild(more);
}

/** 收回长文：先点知乎自己的「收起」，点不动就自己夹住，别把长文摊在那。 */
function retractExpandedRich(rich) {
    const item = rich.closest('.ContentItem') || rich;
    const retract = findRetractButton(rich) || findRetractButton(item);
    rich.dataset[SHORT_EXPAND_MARK] = 'long';
    if (!retract) {
        clampLongRich(rich);
        return;
    }
    retract.click();
    setTimeout(() => {
        if (!rich.isConnected || rich.dataset[SHORT_EXPAND_MARK] !== 'long') return;
        if (rich.classList.contains('is-collapsed')) return;
        const inner = rich.querySelector('.RichContent-inner') || rich;
        if (!isExpandedShortEnough(inner)) clampLongRich(rich);
    }, 300);
}

/** 已标 open 的卡片：再量一次，过长则收回。 */
function recheckOpenShort(rich) {
    if (!(rich instanceof HTMLElement) || !rich.isConnected) return;
    if (rich.dataset[SHORT_EXPAND_MARK] !== 'open') return;
    if (rich.classList.contains('is-collapsed')) return;
    const inner = rich.querySelector('.RichContent-inner') || rich;
    if (!isExpandedShortEnough(inner)) retractExpandedRich(rich);
}

/** 估算折叠态相对全文多藏了多少像素（优先 scrollHeight；否则去 clamp 克隆测量）。 */
function measureHiddenPx(inner) {
    if (!(inner instanceof HTMLElement)) return 0;
    const byScroll = inner.scrollHeight - inner.clientHeight;
    if (byScroll > 1) return byScroll;

    const width = inner.clientWidth;
    if (width <= 0) return 0;

    const clone = inner.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return 0;
    // 克隆出来的图片/视频会再走一遍加载，且未定尺寸时高度为 0；换成等高占位块
    const mediaSelector = 'img, video, iframe, canvas';
    const media = [...inner.querySelectorAll(mediaSelector)];
    clone.querySelectorAll(mediaSelector).forEach((node, i) => {
        const spacer = document.createElement('div');
        spacer.style.height = `${Math.round(media[i] ? media[i].getBoundingClientRect().height : 0)}px`;
        node.replaceWith(spacer);
    });
    clone.querySelectorAll('button.ContentItem-more, button.ContentItem-expandButton, .ContentItem-more, script, style').forEach(n => n.remove());
    clone.style.cssText = [
        'position:absolute',
        'left:-99999px',
        'top:0',
        'visibility:hidden',
        'pointer-events:none',
        'contain:layout style',
        `width:${width}px`,
        'height:auto',
        'max-height:none',
        'overflow:visible',
        '-webkit-line-clamp:unset',
        'line-clamp:unset',
        'display:block',
    ].join(';');
    document.body.appendChild(clone);
    const full = clone.getBoundingClientRect().height;
    clone.remove();
    return Math.max(0, full - inner.getBoundingClientRect().height);
}

function scheduleShortExpandRetry(rich) {
    if (rich.dataset[SHORT_EXPAND_MARK] === 'wait') return;
    const tries = Number(rich.dataset[SHORT_EXPAND_TRIES] || 0);
    if (tries >= 2) {
        delete rich.dataset[SHORT_EXPAND_MARK];
        tryProbeExpandShort(rich);
        return;
    }
    rich.dataset[SHORT_EXPAND_TRIES] = String(tries + 1);
    rich.dataset[SHORT_EXPAND_MARK] = 'wait';
    setTimeout(() => {
        if (rich.dataset[SHORT_EXPAND_MARK] !== 'wait') return;
        delete rich.dataset[SHORT_EXPAND_MARK];
        tryAutoExpandShort(rich);
    }, 400);
}

/**
 * 点开后等正文加载完：盯着子树变动，正文长度连续 SHORT_EXPAND_STABLE_MS 没变就算稳。
 * 长度还跟摘要一样说明全文没送到，不启动稳定计时，交给总超时兜底。
 */
function waitExpandSettled(rich, previewLen, onSettled) {
    let finished = false;
    let lastLen = -1;
    let stableTimer = 0;

    const observer = new MutationObserver(check);

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(stableTimer);
        clearTimeout(deadline);
        observer.disconnect();
        if (rich.isConnected) onSettled();
    }

    function check() {
        if (!rich.isConnected) {
            finish();
            return;
        }
        const inner = rich.querySelector('.RichContent-inner') || rich;
        const len = rawTextLen(inner);
        if (len === lastLen) return;
        lastLen = len;
        clearTimeout(stableTimer);
        if (len <= previewLen + 8) return;
        stableTimer = setTimeout(finish, SHORT_EXPAND_STABLE_MS);
    }

    const deadline = setTimeout(finish, SHORT_EXPAND_TIMEOUT_MS);
    observer.observe(rich, { childList: true, subtree: true, characterData: true });
    check();
}

/** 量最终尺寸：够短就留着，长了就收回。 */
function settleShortResult(rich) {
    const inner = rich.querySelector('.RichContent-inner') || rich;
    if (isExpandedShortEnough(inner)) {
        rich.dataset[SHORT_EXPAND_MARK] = 'open';
        setTimeout(() => recheckOpenShort(rich), 600);
        return;
    }
    retractExpandedRich(rich);
}

/** 知乎信息流常截断 DOM 正文；点开后等正文稳定，再按字数/高度决定是否收回。 */
function tryProbeExpandShort(rich) {
    if (!(rich instanceof HTMLElement)) return;
    if (SHORT_EXPAND_SETTLED.has(rich.dataset[SHORT_EXPAND_MARK])) return;

    const more = findReadMoreButton(rich);
    if (!more) {
        rich.dataset[SHORT_EXPAND_MARK] = 'none';
        return;
    }

    const inner = rich.querySelector('.RichContent-inner') || rich;
    if (!(inner instanceof HTMLElement)) return;

    if (normalizedCharLen(inner) > SHORT_EXPAND_PREVIEW_PROBE_MAX) {
        rich.dataset[SHORT_EXPAND_MARK] = 'long';
        return;
    }

    rich.dataset[SHORT_EXPAND_MARK] = 'probe';
    const previewLen = rawTextLen(inner);
    more.click();

    waitExpandSettled(rich, previewLen, () => {
        // 展开压根没生效，留给下一轮扫描
        if (rich.classList.contains('is-collapsed') && findReadMoreButton(rich)) {
            rich.dataset[SHORT_EXPAND_MARK] = 'skip';
            return;
        }
        settleShortResult(rich);
    });
}

function tryAutoExpandShort(rich) {
    if (!(rich instanceof HTMLElement)) return;
    const mark = rich.dataset[SHORT_EXPAND_MARK];

    // skip 是上一轮点展开没生效留下的，卡片还折着就再试一次
    if (mark === 'skip' && rich.classList.contains('is-collapsed') && findReadMoreButton(rich)) {
        delete rich.dataset[SHORT_EXPAND_MARK];
    } else if (mark && mark !== 'wait') {
        return;
    }

    const more = findReadMoreButton(rich);
    if (!more) {
        if (rich.classList.contains('is-collapsed')) {
            scheduleShortExpandRetry(rich);
            return;
        }
        rich.dataset[SHORT_EXPAND_MARK] = 'none';
        return;
    }

    const inner = rich.querySelector('.RichContent-inner') || rich;
    if (!(inner instanceof HTMLElement) || inner.clientHeight <= 0) {
        scheduleShortExpandRetry(rich);
        return;
    }

    const hidden = measureHiddenPx(inner);
    const maxHidden = shortExpandLineHeight(inner) * SHORT_EXPAND_MAX_LINES + 4;
    if (hidden > 0 && hidden <= maxHidden) {
        rich.dataset[SHORT_EXPAND_MARK] = 'open';
        const previewLen = rawTextLen(inner);
        more.click();
        waitExpandSettled(rich, previewLen, () => recheckOpenShort(rich));
        return;
    }
    if (hidden > maxHidden) {
        rich.dataset[SHORT_EXPAND_MARK] = 'long';
        return;
    }

    if (rich.classList.contains('is-collapsed') || more) {
        tryProbeExpandShort(rich);
        return;
    }
    rich.dataset[SHORT_EXPAND_MARK] = 'skip';
}

let autoExpandShortBound = false;

/** 只碰视口附近、还没定论的卡片：整页点展开既卡又会给知乎刷一堆已读埋点。 */
function scanShortExpand(root) {
    eachMatch(root || document, '.RichContent', rich => {
        if (SHORT_EXPAND_SETTLED.has(rich.dataset[SHORT_EXPAND_MARK])) return;
        if (!nearViewport(rich)) return;
        tryAutoExpandShort(rich);
    });
}

/** 观察器只挂一次，开关和页面判断放在回调里，切页/改设置后才能自己恢复。 */
function bindShortExpand() {
    if (autoExpandShortBound) return;
    autoExpandShortBound = true;

    let pending = false;
    let pendingRoots = [];
    const pendingOpen = new Set();
    const flush = () => {
        pending = false;
        const roots = pendingRoots;
        pendingRoots = [];
        for (const root of roots) scanShortExpand(root);
        for (const rich of pendingOpen) recheckOpenShort(rich);
        pendingOpen.clear();
    };
    const schedule = () => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(flush);
    };

    observeTree(mutations => {
        if (!shortExpandAllowed()) return;
        forAddedElements(mutations, target => {
            pendingRoots.push(target);
            // 内容晚到的已展开卡片：只有它收到插入时才复查，避免全页轮询
            const host = target.closest('.RichContent');
            if (host && host.dataset[SHORT_EXPAND_MARK] === 'open') pendingOpen.add(host);
        });
        schedule();
    });

    // 滚动进视口的卡片不会触发 DOM 插入，得自己补一轮
    let scrollTimer = 0;
    on(window, 'scroll', () => {
        if (scrollTimer) return;
        scrollTimer = setTimeout(() => {
            scrollTimer = 0;
            if (shortExpandAllowed()) scanShortExpand(document);
        }, 300);
    }, { passive: true });

    on(window, 'urlchange', () => {
        if (!shortExpandAllowed()) return;
        requestAnimationFrame(() => scanShortExpand(document));
    });
}

/** 短折叠自动展开：只保留真正短的正文；长文探测后收回。 */
export function autoExpandShortContent() {
    bindShortExpand();
    if (!shortExpandAllowed()) return;
    scanShortExpand(document);
}

