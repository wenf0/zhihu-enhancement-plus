import { boot, syncUiFromSettings } from '@/lib/content/boot';
import { refreshNoiseFeed } from '@/lib/content/noise-ui';
import { invalidateNoise } from '@/lib/content/state';
import { loadSettings, watchSettings } from '@/lib/storage';

export default defineContentScript({
  matches: ['*://www.zhihu.com/*', '*://zhuanlan.zhihu.com/*'],
  runAt: 'document_start',
  async main() {
    await loadSettings();
    boot();
    watchSettings(() => {
      invalidateNoise();
      syncUiFromSettings();
      refreshNoiseFeed();
    });
  },
});
