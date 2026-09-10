import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { LexiconCat, LexiconData } from '@/lib/types';
import { downloadJsonFile, parseWords, uniqueWords } from '@/lib/utils';
import {
  cloneLexicon,
  lexiconExportFilename,
  newLexiconCatId,
  normalizeWordList,
  normalizeWordMap,
  parseLexiconImport,
  serializeLexiconBackup,
} from '@/lib/lexicon-io';

function sortCats(cats: Record<string, LexiconCat>) {
  return Object.values(cats).sort((a, b) => (a.level - b.level) || a.name.localeCompare(b.name, 'zh'));
}

function sortWordEntries(words: Record<string, number>) {
  return Object.entries(words).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh'));
}

function WordWeightTags({
  words,
  onRename,
  onWeight,
  onDelete,
}: {
  words: Record<string, number>;
  onRename: (from: string, to: string) => void;
  onWeight: (word: string, weight: number) => void;
  onDelete: (word: string) => void;
}) {
  const items = useMemo(() => sortWordEntries(words), [words]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (editing) setDraft(editing);
  }, [editing]);

  useEffect(() => {
    if (editing && !(editing in words)) setEditing(null);
  }, [words, editing]);

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
    return <p className="text-sm text-zinc-500">这个分类还没有词。</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([word, weight]) => {
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
                aria-label="编辑词"
              />
              <button
                type="button"
                className="h-5 w-5 rounded-full text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                disabled={weight <= 1}
                onClick={() => onWeight(word, weight - 1)}
              >
                −
              </button>
              <span className="min-w-6 text-center text-xs tabular-nums text-zinc-600">{weight}</span>
              <button
                type="button"
                className="h-5 w-5 rounded-full text-xs text-zinc-500 hover:bg-zinc-100 disabled:opacity-40"
                disabled={weight >= 20}
                onClick={() => onWeight(word, weight + 1)}
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
            title="点击编辑权重或删除"
            onClick={() => setEditing(word)}
            className="rounded-full"
          >
            <Badge className="cursor-pointer transition hover:bg-zinc-200">
              {word} · {weight}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

function StringListTags({
  items,
  emptyText,
  onRename,
  onDelete,
}: {
  items: string[];
  emptyText: string;
  onRename: (from: string, to: string) => void;
  onDelete: (word: string) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (editing) setDraft(editing);
  }, [editing]);

  useEffect(() => {
    if (editing && !items.includes(editing)) setEditing(null);
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

  if (!items.length) return <p className="text-sm text-zinc-500">{emptyText}</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(word => {
        if (editing === word) {
          return (
            <div
              key={word}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white py-0.5 pr-1 pl-2"
            >
              <input
                autoFocus
                className="h-6 w-28 border-0 bg-transparent text-xs outline-none"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitRename();
                  }
                  if (e.key === 'Escape') setEditing(null);
                }}
              />
              <button type="button" className="rounded-full px-1.5 text-xs text-red-600" onClick={() => onDelete(word)}>删除</button>
              <button type="button" className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white" onClick={commitRename}>完成</button>
            </div>
          );
        }
        return (
          <button key={word} type="button" className="rounded-full" onClick={() => setEditing(word)}>
            <Badge className="cursor-pointer hover:bg-zinc-200">{word}</Badge>
          </button>
        );
      })}
    </div>
  );
}

export function LexiconPane({
  lexicon,
  onSave,
  onReset,
}: {
  lexicon: LexiconData;
  onSave: (next: LexiconData) => Promise<void> | void;
  onReset: () => Promise<void> | void;
}) {
  const cats = useMemo(() => sortCats(lexicon.cats), [lexicon.cats]);
  const [catId, setCatId] = useState(cats[0]?.id || '');
  const [wordDraft, setWordDraft] = useState('');
  const [wordWeight, setWordWeight] = useState('5');
  const [excludeDraft, setExcludeDraft] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');

  useEffect(() => {
    if (!cats.length) {
      setCatId('');
      return;
    }
    if (!cats.some(c => c.id === catId)) setCatId(cats[0].id);
  }, [cats, catId]);

  const cat = catId ? lexicon.cats[catId] : null;
  const [catName, setCatName] = useState('');
  const [catLevel, setCatLevel] = useState('2');
  const [catC, setCatC] = useState('50');

  useEffect(() => {
    if (!cat) return;
    setCatName(cat.name);
    setCatLevel(String(cat.level));
    setCatC(String(cat.c));
  }, [cat?.id, cat?.name, cat?.level, cat?.c]);

  const commitCatMeta = async () => {
    if (!cat) return;
    const name = catName.trim() || cat.name;
    const level = Math.max(1, Math.min(3, Math.floor(Number(catLevel) || 1)));
    const c = Math.max(0, Math.min(100, Math.floor(Number(catC) || 0)));
    if (name === cat.name && level === cat.level && c === cat.c) return;
    await patch(draft => {
      const target = draft.cats[cat.id];
      if (!target) return;
      target.name = name;
      target.level = level;
      target.c = c;
    });
  };

  const patch = async (recipe: (draft: LexiconData) => void) => {
    const next = cloneLexicon(lexicon);
    recipe(next);
    await onSave(next);
  };

  const addWords = async () => {
    if (!cat) return;
    const added = uniqueWords(parseWords(wordDraft));
    if (!added.length) return;
    const weight = Math.max(1, Math.min(20, Math.floor(Number(wordWeight) || 5)));
    await patch(draft => {
      const target = draft.cats[cat.id];
      if (!target) return;
      const words = { ...target.words };
      for (const word of added) {
        const low = word.toLowerCase();
        const existing = Object.keys(words).find(k => k.toLowerCase() === low);
        if (existing) words[existing] = Math.max(words[existing] || 0, weight);
        else words[word] = weight;
      }
      target.words = normalizeWordMap(words);
    });
    setWordDraft('');
  };

  const addExcludes = async () => {
    if (!cat) return;
    const added = uniqueWords(parseWords(excludeDraft));
    if (!added.length) return;
    await patch(draft => {
      const target = draft.cats[cat.id];
      if (!target) return;
      target.excludes = normalizeWordList([...target.excludes, ...added]);
    });
    setExcludeDraft('');
  };

  const addCategory = async () => {
    const name = newCatName.trim();
    if (!name) return;
    let createdId = '';
    await patch(draft => {
      createdId = newLexiconCatId(draft.cats, name);
      draft.cats[createdId] = {
        id: createdId,
        name,
        level: 2,
        c: 50,
        words: {},
        excludes: [],
      };
    });
    setNewCatName('');
    if (createdId) setCatId(createdId);
  };

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">噪音词库</h2>
      <p className="text-sm text-zinc-500">
        分类与词条可增删改。同分类内词条大小写不敏感去重；跨分类允许同一词出现在多个分类。保存后整份词库写入本地。
      </p>

      <Card>
        <CardContent className="flex flex-wrap gap-2 pt-6">
          <Button
            variant="outline"
            onClick={() => downloadJsonFile(
              lexiconExportFilename(),
              JSON.stringify(serializeLexiconBackup(lexicon), null, 2),
            )}
          >
            导出词库
          </Button>
          <Button variant="outline" onClick={() => void onReset()}>恢复默认词库</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>分类</CardTitle>
          <CardDescription>可切换、新增、删除分类；下方编辑当前分类属性与词条。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {cats.map(item => (
              <Button
                key={item.id}
                size="sm"
                variant={catId === item.id ? 'default' : 'outline'}
                onClick={() => setCatId(item.id)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="新分类名称"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void addCategory();
                }
              }}
            />
            <Button onClick={() => void addCategory()}>新增分类</Button>
          </div>
        </CardContent>
      </Card>

      {cat && (
        <Card>
          <CardHeader>
            <CardTitle>编辑分类</CardTitle>
            <CardDescription>id: {cat.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="space-y-1 text-sm">
                <span className="text-zinc-500">名称</span>
                <Input
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  onBlur={() => void commitCatMeta()}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void commitCatMeta();
                    }
                  }}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-500">档位 L1–L3</span>
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={catLevel}
                  onChange={e => setCatLevel(e.target.value)}
                  onBlur={() => void commitCatMeta()}
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-zinc-500">分类分 c</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={catC}
                  onChange={e => setCatC(e.target.value)}
                  onBlur={() => void commitCatMeta()}
                />
              </label>
            </div>
            <Button
              variant="outline"
              className="text-red-600"
              onClick={() => {
                if (!confirm(`删除分类「${cat.name}」？`)) return;
                void patch(draft => {
                  delete draft.cats[cat.id];
                });
              }}
            >
              删除此分类
            </Button>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">词条 · {Object.keys(cat.words).length}</h3>
              <div className="flex flex-wrap gap-2">
                <Input
                  className="min-w-48 flex-1"
                  value={wordDraft}
                  onChange={e => setWordDraft(e.target.value)}
                  placeholder="添加词，逗号或换行分隔"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void addWords();
                    }
                  }}
                />
                <Input
                  className="w-20"
                  type="number"
                  min={1}
                  max={20}
                  value={wordWeight}
                  onChange={e => setWordWeight(e.target.value)}
                  title="默认权重"
                />
                <Button onClick={() => void addWords()}>添加</Button>
              </div>
              <WordWeightTags
                words={cat.words}
                onRename={(from, to) => {
                  void patch(draft => {
                    const target = draft.cats[cat.id];
                    if (!target || !(from in target.words)) return;
                    const weight = target.words[from];
                    delete target.words[from];
                    const low = to.toLowerCase();
                    const existing = Object.keys(target.words).find(k => k.toLowerCase() === low);
                    if (existing) target.words[existing] = Math.max(target.words[existing] || 0, weight);
                    else target.words[to] = weight;
                    target.words = normalizeWordMap(target.words);
                  });
                }}
                onWeight={(word, weight) => {
                  void patch(draft => {
                    const target = draft.cats[cat.id];
                    if (!target || !(word in target.words)) return;
                    target.words[word] = Math.max(1, Math.min(20, weight));
                  });
                }}
                onDelete={word => {
                  void patch(draft => {
                    const target = draft.cats[cat.id];
                    if (!target) return;
                    delete target.words[word];
                  });
                }}
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">排除词 · {cat.excludes.length}</h3>
              <div className="flex gap-2">
                <Input
                  value={excludeDraft}
                  onChange={e => setExcludeDraft(e.target.value)}
                  placeholder="排除词，逗号或换行分隔"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void addExcludes();
                    }
                  }}
                />
                <Button onClick={() => void addExcludes()}>添加</Button>
              </div>
              <StringListTags
                items={cat.excludes}
                emptyText="无排除词。"
                onRename={(from, to) => {
                  void patch(draft => {
                    const target = draft.cats[cat.id];
                    if (!target) return;
                    target.excludes = normalizeWordList(target.excludes.map(w => (w === from ? to : w)));
                  });
                }}
                onDelete={word => {
                  void patch(draft => {
                    const target = draft.cats[cat.id];
                    if (!target) return;
                    target.excludes = target.excludes.filter(w => w !== word);
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>全局表</CardTitle>
          <CardDescription>情绪 / 对立 / 标题党 / 价值白名单，与分类词表一起参与打分。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GlobalWordMap
            title="情绪词"
            words={lexicon.emotion}
            onChange={words => void patch(draft => { draft.emotion = words; })}
          />
          <GlobalWordMap
            title="价值白名单"
            words={lexicon.value}
            onChange={words => void patch(draft => { draft.value = words; })}
          />
          <GlobalStringList
            title="对立词"
            items={lexicon.controversy}
            onChange={items => void patch(draft => { draft.controversy = items; })}
          />
          <GlobalStringList
            title="标题党"
            items={lexicon.clickbait}
            onChange={items => void patch(draft => { draft.clickbait = items; })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>导入词库</CardTitle>
          <CardDescription>
            支持词库备份或完整设置 JSON。合并按分类 id 合并词条；替换整份覆盖。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="粘贴词库 JSON…"
            className="min-h-28 font-mono text-xs"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={async () => {
                try {
                  const result = parseLexiconImport(importText, lexicon, 'merge');
                  await onSave(result.lexicon);
                  setImportMsg(`已合并：${result.cats} 个分类，约 ${result.words} 条（来源 ${result.source}）`);
                } catch {
                  setImportMsg('导入失败：格式不对或为空');
                }
              }}
            >
              合并导入
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const result = parseLexiconImport(importText, lexicon, 'replace');
                  await onSave(result.lexicon);
                  setImportMsg(`已替换：${result.cats} 个分类，约 ${result.words} 条（来源 ${result.source}）`);
                } catch {
                  setImportMsg('导入失败：格式不对或为空');
                }
              }}
            >
              替换导入
            </Button>
          </div>
          {importMsg ? <p className="text-sm text-zinc-500">{importMsg}</p> : null}
        </CardContent>
      </Card>
    </section>
  );
}

function GlobalWordMap({
  title,
  words,
  onChange,
}: {
  title: string;
  words: Record<string, number>;
  onChange: (words: Record<string, number>) => void;
}) {
  const [draft, setDraft] = useState('');
  const [weight, setWeight] = useState('5');
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title} · {Object.keys(words).length}</h3>
      <div className="flex flex-wrap gap-2">
        <Input
          className="min-w-40 flex-1"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="添加词"
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const added = uniqueWords(parseWords(draft));
            if (!added.length) return;
            const w = Math.max(1, Math.min(20, Math.floor(Number(weight) || 5)));
            const next = { ...words };
            for (const word of added) {
              const low = word.toLowerCase();
              const existing = Object.keys(next).find(k => k.toLowerCase() === low);
              if (existing) next[existing] = Math.max(next[existing] || 0, w);
              else next[word] = w;
            }
            onChange(normalizeWordMap(next));
            setDraft('');
          }}
        />
        <Input className="w-20" type="number" min={1} max={20} value={weight} onChange={e => setWeight(e.target.value)} />
        <Button
          onClick={() => {
            const added = uniqueWords(parseWords(draft));
            if (!added.length) return;
            const w = Math.max(1, Math.min(20, Math.floor(Number(weight) || 5)));
            const next = { ...words };
            for (const word of added) {
              const low = word.toLowerCase();
              const existing = Object.keys(next).find(k => k.toLowerCase() === low);
              if (existing) next[existing] = Math.max(next[existing] || 0, w);
              else next[word] = w;
            }
            onChange(normalizeWordMap(next));
            setDraft('');
          }}
        >
          添加
        </Button>
      </div>
      <WordWeightTags
        words={words}
        onRename={(from, to) => {
          const next = { ...words };
          const w = next[from];
          delete next[from];
          const low = to.toLowerCase();
          const existing = Object.keys(next).find(k => k.toLowerCase() === low);
          if (existing) next[existing] = Math.max(next[existing] || 0, w);
          else next[to] = w;
          onChange(normalizeWordMap(next));
        }}
        onWeight={(word, w) => onChange(normalizeWordMap({ ...words, [word]: w }))}
        onDelete={word => {
          const next = { ...words };
          delete next[word];
          onChange(next);
        }}
      />
    </div>
  );
}

function GlobalStringList({
  title,
  items,
  onChange,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  const [draft, setDraft] = useState('');
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">{title} · {items.length}</h3>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="添加词"
          onKeyDown={e => {
            if (e.key !== 'Enter') return;
            e.preventDefault();
            const added = uniqueWords(parseWords(draft));
            if (!added.length) return;
            onChange(normalizeWordList([...items, ...added]));
            setDraft('');
          }}
        />
        <Button
          onClick={() => {
            const added = uniqueWords(parseWords(draft));
            if (!added.length) return;
            onChange(normalizeWordList([...items, ...added]));
            setDraft('');
          }}
        >
          添加
        </Button>
      </div>
      <StringListTags
        items={items}
        emptyText="空"
        onRename={(from, to) => onChange(normalizeWordList(items.map(w => (w === from ? to : w))))}
        onDelete={word => onChange(items.filter(w => w !== word))}
      />
    </div>
  );
}
