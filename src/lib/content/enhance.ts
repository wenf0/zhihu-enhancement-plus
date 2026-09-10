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
            color: #888 !important;
            text-decoration: none !important;
            background-color: #8882 !important;
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
  flex: 1 1 auto !important;
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
  padding: 0 10px !important;
  margin: 0 !important;
  border: 0 !important;
  border-radius: 999px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  line-height: 22px !important;
  letter-spacing: 0.02em !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  vertical-align: middle !important;
  box-shadow: none !important;
  background-image: none !important;
  position: relative !important;
  top: 0 !important;
  transform: none !important;
}
a.zhihu_e_toQuestion {
  color: #5b6abf !important;
  background-color: #5b6abf1f !important;
}
a.zhihu_e_toQuestion:hover {
  color: #3f4fa8 !important;
  background-color: #5b6abf33 !important;
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
    injectStyle('zhihu-plus-type-tips', `
.${TYPE_TIP_CLASS}--question { color: #e85d4c !important; background-color: #e85d4c1f !important; }
.${TYPE_TIP_CLASS}--questionAsk { color: #e23b2e !important; background-color: #e23b2e1f !important; }
.${TYPE_TIP_CLASS}--video { color: #0aa2b8 !important; background-color: #0aa2b81f !important; }
.${TYPE_TIP_CLASS}--pin { color: #2f9e44 !important; background-color: #2f9e441f !important; }
.${TYPE_TIP_CLASS}--article { color: #1b7fd1 !important; background-color: #1b7fd11f !important; }
`);

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
