export type FilterMode = 'off' | 'demote' | 'hide';
export type MenuKind = 'users' | 'filter' | 'group' | 'lexicon' | 'hidden';

export interface MenuItem {
  key: string;
  label: string;
  tip: string;
  def: boolean | string | string[];
  kind?: MenuKind;
  children?: string[];
}

export interface TasteEntry {
  like: number;
  dislike: number;
  delta: number;
}

export interface TastePrefs {
  words: Record<string, TasteEntry>;
  cats: Record<string, TasteEntry>;
  value: Record<string, TasteEntry>;
  learned: Record<string, TasteEntry>;
  actions: Record<string, 'like' | 'dislike' | ''>;
  clicks: number;
}

export interface LexiconCat {
  id: string;
  name: string;
  level: number;
  c: number;
  words: Record<string, number>;
  excludes: string[];
}

export interface LexiconData {
  touched: string[];
  cats: Record<string, LexiconCat>;
  emotion: Record<string, number>;
  controversy: string[];
  clickbait: string[];
  value: Record<string, number>;
}

export interface SettingsValues {
  [key: string]: unknown;
}

export interface SettingsSnapshot {
  v: 1;
  kind: typeof SETTINGS_KIND;
  script: string;
  t: number;
  values: SettingsValues;
}

export const SETTINGS_KIND = 'zhihu-enhancement-plus-settings';
export const LEXICON_KEY = 'noise_lexicon_v1';
export const TASTE_KEY = 'noise_taste_v1';
export const USERS_OFF_KEY = 'menu_customBlockUsersOff';

/** 已移除的自定义关键词相关 key，加载时清掉本地残留 */
export const REMOVED_KEYWORD_KEYS = [
  'menu_customBlockKeywords',
  'menu_customBlockKeywordsOff',
  'menu_customBlockKeywordsLevel',
  'menu_customBlockKeywordsLevels',
  'menu_kw_pack_v1',
] as const;
