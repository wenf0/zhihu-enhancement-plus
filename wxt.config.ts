import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';
import { EXT_VERSION } from './src/lib/version';

export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }),
  manifest: {
    name: '知乎增强优化',
    description: '噪音评分过滤、喜欢/不感兴趣回写权重、低饱和阅读、屏蔽与信息流整理。',
    version: EXT_VERSION,
    permissions: ['storage'],
    host_permissions: ['*://*.zhihu.com/*'],
    icons: {
      '16': 'icons/icon-16.png',
      '48': 'icons/icon-48.png',
      '128': 'icons/icon-128.png',
    },
    action: {
      default_title: '知乎增强优化',
      default_icon: {
        '16': 'icons/icon-16.png',
        '48': 'icons/icon-48.png',
        '128': 'icons/icon-128.png',
      },
    },
    options_ui: {
      open_in_tab: true,
    },
    web_accessible_resources: [
      {
        resources: ['jieba_rs_wasm_bg.wasm'],
        matches: ['*://*.zhihu.com/*'],
      },
    ],
  },
  hooks: {
    'build:manifestGenerated'(_wxt, manifest) {
      if (manifest.options_ui) manifest.options_ui.open_in_tab = true;
    },
  },
});
