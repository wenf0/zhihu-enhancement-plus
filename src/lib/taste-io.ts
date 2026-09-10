import { TASTE_KEY, type TasteEntry, type TastePrefs } from './types';

export const TASTE_BACKUP_KIND = 'zhihu-enhancement-plus-taste-backup';
export const KEYWORDS_BACKUP_KIND = 'zhihu-enhancement-plus-keywords-backup';

function emptyTastePrefs(): TastePrefs {
  return { words: {}, cats: {}, value: {}, learned: {}, actions: {}, clicks: 0 };
}

/** 与 taste.ts 的 TASTE_LEARNED_RANGE 一致 */
const LEARNED_DELTA_RANGE = [-8, 12] as const;

function clampLearnedDelta(n: number) {
  return Math.max(LEARNED_DELTA_RANGE[0], Math.min(LEARNED_DELTA_RANGE[1], Number(n) || 0));
}

function isTasteEntry(value: unknown): value is TasteEntry {
  return !!(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeTasteEntry(raw: unknown): TasteEntry | null {
  if (!isTasteEntry(raw)) return null;
  const like = Math.max(0, Math.floor(Number((raw as TasteEntry).like) || 0));
  const dislike = Math.max(0, Math.floor(Number((raw as TasteEntry).dislike) || 0));
  const delta = clampLearnedDelta((raw as TasteEntry).delta);
  if (!like && !dislike && !delta) return null;
  return { like, dislike, delta };
}

function normalizeTasteMap(raw: unknown): Record<string, TasteEntry> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: Record<string, TasteEntry> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const word = String(key || '').replace(/\s+/g, '').trim();
    if (!word) continue;
    const entry = normalizeTasteEntry(value);
    if (!entry) continue;
    const low = word.toLowerCase();
    if (out[word] || Object.keys(out).some(k => k.toLowerCase() === low)) continue;
    out[word] = entry;
  }
  return out;
}

function normalizeTastePrefs(raw: unknown): TastePrefs | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const data = raw as Partial<TastePrefs>;
  return {
    words: normalizeTasteMap(data.words),
    cats: normalizeTasteMap(data.cats),
    value: normalizeTasteMap(data.value),
    learned: normalizeTasteMap(data.learned),
    actions: data.actions && typeof data.actions === 'object' && !Array.isArray(data.actions)
      ? Object.fromEntries(
        Object.entries(data.actions).filter(([, v]) => v === 'like' || v === 'dislike' || v === ''),
      ) as TastePrefs['actions']
      : {},
    clicks: Math.max(0, Math.floor(Number(data.clicks) || 0)),
  };
}

function entryFromKeywordLevel(level: unknown): TasteEntry {
  // 旧关键词多为屏蔽意图 → 记为口味新词正向噪音增量
  if (level === 'demote') return { like: 0, dislike: 1, delta: 1 };
  if (level === 'weight') return { like: 0, dislike: 1, delta: 1 };
  return { like: 0, dislike: 2, delta: 2 };
}

function learnedFromKeywordBackup(data: Record<string, unknown>): Record<string, TasteEntry> {
  const learned: Record<string, TasteEntry> = {};
  const add = (word: string, level?: unknown) => {
    const w = String(word || '').replace(/\s+/g, '').trim();
    if (!w) return;
    const low = w.toLowerCase();
    if (Object.keys(learned).some(k => k.toLowerCase() === low)) return;
    learned[w] = entryFromKeywordLevel(level);
  };

  if (Array.isArray(data.entries)) {
    for (const item of data.entries) {
      if (!item || typeof item !== 'object') continue;
      const row = item as { word?: unknown; on?: unknown; level?: unknown };
      if (row.on === false) continue;
      if (typeof row.word === 'string') add(row.word, row.level);
    }
  }
  if (Array.isArray(data.words)) {
    for (const word of data.words) {
      if (typeof word === 'string') add(word, data.defaultLevel);
    }
  }
  return learned;
}

function learnedFromWordList(list: unknown[]): Record<string, TasteEntry> {
  const learned: Record<string, TasteEntry> = {};
  for (const item of list) {
    if (typeof item === 'string') {
      const w = item.replace(/\s+/g, '').trim();
      if (!w) continue;
      const low = w.toLowerCase();
      if (Object.keys(learned).some(k => k.toLowerCase() === low)) continue;
      learned[w] = { like: 0, dislike: 2, delta: 2 };
      continue;
    }
    if (item && typeof item === 'object' && typeof (item as { word?: unknown }).word === 'string') {
      const row = item as { word: string; delta?: unknown; like?: unknown; dislike?: unknown; level?: unknown };
      const w = row.word.replace(/\s+/g, '').trim();
      if (!w) continue;
      const low = w.toLowerCase();
      if (Object.keys(learned).some(k => k.toLowerCase() === low)) continue;
      const normalized = normalizeTasteEntry({
        like: row.like,
        dislike: row.dislike,
        delta: row.delta,
      });
      learned[w] = normalized || entryFromKeywordLevel(row.level);
    }
  }
  return learned;
}

export function serializeTasteBackup(taste: TastePrefs) {
  return {
    kind: TASTE_BACKUP_KIND,
    v: 1 as const,
    t: Date.now(),
    taste: {
      words: taste.words || {},
      cats: taste.cats || {},
      value: taste.value || {},
      learned: taste.learned || {},
      actions: taste.actions || {},
      clicks: taste.clicks || 0,
    },
  };
}

export function tasteExportFilename() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `zhihu-plus-taste-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
}

export type TasteImportMode = 'merge' | 'replace';

export interface TasteImportResult {
  taste: TastePrefs;
  added: number;
  source: 'taste' | 'settings' | 'keywords' | 'words';
}

/**
 * 解析口味导入：
 * - 口味备份 kind=taste-backup
 * - 完整设置 JSON（values.noise_taste_v1）
 * - 旧关键词备份 kind=keywords-backup → 写入 learned
 * - 纯词数组 / { words: string[] }
 */
export function parseTasteImport(text: string, current: TastePrefs, mode: TasteImportMode = 'merge'): TasteImportResult {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('format');

  let incoming: TastePrefs | null = null;
  let source: TasteImportResult['source'] = 'taste';

  if (data.kind === TASTE_BACKUP_KIND) {
    incoming = normalizeTastePrefs(data.taste)
      || (data.learned ? {
        ...emptyTastePrefs(),
        learned: normalizeTasteMap(data.learned),
      } : null);
    source = 'taste';
  } else if (data.kind === KEYWORDS_BACKUP_KIND || (Array.isArray(data.words) && data.source)) {
    incoming = {
      ...emptyTastePrefs(),
      learned: learnedFromKeywordBackup(data as Record<string, unknown>),
    };
    source = 'keywords';
  } else if (data.values && typeof data.values === 'object' && data.values[TASTE_KEY]) {
    incoming = normalizeTastePrefs(data.values[TASTE_KEY]);
    source = 'settings';
  } else if (data[TASTE_KEY]) {
    incoming = normalizeTastePrefs(data[TASTE_KEY]);
    source = 'settings';
  } else if (Array.isArray(data)) {
    incoming = { ...emptyTastePrefs(), learned: learnedFromWordList(data) };
    source = 'words';
  } else if (Array.isArray(data.words) && !data.cats && !data.learned && !data.taste) {
    incoming = { ...emptyTastePrefs(), learned: learnedFromWordList(data.words) };
    source = 'words';
  } else if (data.learned || data.words || data.cats || data.value) {
    incoming = normalizeTastePrefs(data);
    source = 'taste';
  }

  if (!incoming) throw new Error('empty');

  if (mode === 'replace') {
    return {
      taste: incoming,
      added: Object.keys(incoming.learned).length
        + Object.keys(incoming.words).length
        + Object.keys(incoming.cats).length
        + Object.keys(incoming.value).length,
      source,
    };
  }

  const base = {
    words: { ...(current.words || {}) },
    cats: { ...(current.cats || {}) },
    value: { ...(current.value || {}) },
    learned: { ...(current.learned || {}) },
    actions: { ...(current.actions || {}) },
    clicks: Math.max(current.clicks || 0, incoming.clicks || 0),
  };

  let added = 0;
  const mergeMap = (target: Record<string, TasteEntry>, from: Record<string, TasteEntry>) => {
    for (const [key, entry] of Object.entries(from)) {
      const low = key.toLowerCase();
      const existingKey = Object.keys(target).find(k => k.toLowerCase() === low);
      if (!existingKey) {
        target[key] = entry;
        added += 1;
        continue;
      }
      const cur = target[existingKey];
      target[existingKey] = {
        like: (cur.like || 0) + (entry.like || 0),
        dislike: (cur.dislike || 0) + (entry.dislike || 0),
        delta: clampLearnedDelta((cur.delta || 0) + (entry.delta || 0)),
      };
      added += 1;
    }
  };

  mergeMap(base.words, incoming.words);
  mergeMap(base.cats, incoming.cats);
  mergeMap(base.value, incoming.value);
  mergeMap(base.learned, incoming.learned);
  for (const [key, action] of Object.entries(incoming.actions || {})) {
    if (!base.actions[key]) {
      base.actions[key] = action;
      added += 1;
    }
  }

  return { taste: base, added, source };
}
