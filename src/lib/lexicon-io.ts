import { LEXICON_KEY, type LexiconCat, type LexiconData } from './types';

export const LEXICON_BACKUP_KIND = 'zhihu-enhancement-plus-lexicon-backup';

function cleanWord(raw: unknown) {
  return String(raw || '').replace(/\s+/g, '').trim();
}

function clampLevel(n: unknown) {
  const v = Math.floor(Number(n) || 1);
  return Math.max(1, Math.min(3, v));
}

function clampC(n: unknown) {
  const v = Math.floor(Number(n) || 0);
  return Math.max(0, Math.min(100, v));
}

function clampWeight(n: unknown) {
  const v = Math.floor(Number(n) || 0);
  return Math.max(1, Math.min(20, v));
}

/** 词表大小写不敏感去重；冲突时保留较大权重。 */
export function normalizeWordMap(raw: unknown): Record<string, number> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, number> = Object.create(null);
  const lowerToKey = new Map<string, string>();
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const word = cleanWord(key);
    if (!word) continue;
    const weight = clampWeight(value);
    const low = word.toLowerCase();
    const existing = lowerToKey.get(low);
    if (!existing) {
      out[word] = weight;
      lowerToKey.set(low, word);
      continue;
    }
    if (weight > (out[existing] || 0)) out[existing] = weight;
  }
  return out;
}

/** 字符串列表大小写不敏感去重，保序。 */
export function normalizeWordList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    const word = cleanWord(item);
    if (!word) continue;
    const low = word.toLowerCase();
    if (seen.has(low)) continue;
    seen.add(low);
    out.push(word);
  }
  return out;
}

export function normalizeLexiconCat(raw: unknown, fallbackId?: string): LexiconCat | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const row = raw as Partial<LexiconCat>;
  const id = cleanWord(row.id) || cleanWord(fallbackId);
  if (!id) return null;
  const name = String(row.name || id).trim() || id;
  return {
    id,
    name,
    level: clampLevel(row.level),
    c: clampC(row.c),
    words: normalizeWordMap(row.words),
    excludes: normalizeWordList(row.excludes),
  };
}

export function normalizeLexicon(raw: unknown): LexiconData | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = raw as Partial<LexiconData>;
  const cats: Record<string, LexiconCat> = Object.create(null);
  if (data.cats && typeof data.cats === 'object' && !Array.isArray(data.cats)) {
    for (const [key, value] of Object.entries(data.cats)) {
      const cat = normalizeLexiconCat(value, key);
      if (!cat) continue;
      cats[cat.id] = cat;
    }
  }
  return {
    cats,
    emotion: normalizeWordMap(data.emotion),
    controversy: normalizeWordList(data.controversy),
    clickbait: normalizeWordList(data.clickbait),
    value: normalizeWordMap(data.value),
  };
}

export function cloneLexicon(data: LexiconData): LexiconData {
  return normalizeLexicon(data) || {
    cats: {},
    emotion: {},
    controversy: [],
    clickbait: [],
    value: {},
  };
}

export function newLexiconCatId(existing: Record<string, LexiconCat>, name: string) {
  const base = cleanWord(name).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '_') || 'cat';
  let id = base.slice(0, 32);
  if (!existing[id]) return id;
  let i = 2;
  while (existing[`${id}_${i}`]) i += 1;
  return `${id}_${i}`;
}

export function serializeLexiconBackup(lexicon: LexiconData) {
  const data = cloneLexicon(lexicon);
  return {
    kind: LEXICON_BACKUP_KIND,
    v: 1 as const,
    t: Date.now(),
    lexicon: data,
  };
}

export function lexiconExportFilename() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `zhihu-plus-lexicon-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
}

export type LexiconImportMode = 'merge' | 'replace';

export interface LexiconImportResult {
  lexicon: LexiconData;
  cats: number;
  words: number;
  source: 'lexicon' | 'settings';
}

function countWords(data: LexiconData) {
  let n = Object.keys(data.emotion).length + Object.keys(data.value).length
    + data.controversy.length + data.clickbait.length;
  for (const cat of Object.values(data.cats)) n += Object.keys(cat.words).length + cat.excludes.length;
  return n;
}

function mergeWordMaps(base: Record<string, number>, incoming: Record<string, number>) {
  const out = normalizeWordMap(base);
  for (const [word, weight] of Object.entries(incoming)) {
    const low = word.toLowerCase();
    const existing = Object.keys(out).find(k => k.toLowerCase() === low);
    if (!existing) {
      out[word] = weight;
      continue;
    }
    out[existing] = Math.max(out[existing] || 0, weight);
  }
  return out;
}

function mergeWordLists(base: string[], incoming: string[]) {
  return normalizeWordList([...base, ...incoming]);
}

/**
 * 解析词库导入：
 * - 词库备份 kind=lexicon-backup
 * - 完整设置 JSON（values.noise_lexicon_v1）
 * - 裸 LexiconData
 */
export function parseLexiconImport(
  text: string,
  current: LexiconData,
  mode: LexiconImportMode = 'merge',
): LexiconImportResult {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('format');

  let incoming: LexiconData | null = null;
  let source: LexiconImportResult['source'] = 'lexicon';

  if (data.kind === LEXICON_BACKUP_KIND) {
    incoming = normalizeLexicon(data.lexicon);
    source = 'lexicon';
  } else if (data.values && typeof data.values === 'object' && data.values[LEXICON_KEY]) {
    incoming = normalizeLexicon(data.values[LEXICON_KEY]);
    source = 'settings';
  } else if (data[LEXICON_KEY]) {
    incoming = normalizeLexicon(data[LEXICON_KEY]);
    source = 'settings';
  } else if (data.cats || data.emotion || data.value || data.controversy || data.clickbait) {
    incoming = normalizeLexicon(data);
    source = 'lexicon';
  }

  if (!incoming) throw new Error('empty');

  if (mode === 'replace') {
    return {
      lexicon: incoming,
      cats: Object.keys(incoming.cats).length,
      words: countWords(incoming),
      source,
    };
  }

  const base = cloneLexicon(current);
  for (const [id, cat] of Object.entries(incoming.cats)) {
    const cur = base.cats[id];
    if (!cur) {
      base.cats[id] = cat;
      continue;
    }
    base.cats[id] = {
      id,
      name: cat.name || cur.name,
      level: cat.level || cur.level,
      c: typeof cat.c === 'number' ? cat.c : cur.c,
      words: mergeWordMaps(cur.words, cat.words),
      excludes: mergeWordLists(cur.excludes, cat.excludes),
    };
  }
  base.emotion = mergeWordMaps(base.emotion, incoming.emotion);
  base.value = mergeWordMaps(base.value, incoming.value);
  base.controversy = mergeWordLists(base.controversy, incoming.controversy);
  base.clickbait = mergeWordLists(base.clickbait, incoming.clickbait);

  return {
    lexicon: base,
    cats: Object.keys(incoming.cats).length,
    words: countWords(incoming),
    source,
  };
}

export function emptyLexicon(): LexiconData {
  return {
    cats: {},
    emotion: {},
    controversy: [],
    clickbait: [],
    value: {},
  };
}
