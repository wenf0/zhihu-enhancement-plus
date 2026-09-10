import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  applyImportedSettings,
  defaultSettings,
  getTastePrefs,
  loadSettings,
  menuValue,
  normalizeKeywordList,
  parseSettingsJson,
  readCustomDefaultLevel,
  saveTastePrefs,
  setSetting,
  snapshotSettings,
} from './storage';
import { MENU_ITEMS } from './defaults';
import type { CustomLevelId, FilterMode, KeywordEntry, SettingsValues, TastePrefs } from './types';
import { emptyTastePrefs } from './storage';
import { getActiveLexicon, saveLexicon } from './noise/lexicon';
import type { LexiconData } from './types';

export function useSettings() {
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState<SettingsValues>({});
  const [lexicon, setLexicon] = useState<LexiconData | null>(null);
  const [taste, setTaste] = useState<TastePrefs>(emptyTastePrefs());

  const refresh = useCallback(async () => {
    const next = await loadSettings();
    setValues({ ...next });
    setLexicon(getActiveLexicon());
    setTaste(getTastePrefs());
    setReady(true);
  }, []);

  useEffect(() => {
    if (typeof browser === 'undefined' || !browser.storage) {
      const defaults = defaultSettings();
      setValues(defaults);
      setLexicon(getActiveLexicon());
      setTaste(emptyTastePrefs());
      setReady(true);
      return;
    }
    void refresh();
    const listener = () => { void refresh(); };
    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, [refresh]);

  const setBool = useCallback(async (key: string, value: boolean) => {
    await setSetting(key, value);
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFilter = useCallback(async (mode: FilterMode) => {
    await setSetting('menu_blockKeywords', mode);
    setValues(prev => ({ ...prev, menu_blockKeywords: mode }));
  }, []);

  const setUsers = useCallback(async (users: string[]) => {
    await setSetting('menu_customBlockUsers', users);
    setValues(prev => ({ ...prev, menu_customBlockUsers: users }));
  }, []);

  const setKeywords = useCallback(async (list: KeywordEntry[]) => {
    await setSetting('menu_customBlockKeywords', list);
    setValues(prev => ({ ...prev, menu_customBlockKeywords: list }));
  }, []);

  const setDefaultLevel = useCallback(async (level: CustomLevelId) => {
    await setSetting('menu_customBlockKeywordsLevel', level);
    setValues(prev => ({ ...prev, menu_customBlockKeywordsLevel: level }));
  }, []);

  const updateTaste = useCallback(async (next: TastePrefs) => {
    await saveTastePrefs(next);
    setTaste(next);
  }, []);

  const resetTaste = useCallback(async () => {
    const empty = emptyTastePrefs();
    await saveTastePrefs(empty);
    setTaste(empty);
  }, []);

  const updateLexicon = useCallback(async (data: LexiconData) => {
    await saveLexicon(data);
    setLexicon(data);
  }, []);

  const keywords = useMemo(
    () => normalizeKeywordList(values.menu_customBlockKeywords || menuValue('menu_customBlockKeywords'), values),
    [values],
  );

  const users = useMemo(
    () => (Array.isArray(values.menu_customBlockUsers) ? values.menu_customBlockUsers as string[] : []),
    [values],
  );

  const exportText = useCallback(() => JSON.stringify(snapshotSettings(), null, 2), [values, lexicon, taste]);

  const importText = useCallback(async (text: string) => {
    const parsed = parseSettingsJson(text);
    const n = await applyImportedSettings(parsed);
    await refresh();
    return n;
  }, [refresh]);

  const resetAll = useCallback(async () => {
    await browser.storage.local.clear();
    const defaults = defaultSettings();
    await browser.storage.local.set(defaults);
    await refresh();
  }, [refresh]);

  return {
    ready,
    values,
    lexicon,
    taste,
    keywords,
    users,
    items: MENU_ITEMS,
    defaultLevel: readCustomDefaultLevel(values),
    setBool,
    setFilter,
    setUsers,
    setKeywords,
    setDefaultLevel,
    updateTaste,
    resetTaste,
    updateLexicon,
    exportText,
    importText,
    resetAll,
    refresh,
  };
}
