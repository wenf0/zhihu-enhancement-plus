import type { LexiconData, TasteEntry, TastePrefs } from './types';

export interface CategoryDislikeStat {
  id: string;
  name: string;
  level: number;
  c: number;
  score: number;
  /** max(0, catDelta)，供堆叠条使用 */
  catPart: number;
  catDelta: number;
  wordDelta: number;
  like: number;
  dislike: number;
}

function entryDelta(entry: TasteEntry | undefined) {
  return entry ? Number(entry.delta) || 0 : 0;
}

function entryLike(entry: TasteEntry | undefined) {
  return entry ? Math.max(0, Number(entry.like) || 0) : 0;
}

function entryDislike(entry: TasteEntry | undefined) {
  return entry ? Math.max(0, Number(entry.dislike) || 0) : 0;
}

function wordInCat(words: Record<string, number>, word: string) {
  if (Object.prototype.hasOwnProperty.call(words, word)) return true;
  const key = word.toLowerCase();
  return Object.keys(words).some(w => w.toLowerCase() === key);
}

/**
 * 按「不想看」强度汇总各噪音分类。
 * score = max(0, 分类口味 delta) + 落在该分类词表中的词正 delta（taste.words + taste.learned）。
 */
export function buildCategoryDislikeStats(
  taste: TastePrefs | null | undefined,
  lexicon: LexiconData | null | undefined,
): CategoryDislikeStat[] {
  const cats = lexicon?.cats || {};
  const tasteCats = taste?.cats || {};
  const wordMaps = [taste?.words || {}, taste?.learned || {}];
  const rows: CategoryDislikeStat[] = [];

  for (const cat of Object.values(cats)) {
    if (!cat?.id) continue;
    const catEntry = tasteCats[cat.id];
    const catDelta = entryDelta(catEntry);
    let wordDelta = 0;
    let like = entryLike(catEntry);
    let dislike = entryDislike(catEntry);
    const words = cat.words || {};
    const seen = new Set<string>();

    for (const map of wordMaps) {
      for (const [word, entry] of Object.entries(map)) {
        const low = word.toLowerCase();
        if (seen.has(low) || !wordInCat(words, word)) continue;
        seen.add(low);
        const d = entryDelta(entry);
        if (d > 0) wordDelta += d;
        like += entryLike(entry);
        dislike += entryDislike(entry);
      }
    }

    const catPart = Math.max(0, catDelta);
    const score = catPart + wordDelta;
    rows.push({
      id: cat.id,
      name: cat.name || cat.id,
      level: Number(cat.level) || 0,
      c: Number(cat.c) || 0,
      score,
      catPart,
      catDelta,
      wordDelta,
      like,
      dislike,
    });
  }

  return rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.dislike !== a.dislike) return b.dislike - a.dislike;
    return a.name.localeCompare(b.name, 'zh');
  });
}

export function hasCategoryDislikeSignal(rows: CategoryDislikeStat[]) {
  return rows.some(row => row.score > 0 || row.dislike > 0);
}
