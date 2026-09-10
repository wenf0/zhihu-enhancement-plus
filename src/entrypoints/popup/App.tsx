import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MENU_ITEMS, QUICK_TOGGLE_KEYS } from '@/lib/defaults';
import { useSettings } from '@/lib/use-settings';
import { EXT_VERSION } from '@/lib/version';

export function App() {
  const { ready, values, setBool } = useSettings();

  if (!ready) return <div className="w-80 p-5 text-sm text-zinc-500">加载设置…</div>;

  return (
    <div className="w-80 p-4">
      <div className="mb-3">
        <p className="text-[11px] tracking-[0.16em] text-zinc-400 uppercase">Zhihu Plus</p>
        <h1 className="text-lg font-semibold">知乎增强优化</h1>
        <p className="text-xs text-zinc-500">v{EXT_VERSION} · Chrome 扩展</p>
      </div>
      <div className="space-y-2">
        {QUICK_TOGGLE_KEYS.map(key => {
          const item = MENU_ITEMS.find(x => x.key === key);
          if (!item) return null;
          return (
            <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5">
              <span className="text-sm">{item.label}</span>
              <Switch checked={!!values[key]} onCheckedChange={on => void setBool(key, on)} />
            </label>
          );
        })}
      </div>
      <Button className="mt-4 w-full" onClick={() => void browser.runtime.openOptionsPage()}>
        打开完整设置
      </Button>
    </div>
  );
}
