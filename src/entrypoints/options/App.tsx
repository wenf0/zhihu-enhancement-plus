import { useMemo, useState } from 'react';
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
import { CUSTOM_LEVEL_IDS, CUSTOM_LEVEL_LABELS, type FilterMode } from '@/lib/types';
import { downloadJsonFile, parseWords, uniqueWords } from '@/lib/utils';
import { settingsExportFilename } from '@/lib/storage';
import { useSettings } from '@/lib/use-settings';
import { EXT_VERSION } from '@/lib/version';
import { NOISE_CATEGORIES } from '@/lib/noise/lexicon';

type Pane = 'appearance' | 'reading' | 'filter' | 'keywords' | 'users' | 'lexicon' | 'taste' | 'backup';

const NAV: Array<{ id: Pane; title: string; desc: string }> = [
  { id: 'appearance', title: '外观', desc: '配色、侧栏、标签页' },
  { id: 'reading', title: '阅读', desc: '收起、时间、标签' },
  { id: 'filter', title: '过滤', desc: '噪音档位与类别' },
  { id: 'keywords', title: '关键词', desc: '自定义屏蔽词' },
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
  const [kwDraft, setKwDraft] = useState('');
  const [importDraft, setImportDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [catId, setCatId] = useState(NOISE_CATEGORIES[0]?.id || 'celebrity');

  const cat = useMemo(() => settings.lexicon?.cats[catId], [settings.lexicon, catId]);

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

        {pane === 'keywords' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">自定义关键词</h2>
            <Card>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {CUSTOM_LEVEL_IDS.map(level => (
                    <Button
                      key={level}
                      size="sm"
                      variant={settings.defaultLevel === level ? 'default' : 'outline'}
                      onClick={() => void settings.setDefaultLevel(level)}
                    >
                      默认 {CUSTOM_LEVEL_LABELS[level]}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={kwDraft} onChange={e => setKwDraft(e.target.value)} placeholder="添加词，逗号或换行分隔" />
                  <Button onClick={() => {
                    const added = uniqueWords(parseWords(kwDraft));
                    if (!added.length) return;
                    const next = [...settings.keywords];
                    for (const word of added) {
                      if (next.some(x => x.word.toLowerCase() === word.toLowerCase())) continue;
                      next.push({ word, on: true, level: settings.defaultLevel });
                    }
                    void settings.setKeywords(next);
                    setKwDraft('');
                  }}>添加</Button>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {settings.keywords.map((item, index) => (
                <Card key={item.word + index}>
                  <CardContent className="flex flex-wrap items-center gap-3 py-3">
                    <Switch checked={item.on} onCheckedChange={on => {
                      const next = settings.keywords.map((row, i) => i === index ? { ...row, on } : row);
                      void settings.setKeywords(next);
                    }} />
                    <div className="min-w-0 flex-1 font-medium">{item.word}</div>
                    {CUSTOM_LEVEL_IDS.map(level => (
                      <Button
                        key={level}
                        size="sm"
                        variant={item.level === level ? 'default' : 'ghost'}
                        onClick={() => {
                          const next = settings.keywords.map((row, i) => i === index ? { ...row, level } : row);
                          void settings.setKeywords(next);
                        }}
                      >
                        {CUSTOM_LEVEL_LABELS[level]}
                      </Button>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => {
                      void settings.setKeywords(settings.keywords.filter((_, i) => i !== index));
                    }}>删除</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {pane === 'users' && (
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold">屏蔽用户</h2>
            <Card>
              <CardContent className="flex gap-2">
                <Input value={userDraft} onChange={e => setUserDraft(e.target.value)} placeholder="用户名，逗号分隔" />
                <Button onClick={() => {
                  const added = uniqueWords(parseWords(userDraft));
                  void settings.setUsers(uniqueWords([...settings.users, ...added]));
                  setUserDraft('');
                }}>添加</Button>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {settings.users.map(name => (
                <Card key={name}>
                  <CardContent className="flex items-center justify-between py-3">
                    <span>{name}</span>
                    <Button size="sm" variant="ghost" onClick={() => void settings.setUsers(settings.users.filter(x => x !== name))}>删除</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
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
              <CardContent className="space-y-2">
                <p>已记录 {settings.taste.clicks} 次喜欢 / 不感兴趣。</p>
                <p className="text-sm text-zinc-500">噪音词 {Object.keys(settings.taste.words).length} · 分类 {Object.keys(settings.taste.cats).length} · 新词 {Object.keys(settings.taste.learned).length}</p>
                <Button variant="outline" onClick={() => void settings.resetTaste()}>清空口味</Button>
              </CardContent>
            </Card>
            <div className="flex flex-wrap gap-2">
              {Object.entries(settings.taste.learned).slice(0, 40).map(([word, item]) => (
                <Badge key={word}>{word} {item.delta > 0 ? `+${item.delta}` : item.delta}</Badge>
              ))}
            </div>
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
