import {
  LEXICON_KEY,
  REMOVED_KEYWORD_KEYS,
  SETTINGS_KIND,
  TASTE_KEY,
  USERS_OFF_KEY,
  type FilterMode,
  type LexiconData,
  type SettingsSnapshot,
  type SettingsValues,
  type TastePrefs,
} from './types';
import { DEFAULT_BLOCK_USERS, MENU_ITEMS } from './defaults';
import { EXT_VERSION } from './version';

export const EXTRA_KEYS = [
  LEXICON_KEY,
  TASTE_KEY,
  USERS_OFF_KEY,
];

const cache: SettingsValues = Object.create(null);

export function menuValue<T = unknown>(key: string): T {
  return cache[key] as T;
}

export function getCache(): SettingsValues {
  return cache;
}

function writeCache(values: SettingsValues) {
  for (const [key, value] of Object.entries(values)) {
    cache[key] = value;
  }
}

export function defaultSettings(): SettingsValues {
  const values: SettingsValues = Object.create(null);
  for (const item of MENU_ITEMS) {
    if (item.kind === 'group' || item.kind === 'lexicon') continue;
    values[item.key] = item.def;
  }
  values[USERS_OFF_KEY] = [];
  values[LEXICON_KEY] = null;
  values[TASTE_KEY] = emptyTastePrefs();
  return values;
}

export function emptyTastePrefs(): TastePrefs {
  return { words: {}, cats: {}, value: {}, learned: {}, actions: {}, clicks: 0 };
}

export function settingsKnownKeys() {
  const keys = new Set(EXTRA_KEYS);
  for (const item of MENU_ITEMS) keys.add(item.key);
  return keys;
}

export async function loadSettings(): Promise<SettingsValues> {
  const stored = await browser.storage.local.get(null);
  const defaults = defaultSettings();
  const merged: SettingsValues = { ...defaults, ...stored };
  if (merged.menu_noiseScore == null) merged.menu_noiseScore = true;
  merged.menu_blockKeywords = normalizeFilterMode(merged.menu_blockKeywords);
  for (const key of REMOVED_KEYWORD_KEYS) delete merged[key];
  writeCache(merged);
  const stale = REMOVED_KEYWORD_KEYS.filter(key => key in stored);
  if (stale.length) void browser.storage.local.remove([...stale]);
  return merged;
}

export async function setSetting(key: string, value: unknown) {
  cache[key] = value;
  await browser.storage.local.set({ [key]: value });
}

export function menuSet(key: string, value: unknown) {
  cache[key] = value;
  void browser.storage.local.set({ [key]: value });
}

export function writeListOff(storageKey: string, off: Set<string>) {
  if (storageKey !== 'menu_customBlockUsers') return;
  menuSet(USERS_OFF_KEY, [...off]);
}

export async function setSettings(values: SettingsValues) {
  writeCache(values);
  await browser.storage.local.set(values);
}

export function watchSettings(onChange: () => void) {
  const listener = () => {
    void loadSettings().then(onChange);
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}

export function normalizeFilterMode(value: unknown): FilterMode {
  if (value === 'off' || value === 'demote' || value === 'hide') return value;
  if (value === false) return 'off';
  return 'off';
}

export function readFilterMode(): FilterMode {
  return normalizeFilterMode(menuValue('menu_blockKeywords'));
}

export function readListOff(storageKey: string, values: SettingsValues = cache): Set<string> {
  const key = storageKey === 'menu_customBlockUsers' ? USERS_OFF_KEY : '';
  const raw = key ? values[key] : [];
  return new Set(Array.isArray(raw) ? raw : []);
}

export function activeListValues(storageKey: string): string[] {
  const off = readListOff(storageKey);
  const list = (menuValue<string[]>(storageKey) || []).filter(word => word && !off.has(word));
  return list;
}

export function isPackedListItem(storageKey: string, word: string) {
  if (storageKey === 'menu_customBlockUsers') return DEFAULT_BLOCK_USERS.includes(word);
  return false;
}

export function snapshotSettings(): SettingsSnapshot {
  const values: SettingsValues = {};
  for (const item of MENU_ITEMS) {
    if (item.kind === 'group' || item.kind === 'lexicon') continue;
    values[item.key] = cache[item.key];
  }
  for (const key of EXTRA_KEYS) {
    if (cache[key] != null) values[key] = cache[key];
  }
  return {
    v: 1,
    kind: SETTINGS_KIND,
    script: EXT_VERSION,
    t: Date.now(),
    values,
  };
}

export function parseSettingsJson(text: string): SettingsValues {
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('format');
  if (data.kind && data.kind !== SETTINGS_KIND) throw new Error('kind');
  if (data.values && typeof data.values === 'object' && !Array.isArray(data.values)) return data.values;
  const known = settingsKnownKeys();
  const values: SettingsValues = {};
  for (const key of Object.keys(data)) {
    if (known.has(key)) values[key] = data[key];
  }
  if (!Object.keys(values).length) throw new Error('empty');
  return values;
}

export function isValidSettingValue(key: string, value: unknown) {
  if (key === LEXICON_KEY) return !!(value && typeof value === 'object' && !Array.isArray(value));
  if (key === TASTE_KEY) {
    return !!(value && typeof value === 'object' && !Array.isArray(value)
      && (value as TastePrefs).words && typeof (value as TastePrefs).words === 'object');
  }
  if (key === USERS_OFF_KEY) {
    return Array.isArray(value) && value.every(x => typeof x === 'string');
  }
  const item = MENU_ITEMS.find(x => x.key === key);
  if (!item) return false;
  if (item.kind === 'users') return Array.isArray(value) && value.every(x => typeof x === 'string');
  if (item.kind === 'filter') return value === 'off' || value === 'demote' || value === 'hide' || typeof value === 'boolean';
  if (item.kind === 'group' || item.kind === 'lexicon') return typeof value === 'string';
  return typeof value === 'boolean';
}

export async function applyImportedSettings(values: SettingsValues) {
  const known = settingsKnownKeys();
  const next: SettingsValues = {};
  let n = 0;
  for (const [key, value] of Object.entries(values)) {
    if (!known.has(key) || !isValidSettingValue(key, value)) continue;
    next[key] = value;
    n += 1;
  }
  if (n) await setSettings(next);
  return n;
}

export function settingsExportFilename() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `zhihu-enhancement-plus-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
}

export function getTastePrefs(): TastePrefs {
  const saved = menuValue<TastePrefs | null>(TASTE_KEY);
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return emptyTastePrefs();
  return {
    words: saved.words && typeof saved.words === 'object' ? saved.words : {},
    cats: saved.cats && typeof saved.cats === 'object' ? saved.cats : {},
    value: saved.value && typeof saved.value === 'object' ? saved.value : {},
    learned: saved.learned && typeof saved.learned === 'object' ? saved.learned : {},
    actions: saved.actions && typeof saved.actions === 'object' ? saved.actions : {},
    clicks: Number(saved.clicks) || 0,
  };
}

export async function saveTastePrefs(data: TastePrefs) {
  await setSetting(TASTE_KEY, data);
}

export function getSavedLexicon(): LexiconData | null {
  const saved = menuValue<LexiconData | null>(LEXICON_KEY);
  if (!saved || typeof saved !== 'object') return null;
  return saved;
}

export async function saveLexicon(data: LexiconData) {
  await setSetting(LEXICON_KEY, data);
}

export function packedUsers() {
  return DEFAULT_BLOCK_USERS;
}
