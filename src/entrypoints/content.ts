import { boot, syncUiFromSettings } from '@/lib/content/boot';
import { consumeLocalTasteWrite, refreshNoiseFeed } from '@/lib/content/noise-ui';
import { invalidateNoise } from '@/lib/content/state';
import { loadSettings, watchSettings } from '@/lib/storage';
import { TASTE_KEY } from '@/lib/types';

export default defineContentScript({
  matches: ['*://www.zhihu.com/*', '*://zhuanlan.zhihu.com/*'],
  runAt: 'document_start',
  async main() {
    await loadSettings();
    boot();
    watchSettings(changes => {
      invalidateNoise();
      syncUiFromSettings();
      const keys = Object.keys(changes);
      if (keys.length === 1 && keys[0] === TASTE_KEY && consumeLocalTasteWrite()) return;
      refreshNoiseFeed();
    });
  },
});
