import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  APPEARANCE_KEYS,
  BLOCK_TYPE_KEYS,
  FILTER_TOGGLE_KEYS,
  MENU_ITEMS,
  NOISE_LEVEL_KEYS,
  READING_KEYS,
} from '@/lib/defaults';
import { type FilterMode, type TasteEntry, type TastePrefs } from '@/lib/types';
import { downloadJsonFile, parseWords, uniqueWords } from '@/lib/utils';
import { settingsExportFilename } from '@/lib/storage';
import { useSettings } from '@/lib/use-settings';
import { EXT_VERSION } from '@/lib/version';
import { NOISE_CATEGORIES } from '@/lib/noise/lexicon';
import {
  parseTasteImport,
  serializeTasteBackup,
  tasteExportFilename,
} from '@/lib/taste-io';

/** 与 src/lib/noise/taste.ts 的 TASTE_LEARNED_RANGE 保持一致 */
const LEARNED_DELTA_RANGE = [-8, 12] as const;

function clampLearnedDelta(n: number) {
  return Math.max(LEARNED_DELTA_RANGE[0], Math.min(LEARNED_DELTA_RANGE[1], n));
}

function emptyTasteEntry(): TasteEntry {
  return { like: 0, dislike: 0, delta: 0 };
}

function mergeTasteEntries(a: TasteEntry, b: TasteEntry): TasteEntry {
  return {
    like: (a.like || 0) + (b.like || 0),
    dislike: (a.dislike || 0) + (b.dislike || 0),
    delta: clampLearnedDelta((a.delta || 0) + (b.delta || 0)),
  };
}

function formatDelta(n: number) {
  return n > 0 ? `+${n}` : String(n);
}

function sortLearnedEntries(learned: Record<string, TasteEntry>) {
  return Object.entries(learned).sort((a, b) => {
    const da = Math.abs(a[1]?.delta || 0);
    const db = Math.abs(b[1]?.delta || 0);
    if (db !== da) return db - da;
    return a[0].localeCompare(b[0], 'zh');
  });
}

function LearnedWordTags({
  items,
  onRename,
  onDelta,
  onDelete,
}: {
  items: Array<[string, TasteEntry]>;
  onRename: (from: string, to: string) => void;
  onDelta: (word: string, delta: number) => void;
  onDelete: (word: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (editing) setDraft(editing);
  }, [editing]);

  useEffect(() => {
    if (editing && !items.some(([word]) => word === editing)) setEditing(null);
  }, [items, editing]);

  const commitRename = () => {
    if (!editing) return;
    const next = draft.replace(/\s+/g, '').trim();
    if (!next || next === editing) {
      setDraft(editing);
      setEditing(null);
      return;
    }
    onRename(editing, next);
    setEditing(next);
  };

  if (!items.length) {
    return <p className="text-sm text-zinc-500">还没有口味新词。在信息流点「喜欢 / 不感兴趣」，或上方手动添加。</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([word, entry]) => {
        if (editing === word) {
          return (
            <div
              key={word}
              className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-zinc-300 bg-white py-0.5 pr-1 pl-2 shadow-sm"
            >
              <input
                autoFocus
                className="h-6 w-24 min-w-0 border-0 bg-transparent text-xs outline-none"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitRename();
                  }
                  if (e.key === 'Escape') setEditing(null);
                }}
                aria-label="编辑口味词"
              />
              <button
                type="button"
                className="h-5 w-5 rounded-full text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                disabled={(entry.delta || 0) <= LEARNED_DELTA_RANGE[0]}
                onClick={() => onDelta(word, (entry.delta || 0) - 1)}
              >
                −
              </button>
              <span className="min-w-6 text-center text-xs tabular-nums text-zinc-600">{formatDelta(entry.delta || 0)}</span>
              <button
                type="button"
                className="h-5 w-5 rounded-full text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                disabled={(entry.delta || 0) >= LEARNED_DELTA_RANGE[1]}
                onClick={() => onDelta(word, (entry.delta || 0) + 1)}
              >
                +
              </button>
              <button
                type="button"
                className="rounded-full px-1.5 text-xs text-red-600 hover:bg-red-50"
                onClick={() => {
                  onDelete(word);
                  setEditing(null);
                }}
              >
                删除
              </button>
              <button
                type="button"
                className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white hover:bg-zinc-800"
                onClick={commitRename}
              >
                完成
              </button>
            </div>
          );
        }

        return (
          <button
            key={word}
            type="button"
            title="点击编辑或删除"
            onClick={() => setEditing(word)}
            className="rounded-full"
          >
            <Badge className="cursor-pointer transition hover:bg-zinc-200">
              {word} {formatDelta(entry.delta || 0)}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

function UserTags({
  users,
  onRename,
  onDelete,
}: {
  users: string[];
  onRename: (from: string, to: string) => void;
  onDelete: (name: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (editing) setDraft(editing);
  }, [editing]);

  useEffect(() => {
    if (editing && !users.includes(editing)) setEditing(null);
  }, [users, editing]);

  const commitRename = () => {
    if (!editing) return;
    const next = draft.replace(/\s+/g, '').trim();
    if (!next || next === editing) {
      setDraft(editing);
      setEditing(null);
      return;
    }
    onRename(editing, next);
    setEditing(next);
  };

  if (!users.length) {
    return <p className="text-sm text-zinc-500">还没有屏蔽用户。上方可添加用户名。</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {users.map(name => {
        if (editing === name) {
          return (
            <div
              key={name}
              className="inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-zinc-300 bg-white py-0.5 pr-1 pl-2 shadow-sm"
            >
              <input
                autoFocus
                className="h-6 w-28 min-w-0 border-0 bg-transparent text-xs outline-none"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitRename();
                  }
                  if (e.key === 'Escape') setEditing(null);
                }}
                aria-label="编辑用户名"
              />
              <button
                type="button"
                className="rounded-full px-1.5 text-xs text-red-600 hover:bg-red-50"
                onClick={() => {
                  onDelete(name);
                  setEditing(null);
                }}
              >
                删除
              </button>
              <button
                type="button"
                className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white hover:bg-zinc-800"
                onClick={commitRename}
              >
                完成
              </button>
            </div>
          );
        }

        return (
          <button
            key={name}
            type="button"
            title="点击编辑或删除"
            onClick={() => setEditing(name)}
            className="rounded-full"
          >
            <Badge className="cursor-pointer transition hover:bg-zinc-200">{name}</Badge>
          </button>
        );
      })}
    </div>
  );
}

type Pane = 'appearance' | 'reading' | 'filter' | 'users' | 'lexicon' | 'taste' | 'backup';

const NAV: Array<{ id: Pane; title: string; desc: string }> = [
  { id: 'appearance', title: '外观', desc: '配色、侧栏、标签页' },
  { id: 'reading', title: '阅读', desc: '收起、时间、标签' },
  { id: 'filter', title: '过滤', desc: '噪音档位与类别' },
  { id: 'users', title: '用户', desc: '屏蔽名单' },
  { id: 'lexicon', title: '词库', desc: '分类词与权重' },
  { id: 'taste', title: '口味', desc: '喜欢 / 不感兴趣' },
  { id: 'backup', title: '备份', desc: '导入导出' },
];

function ToggleList({ keys, values, setBool }: {
  keys: string[];
  values: Record<string, unknown>;
  setBool: (key: string, value: boolean) => Promise<void>;
}) {
  return (
    <div className="space-y-3">
      {keys.map(key => {
        const item = MENU_ITEMS.find(x => x.key === key);
        if (!item) return null;
        return (
          <Card key={key}>
            <CardContent className="flex items-center justify-between gap-6 py-4">
              <div>
                <div className="font-semibold">{item.label}</div>
                <p className="mt-1 text-sm text-zinc-500">{item.tip}</p>
              </div>
              <Switch checked={!!values[key]} onCheckedChange={on => void setBool(key, on)} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function App() {
  const settings = useSettings();
  const [pane, setPane] = useState<Pane>('appearance');
  const [userDraft, setUserDraft] = useState('');
  const [importDraft, setImportDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [catId, setCatId] = useState(NOISE_CATEGORIES[0]?.id || 'celebrity');
  const [tasteDraft, setTasteDraft] = useState('');
  const [tasteImportDraft, setTasteImportDraft] = useState('');

  const cat = useMemo(() => settings.lexicon?.cats[catId], [settings.lexicon, catId]);
  const learnedList = useMemo(
    () => sortLearnedEntries(settings.taste.learned || {}),
    [settings.taste.learned],
  );

  const patchLearned = (mutate: (learned: Record<string, TasteEntry>) => void) => {
    const next: TastePrefs = {
      ...settings.taste,
      learned: { ...(settings.taste.learned || {}) },
    };
    mutate(next.learned);
    void settings.updateTaste(next);
  };

  if (!settings.ready) {
    return <div className="p-10 text-sm text-zinc-500">正在读取 chrome.storage…</div>;
  }

  const filter = (settings.values.menu_blockKeywords || 'hide') as FilterMode;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="sticky top-0 flex h-screen w-64 flex-col border-r border-zinc-200 bg-white p-5">
        <p className="text-[11px] tracking-[0.16em] text-zinc-400 uppercase">Extension</p>
        <h1 className="mt-1 text-xl font-semibold">知乎增强优化</h1>
        <p className="mt-1 text-xs text-zinc-500">v{EXT_VERSION} · Manifest V3</p>
        <nav className="mt-6 flex flex-1 flex-col gap-1 overflow-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPane(item.id)}
              className={`rounded-xl px-3 py-2.5 text-left ${pane === item.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
              <strong className="block text-sm font-semibold">{item.title}</strong>
              <span className={`text-xs ${pane === item.id ? 'text-white/70' : 'text-zinc-400'}`}>{item.desc}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {notice && <div className="mb-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white">{notice}</div>}

        {pane === 'appearance' && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold">外观</h2>
            <ToggleList keys={APPEARANCE_KEYS} values={settings.values} setBool={settings.setBool} />
          </section>
        )}

        {pane === 'reading' && (
          <section>
            <h2 className="mb-4 text-2xl font-semibold">阅读</h2>
            <ToggleList keys={READING_KEYS} values={settings.values} setBool={settings.setBool} />
          </section>
        )}

        {pane === 'filter' && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">过滤</h2>
            <ToggleList keys={FILTER_TOGGLE_KEYS} values={settings.values} setBool={settings.setBool} />
            <Card>
              <CardHeader>
                <CardTitle>噪音过滤强度</CardTitle>
                <CardDescription>关闭只打分；仅降权会变淡；隐藏会移出信息流。</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-2">
                {(['off', 'demote', 'hide'] as FilterMode[]).map(mode => (
                  <Button key={mode} variant={filter === mode ? 'default' : 'outline'} onClick={() => void settings.setFilter(mode)}>
                    {mode === 'off' ? '关闭' : mode === 'demote' ? '仅降权' : '隐藏'}
                  </Button>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>噪音档位</CardTitle>
                <CardDescription>L1 最狠，L3 最轻。</CardDescription>
              </CardHeader>
              <CardContent>
                <ToggleList keys={NOISE_LEVEL_KEYS} values={settings.values} setBool={settings.setBool} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>屏蔽类别</CardTitle>
              </CardHeader>
              <CardContent>
                <ToggleList keys={BLOCK_TYPE_KEYS} values={settings.values} setBool={settings.setBool} />
              </CardContent>
            </Card>
          </section>
        )}

        {pane === 'users' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">屏蔽用户</h2>
            <Card>
              <CardContent className="space-y-3">
                <p className="text-sm text-zinc-500">共 {settings.users.length} 人 · 点击标签可改名或删除</p>
                <div className="flex gap-2">
                  <Input
                    value={userDraft}
                    onChange={e => setUserDraft(e.target.value)}
                    placeholder="用户名，逗号分隔"
                    onKeyDown={e => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      const added = uniqueWords(parseWords(userDraft));
                      if (!added.length) return;
                      void settings.setUsers(uniqueWords([...settings.users, ...added]));
                      setUserDraft('');
                    }}
                  />
                  <Button onClick={() => {
                    const added = uniqueWords(parseWords(userDraft));
                    if (!added.length) return;
                    void settings.setUsers(uniqueWords([...settings.users, ...added]));
                    setUserDraft('');
                  }}>添加</Button>
                </div>
              </CardContent>
            </Card>
            <UserTags
              users={settings.users}
              onRename={(from, to) => {
                const next = settings.users
                  .map(name => (name === from ? to : name))
                  .filter((name, index, list) => list.findIndex(x => x.toLowerCase() === name.toLowerCase()) === index);
                void settings.setUsers(next);
              }}
              onDelete={name => {
                void settings.setUsers(settings.users.filter(x => x !== name));
              }}
            />
          </section>
        )}

        {pane === 'lexicon' && settings.lexicon && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">噪音词库</h2>
            <div className="flex flex-wrap gap-2">
              {NOISE_CATEGORIES.map(item => (
                <Button key={item.id} size="sm" variant={catId === item.id ? 'default' : 'outline'} onClick={() => setCatId(item.id)}>
                  {item.name}
                </Button>
              ))}
            </div>
            {cat && (
              <Card>
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>L{cat.level} · 分类分 {cat.c} · {Object.keys(cat.words).length} 词</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {Object.entries(cat.words).map(([word, weight]) => (
                    <Badge key={word}>{word} · {weight}</Badge>
                  ))}
                </CardContent>
              </Card>
            )}
            <p className="text-sm text-zinc-500">完整词库编辑仍可从备份 JSON 导入；页面上先按分类查看当前生效词。</p>
          </section>
        )}

        {pane === 'taste' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">口味学习</h2>
            <Card>
              <CardContent className="space-y-3">
                <p>已记录 {settings.taste.clicks} 次喜欢 / 不感兴趣。</p>
                <p className="text-sm text-zinc-500">
                  噪音词 {Object.keys(settings.taste.words).length} · 分类 {Object.keys(settings.taste.cats).length} · 新词 {learnedList.length}
                  {' · '}点击标签可改词、调权或删除；不喜欢略强于喜欢，重复点击增量会减弱
                </p>
                <div className="flex gap-2">
                  <Input
                    value={tasteDraft}
                    onChange={e => setTasteDraft(e.target.value)}
                    placeholder="手动添加词，逗号或换行分隔"
                    onKeyDown={e => {
                      if (e.key !== 'Enter') return;
                      e.preventDefault();
                      const added = uniqueWords(parseWords(tasteDraft));
                      if (!added.length) return;
                      patchLearned(learned => {
                        for (const word of added) {
                          if (learned[word]) continue;
                          learned[word] = { ...emptyTasteEntry(), delta: -1, like: 1 };
                        }
                      });
                      setTasteDraft('');
                    }}
                  />
                  <Button onClick={() => {
                    const added = uniqueWords(parseWords(tasteDraft));
                    if (!added.length) return;
                    patchLearned(learned => {
                      for (const word of added) {
                        if (learned[word]) continue;
                        learned[word] = { ...emptyTasteEntry(), delta: -1, like: 1 };
                      }
                    });
                    setTasteDraft('');
                  }}>添加</Button>
                  <Button variant="outline" onClick={() => void settings.resetTaste()}>清空</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadJsonFile(
                      tasteExportFilename(),
                      JSON.stringify(serializeTasteBackup(settings.taste), null, 2),
                    )}
                  >
                    导出口味
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>导入口味</CardTitle>
                <CardDescription>
                  支持口味备份、完整设置 JSON、旧关键词备份，或纯词数组。合并会累加已有词；替换会整份覆盖口味。
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={tasteImportDraft}
                  onChange={e => setTasteImportDraft(e.target.value)}
                  placeholder="粘贴 JSON"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={async () => {
                    try {
                      const result = parseTasteImport(tasteImportDraft, settings.taste, 'merge');
                      await settings.updateTaste(result.taste);
                      setNotice(`已合并口味（${result.source}）· ${result.added} 项`);
                      setTasteImportDraft('');
                    } catch {
                      setNotice('导入口味失败：JSON 格式不对');
                    }
                  }}>合并导入</Button>
                  <Button variant="outline" onClick={async () => {
                    try {
                      const result = parseTasteImport(tasteImportDraft, settings.taste, 'replace');
                      await settings.updateTaste(result.taste);
                      setNotice(`已替换口味（${result.source}）· ${result.added} 项`);
                      setTasteImportDraft('');
                    } catch {
                      setNotice('导入口味失败：JSON 格式不对');
                    }
                  }}>替换导入</Button>
                </div>
              </CardContent>
            </Card>
            <LearnedWordTags
              items={learnedList}
              onRename={(from, to) => {
                patchLearned(learned => {
                  if (!learned[from] || from === to) return;
                  const cur = learned[from];
                  delete learned[from];
                  learned[to] = learned[to] ? mergeTasteEntries(learned[to], cur) : cur;
                });
              }}
              onDelta={(target, delta) => {
                patchLearned(learned => {
                  const cur = learned[target];
                  if (!cur) return;
                  learned[target] = {
                    ...cur,
                    delta: clampLearnedDelta(delta),
                  };
                });
              }}
              onDelete={target => {
                patchLearned(learned => {
                  delete learned[target];
                });
              }}
            />
          </section>
        )}

        {pane === 'backup' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">备份</h2>
            <Card>
              <CardContent className="flex flex-wrap gap-2">
                <Button onClick={() => downloadJsonFile(settingsExportFilename(), settings.exportText())}>导出 JSON</Button>
                <Button variant="outline" onClick={() => void settings.resetAll()}>恢复默认</Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>导入</CardTitle>
                <CardDescription>兼容旧油猴脚本导出的 settings JSON。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea value={importDraft} onChange={e => setImportDraft(e.target.value)} placeholder="粘贴 JSON" />
                <Button onClick={async () => {
                  try {
                    const n = await settings.importText(importDraft);
                    setNotice(`已导入 ${n} 项`);
                    setImportDraft('');
                  } catch {
                    setNotice('导入失败：JSON 格式不对');
                  }
                }}>导入</Button>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
}
