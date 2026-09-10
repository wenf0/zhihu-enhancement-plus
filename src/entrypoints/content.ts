import { boot } from '@/lib/content/boot';
import { invalidateNoise } from '@/lib/content/state';
import { loadSettings } from '@/lib/storage';

export default defineContentScript({
  matches: ['*://www.zhihu.com/*', '*://zhuanlan.zhihu.com/*'],
  runAt: 'document_start',
  async main() {
    await loadSettings();
    boot();
    browser.storage.onChanged.addListener(() => {
      invalidateNoise();
    });
  },
});
