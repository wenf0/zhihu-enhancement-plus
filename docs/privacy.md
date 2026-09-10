# 隐私政策 · 知乎增强优化

最后更新：2026-09-10

本扩展（「知乎增强优化」/ Zhihu Enhancement Plus）尊重隐私。下文说明扩展如何处理数据。

## 我们收集什么

**本扩展不向开发者或任何第三方服务器上传你的浏览内容、账号或设置。**

扩展可能在你的浏览器本地保存：

- 功能开关与界面偏好（如阅读增强、屏蔽选项）
- 自定义屏蔽用户名单
- 噪音词库与口味学习数据（喜欢 / 不感兴趣产生的本地权重）
- 其它你在设置页主动导入的备份 JSON

以上数据存放在 Chrome 的 `chrome.storage.local`（仅本机 / 你的浏览器配置文件内）。

## 权限用途

| 权限 | 用途 |
|------|------|
| `storage` | 在本地读写上述设置与词库 |
| 访问 `*.zhihu.com` | 在知乎页面注入内容脚本，实现过滤、评分、阅读增强 |

扩展不会申请身份、位置、摄像头等无关权限，也不会读取你在其它网站上的数据。

## 我们不做什么

- 不出售用户数据
- 不将数据用于广告定向或与扩展功能无关的用途
- 不把知乎页面正文、账号 Cookie 或设置同步到开发者服务器（本扩展没有此类后端）

## 数据控制

你可以随时：

- 在扩展设置页导出 / 导入 / 清空设置与词库
- 在 Chrome「扩展程序」中移除本扩展（将删除其本地存储）
- 使用 Chrome 清除网站数据时注意扩展存储可能独立于站点 Cookie

## 第三方

本扩展在知乎页面运行，知乎平台自身的隐私政策适用该网站。本扩展不改变知乎服务器如何处理你的账号数据。

## 联系

问题或隐私相关请求，请通过 GitHub Issues 联系：

https://github.com/wenf0/zhihu-enhancement-plus/issues

---

English summary: This extension stores preferences, blocklists, and lexicon/taste data only in `chrome.storage.local` on your device. It does not upload your data to the developer’s servers, does not sell data, and only accesses Zhihu pages to provide filtering and reading features.
