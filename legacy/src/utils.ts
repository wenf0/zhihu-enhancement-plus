import { GM_notification } from '$';

/* -------------------------------------------------------------------------- */
/* 工具                                                                       */
/* -------------------------------------------------------------------------- */

export function page() {
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

export function qs(selector, root = document) {
    return (root || document).querySelector(selector);
}

export function qsa(selector, root = document) {
    return Array.from((root || document).querySelectorAll(selector));
}

export function on(target, type, handler, options) {
    if (!target) return () => {};
    target.addEventListener(type, handler, options);
    return () => target.removeEventListener(type, handler, options);
}

export function eachMatch(root, selector, handle) {
    const scope = root || document;
    if (scope.nodeType === 1 && scope.matches(selector)) handle(scope);
    qsa(selector, scope).forEach(handle);
}

export function injectStyle(id, css) {
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
}

export function getXpath(xpath, contextNode, doc = document) {
    contextNode = contextNode || doc;
    try {
        const result = doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue && result.singleNodeValue.nodeType === 1 && result.singleNodeValue;
    } catch (err) {
        throw new Error(`无效 Xpath: ${xpath}`);
    }
}

export function cardWrap(el) {
    return el && (el.closest('.List-item') || el.closest('.Card'));
}

export function hideClosest(el, selector, remove = false) {
    const node = el && el.closest(selector);
    if (!node) return false;
    if (remove) node.remove();
    else node.hidden = true;
    return true;
}

export function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

export function isElementInViewportPartial(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
}

export function forAddedElements(mutations, fn) {
    for (const mutation of mutations) {
        for (const target of mutation.addedNodes) {
            if (target.nodeType !== 1) continue;
            fn(target);
        }
    }
}

export function observeTree(callback) {
    const observer = new MutationObserver(callback);
    observer.observe(document, { childList: true, subtree: true });
    return observer;
}

export function onReadyNodes(selector, handle, { timeout = 8000 } = {}) {
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

export function addUrlChangeEvent() {
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

export function getUTC8(t) {
    const pad = n => (n < 10 ? '0' + n : n);
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}\xa0\xa0${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

export function notify(text, timeout = 3000) {
    GM_notification({ text, timeout });
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
