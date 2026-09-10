# 知乎增强优化（Zhihu Enhancement Plus）

原「知乎增强」的结构化优化版：噪音评分过滤（结巴分词整词匹配）、喜欢/不感兴趣回写词权重、低饱和配色、隐藏右侧栏、清空标签标题与图标、移除登录弹窗、屏蔽视频/盐选、默认收起回答、屏蔽用户、原图与站外直链、时间置顶等。

基于 [XIU2/UserScript](https://github.com/XIU2/UserScript) 的「知乎增强」2.2.15，许可证为 GPL-3.0。

互联网内容噪音屏蔽的论文精读清单（DOI / 开放 PDF）：[docs/content-noise-readings.md](docs/content-noise-readings.md)。

## 安装

- Greasy Fork：https://greasyfork.org/zh-CN/scripts/595014-知乎增强优化
- GitHub：https://github.com/wenf0/zhihu-enhancement-plus

## 开发

油猴只能装一个文件，所以仓库里同时保留拆开的源码和打包结果：

- 源码：`src/`（按功能拆文件）
- 结巴 WASM glue：`vendor/jieba-rs-wasm-glue.js`
- 安装 / 更新用：根目录 `zhihu-enhancement-plus.user.js`

```bash
node scripts/pack.mjs          # 拼回 user.js
node scripts/pack.mjs --check  # 检查打包结果是否过期
```

拼接顺序见 `scripts/sources.mjs`。不要在源码里用 `import` / `export`，打包只是按顺序拼接。
