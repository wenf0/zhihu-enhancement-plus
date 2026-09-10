export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

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
    isCollection: pathname.includes('/collection/'),
  };
}

export function qs<T extends Element = Element>(selector: string, root: ParentNode = document) {
  return (root || document).querySelector(selector) as T | null;
}

export function qsa<T extends Element = Element>(selector: string, root: ParentNode = document) {
  return Array.from((root || document).querySelectorAll(selector)) as T[];
}

export function on<K extends keyof WindowEventMap>(
  target: EventTarget | null,
  type: K | string,
  handler: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions,
) {
  if (!target) return () => {};
  target.addEventListener(type, handler, options);
  return () => target.removeEventListener(type, handler, options);
}

export function eachMatch(root: ParentNode | Element | null, selector: string, handle: (el: Element) => void) {
  const scope = root || document;
  if (scope instanceof Element && scope.matches(selector)) handle(scope);
  qsa(selector, scope).forEach(handle);
}

export function injectStyle(id: string, css: string) {
  if (document.getElementById(id)) return;
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  (document.head || document.documentElement).appendChild(el);
}

export function getXpath(xpath: string, contextNode?: Node | null, doc = document) {
  const ctx = contextNode || doc;
  try {
    const result = doc.evaluate(xpath, ctx, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue && result.singleNodeValue.nodeType === 1
      ? result.singleNodeValue as Element
      : null;
  } catch {
    return null;
  }
}

export function cardWrap(el: Element | null) {
  return el && (el.closest('.List-item') || el.closest('.Card'));
}

export function hideClosest(el: Element | null, selector: string, remove = false) {
  const node = el && el.closest(selector);
  if (!node) return false;
  if (remove) node.remove();
  else (node as HTMLElement).hidden = true;
  return true;
}

export function isElementInViewport(el: Element) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

export function isElementInViewportPartial(el: Element) {
  const rect = el.getBoundingClientRect();
  return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
}

export function forAddedElements(mutations: MutationRecord[], fn: (el: Element) => void) {
  for (const mutation of mutations) {
    for (const target of mutation.addedNodes) {
      if (target.nodeType !== 1) continue;
      fn(target as Element);
    }
  }
}

export function observeTree(callback: MutationCallback) {
  const observer = new MutationObserver(callback);
  observer.observe(document, { childList: true, subtree: true });
  return observer;
}

export function onReadyNodes(selector: string, handle: (el: Element) => void, { timeout = 8000 } = {}) {
  const seen = new WeakSet<Element>();
  const visit = (node: Element) => {
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
  const wrap = (fn: typeof history.pushState, name: string) => function (this: History, ...args: Parameters<typeof history.pushState>) {
    const ret = fn.apply(this, args);
    window.dispatchEvent(new Event(name));
    window.dispatchEvent(new Event('urlchange'));
    return ret;
  };
  history.pushState = wrap(history.pushState, 'pushstate');
  history.replaceState = wrap(history.replaceState, 'replacestate');
  on(window, 'popstate', () => window.dispatchEvent(new Event('urlchange')));
}

export function getUTC8(t: Date) {
  const pad = (n: number) => (n < 10 ? '0' + n : String(n));
  return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}\xa0\xa0${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

export function notify(text: string) {
  console.info('[知乎增强]', text);
}

export function parseWeightedWords(input: string, fallback = 6) {
  const out: Record<string, number> = Object.create(null);
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

export function escapeHtml(text: string) {
  return String(text).replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch] || ch));
}

export function parseWords(input: string) {
  return String(input || '').split(/[,，|/\n\r]+/).map(s => s.replace(/\s+/g, '')).filter(Boolean);
}

export function uniqueWords(words: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const word of words) {
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(word);
  }
  return out;
}

export function formatBytes(n: number) {
  const size = Math.max(0, Number(n) || 0);
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) {
    const kb = size / 1024;
    return (kb < 10 ? kb.toFixed(1) : String(Math.round(kb))) + ' KB';
  }
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

export function downloadJsonFile(filename: string, text: string) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
