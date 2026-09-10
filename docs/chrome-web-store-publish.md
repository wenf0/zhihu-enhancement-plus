# Chrome 网上应用店：自动上传（CI）

打 `v*` tag 时，若开启仓库变量 `CHROME_WEBSTORE_UPLOAD=true` 且配置了 Secrets，Actions 会把 zip **上传并送审**（`chrome-webstore-upload-cli` 默认 upload+publish）。

> **首次上架必须在 [开发者后台](https://chrome.google.com/webstore/devconsole) 手动创建商品并上传一版。** API 只适合后续版本更新。

## 1. 拿到 OAuth 凭证

按官方指引操作（推荐跟这份步骤走）：

[fregante/chrome-webstore-upload-keys](https://github.com/fregante/chrome-webstore-upload-keys)

你会得到：

| 值 | 用途 |
|----|------|
| Client ID | OAuth 客户端 |
| Client Secret | OAuth 密钥 |
| Refresh Token | 长期刷新令牌 |

并在 [Chrome 开发者后台 → Account](https://chrome.google.com/webstore/devconsole) 找到 **Publisher ID**。

扩展已上架后，商品详情 URL / 后台里能看到 **Extension ID**（一串固定 id）。

## 2. 配置 GitHub 仓库

**Settings → Secrets and variables → Actions**

### Secrets

| Name | 值 |
|------|-----|
| `CHROME_EXTENSION_ID` | 扩展 ID |
| `CHROME_CLIENT_ID` | OAuth Client ID |
| `CHROME_CLIENT_SECRET` | OAuth Client Secret |
| `CHROME_REFRESH_TOKEN` | Refresh Token |
| `CHROME_PUBLISHER_ID` | Publisher ID |

### Variables

| Name | 值 |
|------|-----|
| `CHROME_WEBSTORE_UPLOAD` | `true` |

设为 `true` 后，Release workflow 里的 `chrome-webstore` job 才会跑；未设置时只发 GitHub Release，不影响发版。

## 3. 发版

```bash
# 版本对齐 src/lib/version.ts 与 package.json
git tag v2.3.0
git push origin v2.3.0
```

流水线：

1. `build`：typecheck + `npm run zip`
2. `github-release`：挂 zip 到 GitHub Release
3. `chrome-webstore`（可选）：上传商店并提交审核

审核仍由 Google 处理，通过后才会面向用户更新。

## 4. 本地手动上传（可选）

```bash
export EXTENSION_ID=...
export CLIENT_ID=...
export CLIENT_SECRET=...
export REFRESH_TOKEN=...
export PUBLISHER_ID=...
npm run zip
npx chrome-webstore-upload-cli@4 \
  --source .output/zhihu-enhancement-plus-*-chrome.zip \
  --extension-id "$EXTENSION_ID"
```

只上传不送审：

```bash
npx chrome-webstore-upload-cli@4 upload \
  --source .output/zhihu-enhancement-plus-*-chrome.zip \
  --extension-id "$EXTENSION_ID"
```
