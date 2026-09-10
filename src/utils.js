/* -------------------------------------------------------------------------- */
/* 工具                                                                       */
/* -------------------------------------------------------------------------- */

function page() {
    const { pathname, hostname, href, search } = location;
    return {
        hostname,
        pathname,
        href,
        search,
        isZhuanlan: hostname === 'zhuanlan.zhihu.com',
        isHome: pathname === '/',
        isHot: pathname === '/hot',
        isFollow: pathname === '/follow',
        isSearch: pathname === '/search',
        isQuestion: pathname.includes('question') && !href.includes('/log'),
        isQuestionWaiting: pathname.includes('waiting'),
        isAnswer: pathname.includes('/answer/'),
        isTopic: pathname.includes('/topic/'),
        isTopicHot: pathname.includes('/hot') || href.includes('/top-answers'),
        isColumn: pathname.includes('/column/'),
        isPeople: pathname.includes('/people/') || href.includes('org'),
        isCollection: pathname.includes('/collection/')
    };
}

function qs(selector, root = document) {
    return (root || document).querySelector(selector);
}

function qsa(selector, root = document) {
    return Array.from((root || document).querySelectorAll(selector));
}

function on(target, type, handler, options) {
    if (!target) return () => {};
    target.addEventListener(type, handler, options);
    return () => target.removeEventListener(type, handler, options);
}

function eachMatch(root, selector, handle) {
    const scope = root || document;
    if (scope.nodeType === 1 && scope.matches(selector)) handle(scope);
    qsa(selector, scope).forEach(handle);
}

function injectStyle(id, css) {
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
}

function getXpath(xpath, contextNode, doc = document) {
    contextNode = contextNode || doc;
    try {
        const result = doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue && result.singleNodeValue.nodeType === 1 && result.singleNodeValue;
    } catch (err) {
        throw new Error(`无效 Xpath: ${xpath}`);
    }
}

function cardWrap(el) {
    return el && (el.closest('.List-item') || el.closest('.Card'));
}

function hideClosest(el, selector, remove = false) {
    const node = el && el.closest(selector);
    if (!node) return false;
    if (remove) node.remove();
    else node.hidden = true;
    return true;
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function isElementInViewportPartial(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
}

function forAddedElements(mutations, fn) {
    for (const mutation of mutations) {
        for (const target of mutation.addedNodes) {
            if (target.nodeType !== 1) continue;
            fn(target);
        }
    }
}

function observeTree(callback) {
    const observer = new MutationObserver(callback);
    observer.observe(document, { childList: true, subtree: true });
    return observer;
}

function onReadyNodes(selector, handle, { timeout = 8000 } = {}) {
    const seen = new WeakSet();
    const visit = node => {
        if (seen.has(node)) return;
        seen.add(node);
        handle(node);
    };
    eachMatch(document, selector, visit);
    const observer = observeTree(mutations => {
        forAddedElements(mutations, target => eachMatch(target, selector, visit));
    });
    setTimeout(() => observer.disconnect(), timeout);
}

function addUrlChangeEvent() {
    history.pushState = (f => function pushState() {
        const ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('urlchange'));
        return ret;
    })(history.pushState);

    history.replaceState = (f => function replaceState() {
        const ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('urlchange'));
        return ret;
    })(history.replaceState);

    on(window, 'popstate', () => {
        window.dispatchEvent(new Event('urlchange'));
    });
}

function getUTC8(t) {
    const pad = n => (n < 10 ? '0' + n : n);
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}\xa0\xa0${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

function notify(text, timeout = 3000) {
    GM_notification({ text, timeout });
}
