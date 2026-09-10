import JiebaWasm from './jieba-glue.js';
import { runtime } from '../content/state';

export const JIEBA_LEARN_POS = new Set(['n', 'nr', 'nrfg', 'nrt', 'ns', 'nt', 'nz', 'nw', 'vn', 'an', 'a', 'eng']);
export const JIEBA_STOPWORDS = new Set([
  '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你',
  '会', '着', '没有', '看', '好', '自己', '这', '他', '她', '它', '我们', '他们', '什么', '怎么', '如何', '为什么', '这个', '那个',
  '可以', '还是', '因为', '所以', '如果', '但是', '然后', '而且', '或者', '只是', '已经', '现在', '时候', '一样', '这样', '那么',
  '这么', '一些', '还有', '不是', '就是', '还', '能', '对', '把', '被', '让', '给', '从', '为', '与', '及', '等', '中', '后',
  '前', '里', '外', '下', '多', '少', '更', '最', '太', '非常', '真的', '觉得', '应该', '可能', '知乎', '问题', '回答', '谢邀',
  '楼主', '题主', '评论', '点赞', '收藏', '关注', '分享', 'http', 'https', 'www', 'com', 'the', 'and', 'for', 'you',
]);

export let jiebaReady = false;
export let jiebaUnavailable = false;
export let jiebaPromise: Promise<boolean> | null = null;
export const jiebaTokenCache = new Map<string, string[]>();
export const jiebaSetCache = new Map<string, Set<string>>();
export const jiebaDictSeen = new Set<string>();

async function loadJiebaWasmBytes() {
  const url = browser.runtime.getURL('/jieba_rs_wasm_bg.wasm');
  const res = await fetch(url);
  if (!res.ok) throw new Error('jieba wasm HTTP ' + res.status);
  return res.arrayBuffer();
}

export function ensureJieba() {
  if (jiebaReady) return Promise.resolve(true);
  if (jiebaUnavailable) return Promise.resolve(false);
  if (jiebaPromise) return jiebaPromise;
  jiebaPromise = (async () => {
    const bytes = await loadJiebaWasmBytes();
    JiebaWasm.initSync({ module: bytes });
    jiebaReady = true;
    jiebaTokenCache.clear();
    jiebaSetCache.clear();
    if (runtime.noiseIndex) syncJiebaUserDict();
    return true;
  })().catch(err => {
    console.warn('[知乎增强] 结巴分词加载失败，改用边界匹配', err);
    jiebaUnavailable = true;
    jiebaPromise = null;
    return false;
  });
  return jiebaPromise;
}

export function syncJiebaUserDict() {
  if (!jiebaReady) return;
  const add = (word: string) => {
    const t = String(word || '').trim();
    if (t.length < 2 || jiebaDictSeen.has(t)) return;
    jiebaDictSeen.add(t);
    try { JiebaWasm.add_word(t, 20000, 'n'); } catch { /* ignore */ }
  };
  const idx = runtime.noiseIndex as {
    cats?: Array<{ words: Array<{ k: string }>; excludes: string[] }>;
    custom?: Array<{ k: string }>;
    emotion?: Array<{ k: string }>;
    controversy?: string[];
    clickbait?: string[];
    value?: Array<{ k: string }>;
  } | null;
  if (!idx) return;
  for (const cat of idx.cats || []) {
    for (const item of cat.words) add(item.k);
    for (const ex of cat.excludes) add(ex);
  }
  for (const item of idx.custom || []) add(item.k);
  for (const item of idx.emotion || []) add(item.k);
  for (const word of idx.controversy || []) add(word);
  for (const word of idx.clickbait || []) add(word);
  for (const item of idx.value || []) add(item.k);
  for (const word of runtime.learnedWords) add(word);
  jiebaTokenCache.clear();
  jiebaSetCache.clear();
}

export function cutNoiseTokens(text: string) {
  if (!jiebaReady) return null;
  let cached = jiebaTokenCache.get(text);
  if (!cached) {
    cached = JiebaWasm.cut(text, true)
      .map(tok => String(tok).toLowerCase())
      .filter(tok => tok && !/^\s+$/.test(tok));
    if (jiebaTokenCache.size > 400) jiebaTokenCache.clear();
    jiebaTokenCache.set(text, cached);
  }
  return cached;
}

export function noiseTokenSet(text: string) {
  const raw = String(text || '');
  if (!raw) return null;
  if (!jiebaReady) return null;
  let cached = jiebaSetCache.get(raw);
  if (cached) return cached;
  const tokens = cutNoiseTokens(raw);
  if (!tokens) return null;
  const set = new Set(tokens);
  const maxLen = ((runtime.noiseIndex as { maxTermLen?: number } | null)?.maxTermLen) || 16;
  for (let i = 0; i < tokens.length; i++) {
    let acc = tokens[i];
    for (let j = i + 1; j < tokens.length; j++) {
      acc += tokens[j];
      if (acc.length > maxLen) break;
      set.add(acc);
    }
  }
  try {
    if (typeof JiebaWasm.cut_for_search === 'function') {
      for (const tok of JiebaWasm.cut_for_search(raw, true)) {
        const t = String(tok).toLowerCase();
        if (t) set.add(t);
      }
    }
  } catch { /* search cut optional */ }
  if (jiebaSetCache.size > 400) jiebaSetCache.clear();
  jiebaSetCache.set(raw, set);
  return set;
}

export function jiebaTagTokens(text: string) {
  if (!jiebaReady || typeof JiebaWasm.tag !== 'function') return [];
  try {
    return JiebaWasm.tag(String(text || ''), true).map(item => {
      if (item && typeof item === 'object') {
        return { word: String(item.word || '').toLowerCase(), tag: String(item.tag || item.flag || '') };
      }
      const s = String(item || '');
      const i = s.lastIndexOf('/');
      return i > 0 ? { word: s.slice(0, i).toLowerCase(), tag: s.slice(i + 1) } : { word: s.toLowerCase(), tag: '' };
    }).filter(item => item.word);
  } catch {
    return [];
  }
}

export function isJiebaStopword(word: string) {
  const t = String(word || '').toLowerCase();
  if (!t || t.length < 2) return true;
  if (JIEBA_STOPWORDS.has(t)) return true;
  if (/^[\d.]+$/.test(t) || /^[^\u4e00-\u9fffa-z0-9]+$/i.test(t)) return true;
  return false;
}

export function canLearnJiebaToken(word: string, tag: string) {
  if (isJiebaStopword(word)) return false;
  if (tag && !JIEBA_LEARN_POS.has(tag)) return false;
  return true;
}

export function noiseHasFallback(text: string, term: string) {
  if (term.length >= 2) return text.includes(term);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(?:^|[^\\u4e00-\\u9fff])' + escaped + '(?:[^\\u4e00-\\u9fff]|$)');
  return re.test(text);
}

export function noiseHas(text: string, term: string, tokenSet?: Set<string> | null) {
  const t = String(term || '').toLowerCase();
  if (!t || !text) return false;
  if (tokenSet) return tokenSet.has(t);
  const tokens = cutNoiseTokens(text);
  if (!tokens) return noiseHasFallback(text, t);
  return (noiseTokenSet(text) || new Set(tokens)).has(t);
}

export function noiseWords(weight: number, list: string[]) {
  const out: Record<string, number> = Object.create(null);
  for (const word of list) out[word] = weight;
  return out;
}
