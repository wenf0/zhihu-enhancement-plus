# Chrome 网上应用店：自动上传（CI）

商店已上架，仓库变量 `CHROME_WEBSTORE_UPLOAD=true` 已打开。打 `v*` tag 后，Actions 会把 zip **上传并送审**（`chrome-webstore-upload-cli` 默认 upload+publish）。

- 商店商品：[知乎增强优化](https://chromewebstore.google.com/detail/hbdicbmlaoccmagflnadkemleobkfgko)
- Extension ID：`hbdicbmlaoccmagflnadkemleobkfgko`
- 开发者后台：<https://chrome.google.com/webstore/devconsole/69fdad1b-cac4-4d7f-b879-384507909cd1/hbdicbmlaoccmagflnadkemleobkfgko/edit>
- 发版流水线：`.github/workflows/release.yml`（`v*` tag）

对话里说「发版」时按 `.cursor/rules/release.mdc` 执行：bump 版本 → commit → push `main` → 打 `vX.Y.Z` tag 并 push。

> API **不能**创建新商品，只更新已有扩展。密钥只放 GitHub Secrets，不要写入本仓库。

## 1. GitHub Secrets / 变量（已配置）

**Settings → Secrets and variables → Actions**

### Secrets

| Name | 值 |
|------|-----|
| `CHROME_EXTENSION_ID` | `hbdicbmlaoccmagflnadkemleobkfgko` |
| `CHROME_PUBLISHER_ID` | `69fdad1b-cac4-4d7f-b879-384507909cd1` |
| `CHROME_CLIENT_ID` | OAuth Client ID（Google Cloud Desktop 客户端） |
| `CHROME_CLIENT_SECRET` | OAuth Client Secret |
| `CHROME_REFRESH_TOKEN` | `npx chrome-webstore-upload-keys` 得到的刷新令牌 |

### Variables

| Name | 值 |
|------|-----|
| `CHROME_WEBSTORE_UPLOAD` | `true` |

OAuth 若过期，按 [chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys) 重新拿 Client / Refresh Token，再用 `gh secret set` 覆盖。并启用 [Chrome Web Store API](https://console.cloud.google.com/apis/library/chromewebstore.googleapis.com?project=chrome-webstore-upload-508607)。

## 2. 发版

版本必须比商店当前版本高，且与 `src/lib/version.ts`、`package.json` 一致：

```bash
git push origin main
git tag v2.3.7
git push origin v2.3.7
```

流水线：

1. `build`：typecheck + `npm run zip`
2. `github-release`：挂 zip 到 GitHub Release
3. `chrome-webstore`：上传商店并提交审核

审核仍由 Google 处理，通过后才会面向用户更新。同一版本号不能重复上传。

## 3. 本地手动上传（可选）

凭证从本机环境变量读取，不要写进命令历史里的明文文件后提交。

```bash
npm run zip
npx chrome-webstore-upload-cli@4 \
  --source .output/zhihu-enhancement-plus-*-chrome.zip \
  --extension-id hbdicbmlaoccmagflnadkemleobkfgko
```

只上传不送审：

```bash
npx chrome-webstore-upload-cli@4 upload \
  --source .output/zhihu-enhancement-plus-*-chrome.zip \
  --extension-id hbdicbmlaoccmagflnadkemleobkfgko
```
