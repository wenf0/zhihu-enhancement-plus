import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { SCRIPT_VERSION } from './src/version.ts';

const jiebaWasm =
    'https://cdn.jsdelivr.net/npm/jieba-wasm@2.4.0/pkg/web/jieba_rs_wasm_bg.wasm#sha256=f285288e12b2fee4966e2f766cb30cc465637d8679af7006269dfa25871adbf5';

const description = {
    '': '用于知乎网页。可开关：低饱和配色、隐藏右侧栏、清空或锁定标签标题与图标、净化搜索热门、默认/一键/点空白收起回答与评论、右键回顶、展开问题描述、置顶发布时间、信息流类型标签、直达问题、按用户与噪音评分（可显示得分、可过滤、喜欢/不感兴趣回写权重）及关键词、按类别屏蔽视频/文章/想法/话题/盐选/相关搜索/热榜杂项。设置可 JSON 导入导出。始终生效：关登录弹窗、原图、站外直链、点浮层关评论、去掉搜索高亮链接。基于 XIU2「知乎增强」2.2.15（GPL-3.0）。噪音评分用结巴分词（jieba-rs WASM）。',
    'zh-CN': '用于知乎网页。可开关：低饱和配色、隐藏右侧栏、清空或锁定标签标题与图标、净化搜索热门、默认/一键/点空白收起回答与评论、右键回顶、展开问题描述、置顶发布时间、信息流类型标签、直达问题、按用户与噪音评分（可显示得分、可过滤、喜欢/不感兴趣回写权重）及关键词、按类别屏蔽视频/文章/想法/话题/盐选/相关搜索/热榜杂项。设置可 JSON 导入导出。始终生效：关登录弹窗、原图、站外直链、点浮层关评论、去掉搜索高亮链接。基于 XIU2「知乎增强」2.2.15（GPL-3.0）。噪音评分用结巴分词（jieba-rs WASM）。',
    'zh-TW': '用於知乎網頁。可開關：低飽和配色、隱藏右側欄、清空或鎖定分頁標題與圖示、淨化搜尋熱門、預設/一鍵/點空白收起回答與評論、右鍵回頂、展開問題描述、置頂發布時間、資訊流類型標籤、直達問題、按使用者與噪音評分（可顯示得分、可過濾、喜歡/不感興趣回寫權重）及關鍵詞、按類別屏蔽影片/文章/想法/話題/鹽選/相關搜尋/熱榜雜項。設定可 JSON 匯入匯出。始終生效：關登入彈窗、原圖、站外直連、點浮層關評論、去掉搜尋高亮連結。基於 XIU2「知乎增強」2.2.15（GPL-3.0）。噪音評分用結巴分詞（jieba-rs WASM）。',
    en: 'For Zhihu. Toggles: desaturated UI, hide sidebar, blank/lock tab title, clean search hot terms, collapse answers (default/one-click/side), right-click to top, expand question, pin time, type labels, jump to question, score/show/filter noise, like/dislike to retune weights, filter by user/keywords, hide video/article/pin/topic/Yanxuan/related search/hot extras. JSON import/export. Always: close login modal, original images, unwrap outbound links, overlay closes comments, strip search highlight links. From XIU2 (GPL-3.0). Noise scoring uses jieba-rs WASM.'
};

export default defineConfig({
    build: {
        minify: false,
        cssMinify: false,
        target: 'es2022',
        outDir: 'dist',
        emptyOutDir: true
    },
    plugins: [
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: {
                    '': '知乎增强优化',
                    'zh-CN': '知乎增强优化',
                    'zh-TW': '知乎增強優化',
                    en: 'Zhihu Enhancement Plus'
                },
                namespace: 'https://github.com/wenf0/zhihu-enhancement-plus',
                version: SCRIPT_VERSION,
                author: 'local (based on X.I.U / 知乎增强 2.2.15)',
                description,
                license: 'GPL-3.0 License',
                homepageURL: 'https://github.com/wenf0/zhihu-enhancement-plus',
                supportURL: 'https://github.com/wenf0/zhihu-enhancement-plus/issues',
                downloadURL: 'https://raw.githubusercontent.com/wenf0/zhihu-enhancement-plus/main/zhihu-enhancement-plus.user.js',
                updateURL: 'https://raw.githubusercontent.com/wenf0/zhihu-enhancement-plus/main/zhihu-enhancement-plus.user.js',
                match: ['*://www.zhihu.com/*', '*://zhuanlan.zhihu.com/*'],
                exclude: ['https://www.zhihu.com/signin*'],
                connect: ['www.zhihu.com', 'cdn.jsdelivr.net'],
                resource: { jiebaWasm },
                grant: [
                    'GM_xmlhttpRequest',
                    'GM_registerMenuCommand',
                    'GM_unregisterMenuCommand',
                    'GM_openInTab',
                    'GM_getValue',
                    'GM_setValue',
                    'GM_notification',
                    'GM_info',
                    'GM_getResourceURL',
                    'window.onurlchange'
                ],
                sandbox: 'JavaScript',
                'run-at': 'document-end'
            },
            server: {
                open: false,
                prefix: 'dev:'
            },
            build: {
                fileName: 'zhihu-enhancement-plus.user.js',
                metaFileName: false,
                autoGrant: false
            }
        })
    ]
});
