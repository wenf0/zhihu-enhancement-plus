# 知乎增强优化（Zhihu Enhancement Plus）

Chrome 扩展（Manifest V3）：噪音评分过滤（结巴分词整词匹配）、喜欢/不感兴趣回写词权重、低饱和配色、隐藏右侧栏、清空标签标题与图标、移除登录弹窗、屏蔽视频/盐选、默认收起回答、屏蔽用户、原图与站外直链、时间置顶等。

基于 [XIU2/UserScript](https://github.com/XIU2/UserScript) 的「知乎增强」2.2.15，许可证为 GPL-3.0。

互联网内容噪音屏蔽的论文精读清单（DOI / 开放 PDF）：[docs/content-noise-readings.md](docs/content-noise-readings.md)。

## 安装

1. `npm install && npm run build`
2. Chrome 打开 `chrome://extensions`
3. 打开「开发者模式」
4. 「加载已解压的扩展程序」，选仓库里的 `.output/chrome-mv3`

设置页：工具栏图标 →「打开完整设置」，或扩展详情里的「扩展程序选项」。

## 开发

现代栈：**WXT + TypeScript + React 19 + Tailwind CSS v4 + shadcn/ui**。

- 内容脚本：`src/entrypoints/content.ts`，页面逻辑在 `src/lib/content/`
- 打分 / 词库 / 结巴：`src/lib/noise/`
- 设置页：`src/entrypoints/options/`（React + shadcn）
- 弹层：`src/entrypoints/popup/`
- 存储：`chrome.storage.local`
- 结巴 WASM：`public/jieba_rs_wasm_bg.wasm`

```bash
npm install
npm run dev      # 开发模式，自动装进浏览器
npm run build    # 产出 .output/chrome-mv3
npm run typecheck
```

版本号只改 `src/lib/version.ts`。
