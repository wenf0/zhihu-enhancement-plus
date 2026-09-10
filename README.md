# 知乎增强优化（Zhihu Enhancement Plus）

原「知乎增强」的结构化优化版：噪音评分过滤（结巴分词整词匹配）、喜欢/不感兴趣回写词权重、低饱和配色、隐藏右侧栏、清空标签标题与图标、移除登录弹窗、屏蔽视频/盐选、默认收起回答、屏蔽用户、原图与站外直链、时间置顶等。

基于 [XIU2/UserScript](https://github.com/XIU2/UserScript) 的「知乎增强」2.2.15，许可证为 GPL-3.0。

互联网内容噪音屏蔽的论文精读清单（DOI / 开放 PDF）：[docs/content-noise-readings.md](docs/content-noise-readings.md)。

## 安装

- Greasy Fork：https://greasyfork.org/zh-CN/scripts/595014-知乎增强优化
- GitHub：https://github.com/wenf0/zhihu-enhancement-plus

## 开发

源码是 TypeScript 模块，用 Vite 打成**单文件、不压缩**的油猴脚本。

- 源码：`src/*.ts`
- 样式：`src/styles/*.css`（设置面板 / 评分说明 / 信息流角标）
- 结巴 WASM glue：`vendor/jieba-rs-wasm-glue.js`
- 安装 / 更新用：根目录 `zhihu-enhancement-plus.user.js`
- 依赖更新：GitHub Dependabot 会盯 `package.json`

```bash
npm install
npm run preview:ui   # 本地预览设置/角标样式
npm run dev          # 开发用 userscript（安装列表里带 dev: 前缀）
npm run build        # 产出 dist/*.user.js 并复制到仓库根目录
```

改完样式刷新预览页即可。版本号只改 `src/version.ts`。
