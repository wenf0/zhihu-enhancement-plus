// @ts-nocheck
import { menuValue } from '../storage';
import { observeTree, forAddedElements, isElementInViewport, isElementInViewportPartial, getXpath, qsa, qs, cardWrap, page } from '../utils';

/* -------------------------------------------------------------------------- */
/* 收起回答                                                                   */
/* -------------------------------------------------------------------------- */

export function getCollapsedAnswerObserver() {
    if (window._collapsedAnswerObserver) return window._collapsedAnswerObserver;

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.target.hasAttribute && mutation.target.hasAttribute('script-collapsed')) return;
            if (mutation.target.classList && mutation.target.classList.contains('RichContent')) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
                    if (addedNode.className !== 'RichContent-inner') continue;
                    if (addedNode.offsetHeight < 400) break;
                    const button = mutation.target.querySelector('.ContentItem-actions.Sticky [data-zop-retract-question]');
                    if (button) {
                        mutation.target.setAttribute('script-collapsed', '');
                        button.click();
                        return;
                    }
                }
            } else if (mutation.target.tagName === 'DIV' && !mutation.target.style.cssText && !mutation.target.className) {
                if (mutation.target.parentElement && mutation.target.parentElement.hasAttribute('script-collapsed')) return;
                const button = mutation.target.querySelector('.ContentItem-actions.Sticky [data-zop-retract-question]');
                if (button) {
                    mutation.target.parentElement.setAttribute('script-collapsed', '');
                    button.click();
                    return;
                }
            }
        }
    });

    observer.start = function () {
        if (!this._active) {
            this.observe(document, { childList: true, subtree: true });
            this._active = true;
        }
    };
    observer.end = function () {
        if (this._active) this.disconnect();
        this._active = false;
    };

    window.addEventListener('urlchange', () => {
        observer[location.href.includes('/answer/') ? 'end' : 'start']();
    });
    window._collapsedAnswerObserver = observer;
    return observer;
}

export function defaultCollapsedAnswer() {
    if (!menuValue('menu_defaultCollapsedAnswer')) {
        getCollapsedAnswerObserver().end();
        return;
    }
    const observer = getCollapsedAnswerObserver();
    if (!location.href.includes('/answer/')) observer.start();
}

export function setCollapsedCornerStyle(css) {
    let el = document.getElementById('zhihu-plus-collapsed-btn');
    if (!el) {
        el = document.createElement('style');
        el.id = 'zhihu-plus-collapsed-btn';
        (document.head || document.documentElement).appendChild(el);
    }
    if (el.textContent !== css) el.textContent = css;
}

/* 看山就在角标组里。改 bottom 会把外壳撑高，回到顶部仍按原高度排，叠在看山上。 */
export function watchCollapsedCornerStyle() {
    if (window._zhihuPlusCornerStyleWatch) return;
    window._zhihuPlusCornerStyleWatch = true;
    setCollapsedCornerStyle(`
        .CornerButtons.CornerButtons--kanshan {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-end !important;
            gap: 8px !important;
        }
        .CornerAnimayedFlex--kanshanEntry {
            position: relative !important;
            top: auto !important;
            bottom: auto !important;
            height: auto !important;
        }
        .CornerAnimayedFlex--kanshan:not(.CornerAnimayedFlex--kanshanEntry):not(.CornerAnimayedFlex--hidden) {
            height: auto !important;
            overflow: hidden !important;
        }
        .CornerAnimayedFlex--hidden {
            height: 0 !important;
            overflow: hidden !important;
        }
        #collapsed-button {
            margin-bottom: 8px !important;
        }
    `);
}

function onCollapsedAllClick() {
    document.querySelectorAll('.Comments-container').forEach(el => {
        const btn = getXpath('//button[text()="收起评论"]', el);
        if (btn) btn.click();
    });
    document.querySelectorAll('.RichContent >.ContentItem-actions>button:first-of-type').forEach(el => {
        if (el.textContent.includes('收起评论')) el.click();
    });

    const p = page();
    if (p.isHome || p.isHot || p.isFollow) {
        document.querySelectorAll('.ContentItem-rightButton').forEach(el => {
            if (el.hasAttribute('data-zop-retract-question')) el.click();
        });
        return;
    }

    document.querySelectorAll('[script-collapsed]').forEach(scriptCollapsed => {
        scriptCollapsed.querySelectorAll('.ContentItem-actions [data-zop-retract-question], .ContentItem-actions.Sticky [data-zop-retract-question]').forEach(button => button.click());
    });
    document.querySelectorAll('.RichContent:not([script-collapsed]) .ContentItem-actions.Sticky [data-zop-retract-question]').forEach(button => {
        let el = button.parentElement;
        while (el && !el.classList.contains('RichContent')) el = el.parentElement;
        if (el) el.setAttribute('script-collapsed', '');
        button.click();
    });

    const observer = getCollapsedAnswerObserver();
    observer.start();
    if (!menuValue('menu_defaultCollapsedAnswer') && !observer._disconnectListener) {
        window.addEventListener('urlchange', () => {
            observer.end();
            window._collapsedAnswerObserver = null;
        });
        observer._disconnectListener = true;
    }
}

export function collapsedAnswer() {
    if (!menuValue('menu_collapsedAnswer')) {
        document.getElementById('collapsed-button')?.remove();
        return;
    }
    watchCollapsedCornerStyle();
    const corner = document.querySelector('.CornerAnimayedFlex:not(.CornerAnimayedFlex--kanshanEntry)');
    if (!corner) return;
    let btn = document.getElementById('collapsed-button');
    if (!btn) {
        const cls = corner.querySelector('button') ? corner.querySelector('button').className : 'CornerButton';
        corner.insertAdjacentHTML('afterBegin', `<button id="collapsed-button" data-tooltip="收起全部回答/评论" data-tooltip-position="left" data-tooltip-will-hide-on-click="false" aria-label="收起全部回答/评论" type="button" class="${cls}"><svg class="ContentItem-arrowIcon is-active" aria-label="收起全部回答/评论" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M16.036 19.59a1 1 0 0 1-.997.995H9.032a.996.996 0 0 1-.997-.996v-7.005H5.03c-1.1 0-1.36-.633-.578-1.416L11.33 4.29a1.003 1.003 0 0 1 1.412 0l6.878 6.88c.782.78.523 1.415-.58 1.415h-3.004v7.005z"></path></svg></button>`);
        btn = document.getElementById('collapsed-button');
    }
    if (btn) btn.onclick = onCollapsedAllClick;
}

function findMainColumn() {
    return document.querySelector([
        '.Topstory-mainColumn',
        '.Question-mainColumn',
        '.SearchMain',
        '.ContentLayout-mainColumn',
        '.Profile-mainColumn',
        '.Profile-main',
        'article.Post-Main.Post-NormalMain',
        '.CollectionsDetailPage',
        '.Question-main',
    ].join(', '));
}

function isSideGutterEvent(event) {
    const target = event.target;
    if (!(target instanceof Element)) return false;
    if (target.closest('a, button, input, textarea, select, label, [role="button"], [contenteditable="true"], .Modal, .Modal-wrapper, .Popover, .CommentEditor, .Editable, #collapsed-button, .CornerButtons')) {
        return false;
    }
    const main = findMainColumn();
    if (!main) return false;
    const rect = main.getBoundingClientRect();
    const x = event.clientX;
    return x < rect.left - 2 || x > rect.right + 2;
}

function collapseVisibleContent() {
    const rightBar = document.querySelector('.ContentItem-actions.Sticky.RichContent-actions.is-fixed.is-bottom');
    if (rightBar) {
        const commentBtn = rightBar.querySelector('button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
        if (commentBtn && commentBtn.textContent.includes('收起评论')) commentBtn.click();
        const retract = rightBar.querySelector('.ContentItem-rightButton[data-zop-retract-question]');
        if (retract) retract.click();
    } else {
        let clicked = false;
        for (const el of document.querySelectorAll('.ContentItem-rightButton[data-zop-retract-question]')) {
            if (!isElementInViewport(el)) continue;
            const commentBtn = el.parentNode.querySelector('button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
            if (commentBtn && commentBtn.textContent.includes('收起评论')) {
                commentBtn.click();
                if (!isElementInViewport(commentBtn)) scrollTo(0, el.offsetTop + 50);
            }
            el.click();
            clicked = true;
            break;
        }
        if (!clicked) {
            for (const el of document.querySelectorAll('.List-item, .Card.AnswerCard, .Card.TopstoryItem')) {
                if (!isElementInViewportPartial(el)) continue;
                const commentBtn = el.querySelector('button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
                if (commentBtn && commentBtn.textContent.includes('收起评论')) {
                    commentBtn.click();
                    if (!isElementInViewport(commentBtn)) scrollTo(0, el.offsetTop + 50);
                }
                const retract = el.querySelector('.ContentItem-rightButton[data-zop-retract-question]');
                if (retract) retract.click();
                break;
            }
        }
    }

    const floating = getXpath('//button[text()="收起评论"]', document.querySelector('.Comments-container'));
    if (floating) {
        floating.click();
        return;
    }

    const fixedBtns = document.querySelectorAll('.ContentItem-actions > button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type, .ContentItem-action > button.Button.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
    for (const el of fixedBtns) {
        if (el.textContent.includes('收起评论') && isElementInViewport(el)) {
            el.click();
            return;
        }
    }

    for (const el of qsa('.Comments-container')) {
        if (!isElementInViewport(el)) continue;
        const parentElement = cardWrap(el);
        if (!parentElement) continue;
        const commentBtn = qs('.ContentItem-actions > button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type', parentElement);
        if (commentBtn && commentBtn.textContent.includes('收起评论')) {
            commentBtn.click();
            if (!isElementInViewport(commentBtn)) scrollTo(0, parentElement.offsetTop + parentElement.offsetHeight - 50);
            return;
        }
    }

    for (const el of qsa('.Editable-content')) {
        if (!isElementInViewport(el)) continue;
        const parentElement = cardWrap(el);
        if (!parentElement) continue;
        const commentBtn = qs('.ContentItem-actions > button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type', parentElement);
        if (commentBtn && commentBtn.textContent.includes('收起评论')) {
            commentBtn.click();
            if (!isElementInViewport(commentBtn)) scrollTo(0, parentElement.offsetTop + parentElement.offsetHeight - 50);
            break;
        }
    }
}

let sideGesturesBound = false;

/** 文档级左右空白手势：单击收起、右键回顶；开关在事件里再读，支持热更新。 */
export function bindSideGestures() {
    if (sideGesturesBound) return;
    sideGesturesBound = true;

    document.addEventListener('click', event => {
        if (!menuValue('menu_collapsedNowAnswer')) return;
        if (!isSideGutterEvent(event)) return;
        collapseVisibleContent();
    }, true);

    document.addEventListener('contextmenu', event => {
        if (!menuValue('menu_backToTop')) return;
        if (!isSideGutterEvent(event)) return;
        event.preventDefault();
        window.scrollTo(0, 0);
    }, true);
}

export function closeFloatingComments() {
    observeTree(mutations => {
        forAddedElements(mutations, () => {
            const button = document.querySelector('button[aria-label="关闭"]');
            if (!button) return;
            const wrap = button.parentElement && button.parentElement.parentElement;
            if (!wrap) return;
            wrap.onclick = function (event) {
                if (event.target.parentElement === this) button.click();
            };
        });
    });
}
