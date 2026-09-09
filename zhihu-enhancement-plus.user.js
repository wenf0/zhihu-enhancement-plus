// ==UserScript==
// @name         知乎增强优化
// @name:zh-CN   知乎增强优化
// @name:zh-TW   知乎增強優化
// @name:en      Zhihu Enhancement Plus
// @version      1.7.0
// @author       local (based on X.I.U / 知乎增强 2.2.15)
// @description  用于知乎网页（www.zhihu.com、zhuanlan.zhihu.com）。可开关：低饱和配色；隐藏右侧栏；清空或锁定标签页标题与图标；去掉搜索热门占位；默认收起回答；一键收起全部回答和评论；点击左右空白收起；右键空白回顶；自动展开问题描述；把发布/编辑时间提到标题附近；信息流加「问题/文章/视频/想法」标签；回答旁加直达问题按钮；按用户名单隐藏内容；按噪音分和自定义关键词过滤（L1/L2/L3）；按类别屏蔽视频、文章、想法、话题、盐选、相关搜索、热榜杂项。始终生效：关掉未登录弹窗；图片换成原图；站外链接去掉知乎跳转；点击浮层空白关闭评论；去掉正文里的搜索高亮链接。基于 XIU2「知乎增强」2.2.15 的 GPL-3.0 衍生修改，不含远程加载的外部脚本。
// @description:zh-CN 用于知乎网页（www.zhihu.com、zhuanlan.zhihu.com）。可开关：低饱和配色；隐藏右侧栏；清空或锁定标签页标题与图标；去掉搜索热门占位；默认收起回答；一键收起全部回答和评论；点击左右空白收起；右键空白回顶；自动展开问题描述；把发布/编辑时间提到标题附近；信息流加「问题/文章/视频/想法」标签；回答旁加直达问题按钮；按用户名单隐藏内容；按噪音分和自定义关键词过滤（L1/L2/L3）；按类别屏蔽视频、文章、想法、话题、盐选、相关搜索、热榜杂项。始终生效：关掉未登录弹窗；图片换成原图；站外链接去掉知乎跳转；点击浮层空白关闭评论；去掉正文里的搜索高亮链接。基于 XIU2「知乎增强」2.2.15 的 GPL-3.0 衍生修改，不含远程加载的外部脚本。
// @description:zh-TW 用於知乎網頁（www.zhihu.com、zhuanlan.zhihu.com）。可開關：低飽和配色；隱藏右側欄；清空或鎖定分頁標題與圖示；去掉搜尋熱門占位；預設收起回答；一鍵收起全部回答和評論；點擊左右空白收起；右鍵空白回頂；自動展開問題描述；把發布/編輯時間提到標題附近；資訊流加「問題/文章/影片/想法」標籤；回答旁加直達問題按鈕；按使用者名單隱藏內容；按噪音分和自訂關鍵詞過濾（L1/L2/L3）；按類別屏蔽影片、文章、想法、話題、鹽選、相關搜尋、熱榜雜項。始終生效：關掉未登入彈窗；圖片換成原圖；站外連結去掉知乎跳轉；點擊浮層空白關閉評論；去掉正文裡的搜尋高亮連結。基於 XIU2「知乎增強」2.2.15 的 GPL-3.0 衍生修改，不含遠端載入的外部腳本。
// @description:en For Zhihu pages (www.zhihu.com, zhuanlan.zhihu.com). Optional: desaturated UI; hide the right sidebar; blank or lock the tab title and favicon; remove search hot-term placeholders; collapse answers by default; collapse all answers and comments at once; collapse by clicking side margins; right-click side margins to jump to top; expand the question body; show publish/edit time near the title; label feed items as question/article/video/pin; add a button to open the question; hide content from a user blocklist; score and filter noisy posts with custom keywords (L1/L2/L3); hide videos, articles, pins, topics, Yanxuan, related searches, and hot-list extras by type. Always on: dismiss the login modal; use original images; unwrap Zhihu outbound redirects; close floating comments by clicking the overlay; strip in-text search highlight links. Derivative of XIU2 Zhihu Enhancement 2.2.15 under GPL-3.0; no remotely loaded external scripts.
// @match        *://www.zhihu.com/*
// @match        *://zhuanlan.zhihu.com/*
// @exclude      https://www.zhihu.com/signin*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_openInTab
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_notification
// @grant        GM_info
// @grant        window.onurlchange
// @connect      www.zhihu.com
// @sandbox      JavaScript
// @license      GPL-3.0 License
// @run-at       document-end
// @namespace    https://github.com/wenf0/zhihu-enhancement-plus
// @homepageURL  https://github.com/wenf0/zhihu-enhancement-plus
// @supportURL   https://github.com/wenf0/zhihu-enhancement-plus/issues
// @downloadURL  https://raw.githubusercontent.com/wenf0/zhihu-enhancement-plus/main/zhihu-enhancement-plus.user.js
// @updateURL    https://raw.githubusercontent.com/wenf0/zhihu-enhancement-plus/main/zhihu-enhancement-plus.user.js
// ==/UserScript==

'use strict';

/**
 * 基于 XIU2「知乎增强」2.2.15 的本地优化版。
 * 主要改动：配置对象化、统一路由、合并高频轮询为节流观察器、修正 observer 循环里误用 return 等问题。
 */

/* -------------------------------------------------------------------------- */
/* 配置                                                                       */
/* -------------------------------------------------------------------------- */

const DEFAULT_BLOCK_USERS = [
    '故事档案局', '盐选推荐', '盐选科普', '盐选成长计划', '知乎盐选会员', '知乎盐选创作者',
    '盐选心理', '盐选健康必修课', '盐选奇妙物语', '盐选生活馆', '盐选职场', '盐选文学甄选',
    '盐选作者小管家', '盐选博物馆', '盐选点金', '盐选测评室', '盐选科技前沿', '盐选会员精品'
];

const DEFAULT_BLOCK_KEYWORDS = [
    '长鑫科技', '地铁安检', '张凌赫', '上海地铁', '俄罗斯', '小红书',
    '《崩坏星穹铁道》', '《鸣潮》', '曲婉婷', '邹市明', '理想汽车', '闲鱼',
    '拉丁舞', '问界', '国内暗网', '理想L9livis', '王师傅和小毛毛', '流萤',
    '鞠婧祎', '周淑怡', '多益网络', '崩老头', '袁隆平', '世界杯氛围淡淡',
    '成龙', '战锤40K', '《绝区零》', '比亚迪', '李小璐', '大量空座',
    '沈逸', '崩坏：星穹铁道', '恋与深空', '世界杯的热度', '布达拉宫', '开心麻花',
    '监护人', '红牛', '社保', '韩红', 'A股股市', '靠谱外卖',
    '张桂梅', '高圆圆', '粉丝', '赵丽颖', '三角洲行动', '鹅腿阿姨',
    '影视飓风', '田曦薇',
    '男', '女', '父亲', '母亲', '大龄剩女', '男性', '女性', 'coser', '儿子', '体育生',
    '女儿', '迪士尼', '盲盒', '奶茶', '漫展', '小孩', '结婚', '生娃', '华为',
    '大龄女', '大妈', '单亲', '女生', '美女', '女神', '小姐姐', '男子', '女演员',
    '健身房', 'JK', '身材', '985', '211', '小米', '妈', '妈妈', '生物爹', '原生家庭',
    '今日俄罗斯'
];

const MENU_ITEMS = [
    /* 外观 */
    { key: 'menu_lowProfile',          label: '低饱和模式',           tip: '把链接、按钮、关注等改成灰调，页面更素、少抢眼。', def: true },
    { key: 'menu_fullWidth',           label: '隐藏右侧栏',           tip: '去掉推荐关注、相关问题等侧栏，主栏居中加宽。', def: true },
    { key: 'menu_blankTitleFavicon',   label: '清空标题和图标',       tip: '浏览器标签页标题和图标变空白，减少切页干扰。开启后「净化标题消息」不再生效。', def: true },
    { key: 'menu_cleanTitles',         label: '净化标题消息',         tip: '锁住当前页标题，去掉「(1 条消息)」一类红点提醒。清空标题开启时此项无效。', def: false },
    { key: 'menu_cleanSearch',         label: '净化搜索热门',         tip: '去掉搜索框里的热搜占位词和下拉热榜，输入框保持空白。', def: false },

    /* 阅读 */
    { key: 'menu_defaultCollapsedAnswer', label: '默认收起回答',     tip: '打开问题页时回答先收起，只留摘要，减少一屏信息量。', def: true },
    { key: 'menu_collapsedAnswer',        label: '一键收起全部',     tip: '右下角加按钮，一次收起当前页所有展开的回答和评论。', def: true },
    { key: 'menu_collapsedNowAnswer',     label: '点击两侧收起',     tip: '点击页面左右空白区域，收起当前展开的回答或评论。', def: true },
    { key: 'menu_backToTop',              label: '右键两侧回顶',     tip: '在页面左右空白处点右键，快速滚回顶部。', def: true },
    { key: 'menu_questionRichTextMore',   label: '展开问题描述',     tip: '进入问题页时自动点开「显示全部」，完整展示题干。', def: false },
    { key: 'menu_publishTop',             label: '置顶显示时间',     tip: '把发布/编辑时间提到标题附近，不用滚到底才看到。', def: true },
    { key: 'menu_typeTips',               label: '区分问题文章',     tip: '信息流标题前加「问题 / 文章 / 视频 / 想法」标签。', def: true },
    { key: 'menu_toQuestion',             label: '直达问题按钮',     tip: '回答卡片旁加按钮，直接打开对应问题页，而不是该回答。', def: true },

    /* 屏蔽 */
    { key: 'menu_blockUsers',          label: '屏蔽指定用户',         tip: '隐藏黑名单用户的回答、文章和评论。可在下方编辑名单。', def: true },
    { key: 'menu_customBlockUsers',    label: '编辑屏蔽用户',         tip: '自定义屏蔽用户',   def: DEFAULT_BLOCK_USERS, kind: 'users' },
    { key: 'menu_blockKeywords',       label: '噪音评分过滤',         tip: '按语义噪音打分：低分保留、中分降权、高分隐藏。自定义词会加权。', def: true },
    { key: 'menu_customBlockKeywords', label: '编辑屏蔽关键词',       tip: '自定义词加权到噪音分', def: DEFAULT_BLOCK_KEYWORDS, kind: 'keywords' },
    {
        key: 'menu_noiseLevel',
        label: '噪音过滤档位',
        tip: '勾选启用该档分类。L1 最狠，L3 最轻。',
        def: '',
        kind: 'group',
        children: ['menu_noiseL1', 'menu_noiseL2', 'menu_noiseL3']
    },
    { key: 'menu_noiseL1', label: 'L1 强过滤（八卦 / 对立 / 婚恋 / 吃瓜）', tip: 'L1 强过滤', def: true, kind: 'hidden' },
    { key: 'menu_noiseL2', label: 'L2 中强（二次元 / 消费 / 汽车 / 体育）', tip: 'L2 中强过滤', def: true, kind: 'hidden' },
    { key: 'menu_noiseL3', label: 'L3 低强（国际 / A股 / 社会比较）',     tip: 'L3 低强过滤', def: false, kind: 'hidden' },
    { key: 'menu_noiseLexicon', label: '编辑噪音词库', tip: '维护分类词、排除词与权重', def: '', kind: 'lexicon' },
    {
        key: 'menu_blockType',
        label: '屏蔽指定类别',
        tip: '勾选 = 屏蔽该类别的信息流',
        def: '',
        kind: 'group',
        children: [
            'menu_blockTypeVideo',
            'menu_blockTypeArticle',
            'menu_blockTypePin',
            'menu_blockTypeTopic',
            'menu_blockTypeSearch',
            'menu_blockYanXuan',
            'menu_blockTypeLiveHot'
        ]
    },
    { key: 'menu_blockTypeVideo',   label: '视频（首页 / 搜索 / 问题）',     tip: '视频（首页、搜索页、问题页）',       def: true,  kind: 'hidden' },
    { key: 'menu_blockTypeArticle', label: '文章（首页 / 搜索）',           tip: '文章（首页、搜索页）',               def: false, kind: 'hidden' },
    { key: 'menu_blockTypePin',     label: '想法（首页）',                 tip: '想法（首页）',                       def: false, kind: 'hidden' },
    { key: 'menu_blockTypeTopic',   label: '话题（搜索）',                 tip: '话题（搜索页）',                     def: false, kind: 'hidden' },
    { key: 'menu_blockTypeSearch',  label: '杂志 / 盐选 / 相关搜索（搜索）', tip: '相关搜索、杂志、盐选等（搜索页）',     def: false, kind: 'hidden' },
    { key: 'menu_blockYanXuan',     label: '盐选内容（问题）',             tip: '盐选内容（问题页）',                 def: false, kind: 'hidden' },
    { key: 'menu_blockTypeLiveHot', label: '热榜杂项（文章 / 直播 / 广告）', tip: '热榜文章、直播、广告等 [热榜]',       def: true,  kind: 'hidden' }
];

const cache = Object.create(null);
const menuCommandIds = [];

for (const item of MENU_ITEMS) {
    if (item.key === 'menu_customBlockKeywords' && !GM_getValue('menu_kw_pack_v1')) {
        const current = GM_getValue(item.key);
        if (current == null || (Array.isArray(current) && current.length === 0)) {
            GM_setValue(item.key, DEFAULT_BLOCK_KEYWORDS);
        }
        GM_setValue('menu_kw_pack_v1', true);
    } else if (GM_getValue(item.key) == null) {
        GM_setValue(item.key, item.def);
    }
    cache[item.key] = GM_getValue(item.key);
}

function menuValue(key) {
    return cache[key];
}

function menuSet(key, value) {
    cache[key] = value;
    GM_setValue(key, value);
}

/* -------------------------------------------------------------------------- */
/* 工具                                                                       */
/* -------------------------------------------------------------------------- */

function page() {
    const { pathname, hostname, href, search } = location;
    return {
        hostname,
        pathname,
        href,
        search,
        isZhuanlan: hostname === 'zhuanlan.zhihu.com',
        isHome: pathname === '/',
        isHot: pathname === '/hot',
        isFollow: pathname === '/follow',
        isSearch: pathname === '/search',
        isQuestion: pathname.includes('question') && !href.includes('/log'),
        isQuestionWaiting: pathname.includes('waiting'),
        isAnswer: pathname.includes('/answer/'),
        isTopic: pathname.includes('/topic/'),
        isTopicHot: pathname.includes('/hot') || href.includes('/top-answers'),
        isColumn: pathname.includes('/column/'),
        isPeople: pathname.includes('/people/') || href.includes('org'),
        isCollection: pathname.includes('/collection/')
    };
}

function injectStyle(id, css) {
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    (document.head || document.documentElement).appendChild(el);
}

function getXpath(xpath, contextNode, doc = document) {
    contextNode = contextNode || doc;
    try {
        const result = doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
        return result.singleNodeValue && result.singleNodeValue.nodeType === 1 && result.singleNodeValue;
    } catch (err) {
        throw new Error(`无效 Xpath: ${xpath}`);
    }
}

function findParentElement(item, className, exact = false) {
    let el = item && item.parentElement;
    while (el) {
        const cn = el.className;
        if (typeof cn === 'string' && cn) {
            if (exact ? cn === className : cn.includes(className)) return el;
        }
        el = el.parentElement;
    }
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

function isElementInViewportPartial(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
}

function forAddedElements(mutations, fn) {
    for (const mutation of mutations) {
        for (const target of mutation.addedNodes) {
            if (target.nodeType !== 1) continue;
            fn(target);
        }
    }
}

function observeTree(callback) {
    const observer = new MutationObserver(callback);
    observer.observe(document, { childList: true, subtree: true });
    return observer;
}

function onReadyNodes(selector, handle, { timeout = 8000 } = {}) {
    const run = () => {
        const nodes = document.querySelectorAll(selector);
        if (!nodes.length) return false;
        nodes.forEach(handle);
        return true;
    };
    if (run()) return;
    const timer = setInterval(() => {
        if (run()) clearInterval(timer);
    }, 120);
    setTimeout(() => clearInterval(timer), timeout);
}

function addUrlChangeEvent() {
    history.pushState = (f => function pushState() {
        const ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('urlchange'));
        return ret;
    })(history.pushState);

    history.replaceState = (f => function replaceState() {
        const ret = f.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('urlchange'));
        return ret;
    })(history.replaceState);

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('urlchange'));
    });
}

function getUTC8(t) {
    const pad = n => (n < 10 ? '0' + n : n);
    return `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}\xa0\xa0${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`;
}

function notify(text, timeout = 3000) {
    GM_notification({ text, timeout });
}

/* -------------------------------------------------------------------------- */
/* 菜单                                                                       */
/* -------------------------------------------------------------------------- */

function registerMenuCommand() {
    for (const id of menuCommandIds) GM_unregisterMenuCommand(id);
    menuCommandIds.length = 0;
    for (const item of MENU_ITEMS) {
        cache[item.key] = GM_getValue(item.key);
    }
    menuCommandIds.push(GM_registerMenuCommand('⚙️ 设置', openSettingsPanel));
}

function openSettingsPanel() {
    if (document.querySelector('.zhihuE_StMask')) return;

    const sections = [
        {
            id: 'look',
            name: '外观',
            hint: '页面气质',
            keys: ['menu_lowProfile', 'menu_fullWidth', 'menu_blankTitleFavicon', 'menu_cleanTitles', 'menu_cleanSearch']
        },
        {
            id: 'read',
            name: '阅读',
            hint: '浏览节奏',
            keys: ['menu_defaultCollapsedAnswer', 'menu_collapsedAnswer', 'menu_collapsedNowAnswer', 'menu_backToTop', 'menu_questionRichTextMore', 'menu_publishTop', 'menu_typeTips', 'menu_toQuestion']
        },
        {
            id: 'block',
            name: '屏蔽',
            hint: '信息流过滤',
            keys: ['menu_blockUsers', 'menu_blockKeywords'],
            actions: [
                { id: 'users', name: '编辑屏蔽用户', desc: '维护用户黑名单，支持复制导入。', need: 'menu_blockUsers', run: customBlockUsers },
                { id: 'keywords', name: '编辑屏蔽关键词', desc: '自定义词会加权到噪音分。', need: 'menu_blockKeywords', run: customBlockKeywords },
                { id: 'levels', name: '噪音过滤档位', desc: 'L1 / L2 / L3 语义分类强度。', need: 'menu_blockKeywords', run: noiseLevelDialog },
                { id: 'lexicon', name: '编辑噪音词库', desc: '分类词、排除词和权重。', need: 'menu_blockKeywords', run: noiseLexiconDialog },
                { id: 'types', name: '屏蔽指定类别', desc: '视频、文章、想法、盐选、热榜等。', run: () => {
                    const item = MENU_ITEMS.find(x => x.key === 'menu_blockType');
                    const children = (item.children || []).map(key => MENU_ITEMS.find(x => x.key === key)).filter(Boolean);
                    menuSetting(item.label, item.tip, children);
                }}
            ]
        }
    ];
    let current = 'look';

    const html = `<style class="zhihuE_StStyle">
.zhihuE_StMask {position:fixed;inset:0;z-index:10040;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(18,18,18,.48);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}
.zhihuE_StRoot {width:min(1240px,98vw);height:min(900px,94vh);display:flex;flex-direction:column;background:#fff;color:#1d1d1f;border-radius:24px;box-shadow:0 32px 100px rgba(0,0,0,.26);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;}
.zhihuE_StHead {padding:28px 36px 20px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
.zhihuE_StKicker {margin:0 0 6px;font-size:12px;letter-spacing:.16em;color:#aaa;text-transform:uppercase;}
.zhihuE_StTitle {margin:0;font-size:26px;font-weight:650;letter-spacing:.02em;}
.zhihuE_StTips {margin:8px 0 0;font-size:13px;line-height:1.65;color:#8a8a8a;}
.zhihuE_StClose {flex:none;width:36px;height:36px;border:0;border-radius:50%;background:#f4f4f5;color:#666;cursor:pointer;font-size:18px;line-height:1;}
.zhihuE_StClose:hover {background:#1d1d1f;color:#fff;}
.zhihuE_StMain {flex:1;min-height:0;display:flex;border-top:1px solid #eee;}
.zhihuE_StNav {width:220px;flex:none;padding:22px 16px;border-right:1px solid #eee;display:flex;flex-direction:column;gap:6px;}
.zhihuE_StNavBtn {display:flex;flex-direction:column;align-items:flex-start;gap:2px;width:100%;padding:12px 14px;border:0;border-radius:14px;background:transparent;color:#666;cursor:pointer;text-align:left;font:inherit;}
.zhihuE_StNavBtn strong {font-size:15px;font-weight:600;}
.zhihuE_StNavBtn span {font-size:12px;color:#aaa;}
.zhihuE_StNavBtn.is-on {background:#1d1d1f;color:#fff;}
.zhihuE_StNavBtn.is-on span {color:rgba(255,255,255,.62);}
.zhihuE_StNavFoot {margin-top:auto;padding:8px 6px 4px;}
.zhihuE_StLink {border:0;background:transparent;color:#8a8a8a;cursor:pointer;font-size:12px;padding:0;}
.zhihuE_StLink:hover {color:#1d1d1f;}
.zhihuE_StBody {flex:1;min-width:0;overflow:auto;padding:24px 32px 32px;display:flex;flex-direction:column;gap:12px;}
.zhihuE_StRow,.zhihuE_StAction {display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 22px;border:1px solid #eee;border-radius:16px;background:#fafafa;}
.zhihuE_StRow.is-on {background:#fff;border-color:#e5e5e5;box-shadow:0 8px 24px rgba(0,0,0,.04);}
.zhihuE_StName {font-size:15px;font-weight:600;}
.zhihuE_StDesc {margin:4px 0 0;font-size:12px;line-height:1.6;color:#8a8a8a;}
.zhihuE_StSwitch {flex:none;width:48px;height:28px;border:0;border-radius:999px;background:#ddd;position:relative;cursor:pointer;}
.zhihuE_StSwitch::after {content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15);transition:transform .2s;}
.zhihuE_StSwitch.is-on {background:#1d1d1f;}
.zhihuE_StSwitch.is-on::after {transform:translateX(20px);}
.zhihuE_StAction {width:100%;cursor:pointer;text-align:left;font:inherit;color:inherit;background:#fff;}
.zhihuE_StAction:hover {border-color:#ccc;box-shadow:0 8px 24px rgba(0,0,0,.05);}
.zhihuE_StAction[disabled] {opacity:.4;cursor:not-allowed;box-shadow:none;}
.zhihuE_StGo {flex:none;color:#bbb;font-size:22px;line-height:1;}
[data-theme="dark"] .zhihuE_StRoot {background:#2b2f36;color:#e8edf2;}
[data-theme="dark"] .zhihuE_StMain,[data-theme="dark"] .zhihuE_StNav {border-color:#3c434d;}
[data-theme="dark"] .zhihuE_StKicker,[data-theme="dark"] .zhihuE_StTips,[data-theme="dark"] .zhihuE_StDesc,[data-theme="dark"] .zhihuE_StLink,[data-theme="dark"] .zhihuE_StNavBtn span {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_StClose,[data-theme="dark"] .zhihuE_StRow {background:#343a44;border-color:#3c434d;}
[data-theme="dark"] .zhihuE_StRow.is-on,[data-theme="dark"] .zhihuE_StAction {background:#3a414c;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_StClose:hover,[data-theme="dark"] .zhihuE_StNavBtn.is-on,[data-theme="dark"] .zhihuE_StSwitch.is-on {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_StNavBtn {color:#c5ced8;}
[data-theme="dark"] .zhihuE_StNavBtn.is-on span {color:rgba(29,29,31,.55);}
[data-theme="dark"] .zhihuE_StSwitch {background:#4a5260;}
[data-theme="dark"] .zhihuE_StLink:hover {color:#fff;}
</style>
<div class="zhihuE_StMask">
  <div class="zhihuE_StRoot">
    <div class="zhihuE_StHead">
      <div>
        <p class="zhihuE_StKicker">Zhihu Enhancement Plus</p>
        <h3 class="zhihuE_StTitle">设置</h3>
        <p class="zhihuE_StTips">开关即时保存，刷新页面后生效</p>
      </div>
      <button type="button" class="zhihuE_StClose" aria-label="关闭">×</button>
    </div>
    <div class="zhihuE_StMain">
      <div class="zhihuE_StNav"></div>
      <div class="zhihuE_StBody"></div>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    const mask = document.querySelector('.zhihuE_StMask');
    const navEl = mask.querySelector('.zhihuE_StNav');
    const bodyEl = mask.querySelector('.zhihuE_StBody');

    const close = () => {
        document.removeEventListener('keydown', onKey);
        mask.remove();
        const style = document.querySelector('.zhihuE_StStyle');
        if (style) style.remove();
    };
    const onKey = event => {
        if (event.key === 'Escape' && !document.querySelector('.zhihuE_LvMask, .zhihuE_LxMask, .zhihuE_DlgMask')) close();
    };

    const render = () => {
        navEl.innerHTML = sections.map(sec =>
            `<button type="button" class="zhihuE_StNavBtn${sec.id === current ? ' is-on' : ''}" data-id="${sec.id}"><strong>${sec.name}</strong><span>${sec.hint}</span></button>`
        ).join('') + '<div class="zhihuE_StNavFoot"><button type="button" class="zhihuE_StLink">反馈与建议</button></div>';
        const sec = sections.find(x => x.id === current);
        const rows = sec.keys.map(key => {
            const item = MENU_ITEMS.find(x => x.key === key);
            const on = !!menuValue(key);
            return `<div class="zhihuE_StRow${on ? ' is-on' : ''}" data-key="${key}">
                <div><div class="zhihuE_StName">${escapeHtml(item.label)}</div><div class="zhihuE_StDesc">${escapeHtml(item.tip || '')}</div></div>
                <button type="button" class="zhihuE_StSwitch${on ? ' is-on' : ''}" data-key="${key}" aria-label="${escapeHtml(item.label)}"></button>
            </div>`;
        });
        const actions = (sec.actions || []).map(act => {
            const disabled = act.need && !menuValue(act.need);
            return `<button type="button" class="zhihuE_StAction" data-act="${act.id}" ${disabled ? 'disabled' : ''}>
                <div><div class="zhihuE_StName">${escapeHtml(act.name)}</div><div class="zhihuE_StDesc">${escapeHtml(act.desc)}</div></div>
                <span class="zhihuE_StGo">›</span>
            </button>`;
        });
        bodyEl.innerHTML = rows.concat(actions).join('');
    };

    mask.querySelector('.zhihuE_StClose').onclick = close;
    mask.addEventListener('click', event => {
        if (event.target === mask) close();
    });
    navEl.addEventListener('click', event => {
        const link = event.target.closest('.zhihuE_StLink');
        if (link) {
            GM_openInTab('https://github.com/XIU2/UserScript#xiu2userscript', { active: true, insert: true, setParent: true });
            GM_openInTab('https://greasyfork.org/zh-CN/scripts/419081/feedback', { active: true, insert: true, setParent: true });
            return;
        }
        const btn = event.target.closest('.zhihuE_StNavBtn');
        if (!btn) return;
        current = btn.dataset.id;
        render();
    });
    bodyEl.addEventListener('click', event => {
        const sw = event.target.closest('.zhihuE_StSwitch');
        if (sw) {
            menuSet(sw.dataset.key, !menuValue(sw.dataset.key));
            render();
            return;
        }
        const act = event.target.closest('.zhihuE_StAction');
        if (!act || act.disabled) return;
        const spec = sections.flatMap(x => x.actions || []).find(x => x.id === act.dataset.act);
        if (spec && spec.run) spec.run();
    });
    document.addEventListener('keydown', onKey);
    render();
}

function toggleCardDialog({ title, tips, footer, items }) {
    if (document.querySelector('.zhihuE_LvMask')) return;
    const html = `<style class="zhihuE_LvStyle">
.zhihuE_LvMask {position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:32px 20px;background:rgba(18,18,18,.48);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.zhihuE_LvRoot {width:min(720px,96vw);max-height:86vh;display:flex;flex-direction:column;background:#fff;color:#1d1d1f;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.22);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;}
.zhihuE_LvHead {padding:28px 32px 18px;border-bottom:1px solid #eee;}
.zhihuE_LvHeadTop {display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
.zhihuE_LvTitle {margin:0;font-size:22px;font-weight:600;letter-spacing:.02em;}
.zhihuE_LvTips {margin:8px 0 0;font-size:13px;line-height:1.65;color:#8a8a8a;}
.zhihuE_LvClose {flex:none;width:36px;height:36px;border:0;border-radius:50%;background:#f4f4f5;color:#666;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.zhihuE_LvClose:hover {background:#1d1d1f;color:#fff;}
.zhihuE_LvBody {padding:20px 32px;overflow:auto;display:flex;flex-direction:column;gap:12px;}
.zhihuE_LvCard {display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:18px 20px;border:1px solid #eee;border-radius:16px;background:#fafafa;transition:border-color .2s,background .2s,box-shadow .2s;}
.zhihuE_LvCard.is-on {background:#fff;border-color:#dcdcdc;box-shadow:0 8px 24px rgba(0,0,0,.04);}
.zhihuE_LvCardMain {min-width:0;}
.zhihuE_LvCardTop {display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap;}
.zhihuE_LvTag {flex:none;min-width:36px;padding:2px 8px;border-radius:999px;background:#1d1d1f;color:#fff;font-size:12px;font-weight:600;text-align:center;}
.zhihuE_LvName {font-size:16px;font-weight:600;}
.zhihuE_LvHint {font-size:12px;color:#aaa;}
.zhihuE_LvDesc {margin:0;font-size:13px;line-height:1.7;color:#666;}
.zhihuE_LvChips {display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
.zhihuE_LvChip {padding:3px 8px;border-radius:999px;background:#f0f0f0;color:#666;font-size:12px;}
.zhihuE_LvSwitch {flex:none;width:48px;height:28px;border:0;border-radius:999px;background:#ddd;position:relative;cursor:pointer;transition:background .2s;}
.zhihuE_LvSwitch::after {content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.15);transition:transform .2s;}
.zhihuE_LvSwitch.is-on {background:#1d1d1f;}
.zhihuE_LvSwitch.is-on::after {transform:translateX(20px);}
.zhihuE_LvFoot {padding:16px 32px 22px;border-top:1px solid #eee;color:#8a8a8a;font-size:13px;}
[data-theme="dark"] .zhihuE_LvRoot {background:#2b2f36;color:#e8edf2;}
[data-theme="dark"] .zhihuE_LvHead,[data-theme="dark"] .zhihuE_LvFoot {border-color:#3c434d;}
[data-theme="dark"] .zhihuE_LvTips,[data-theme="dark"] .zhihuE_LvFoot,[data-theme="dark"] .zhihuE_LvDesc,[data-theme="dark"] .zhihuE_LvHint {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_LvClose,[data-theme="dark"] .zhihuE_LvCard {background:#343a44;border-color:#3c434d;}
[data-theme="dark"] .zhihuE_LvCard.is-on {background:#3a414c;}
[data-theme="dark"] .zhihuE_LvClose:hover {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_LvTag {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_LvChip {background:#2b2f36;color:#c5ced8;}
[data-theme="dark"] .zhihuE_LvSwitch {background:#4a5260;}
[data-theme="dark"] .zhihuE_LvSwitch.is-on {background:#e8edf2;}
</style>
<div class="zhihuE_LvMask">
  <div class="zhihuE_LvRoot">
    <div class="zhihuE_LvHead">
      <div class="zhihuE_LvHeadTop">
        <div>
          <h3 class="zhihuE_LvTitle">${escapeHtml(title)}</h3>
          <p class="zhihuE_LvTips">${escapeHtml(tips)}</p>
        </div>
        <button type="button" class="zhihuE_LvClose" title="关闭" aria-label="关闭">
          <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M13.486 12l5.208-5.207a1.048 1.048 0 0 0-.006-1.483 1.046 1.046 0 0 0-1.482-.005L12 10.514 6.793 5.305a1.048 1.048 0 0 0-1.483.005 1.046 1.046 0 0 0-.005 1.483L10.514 12l-5.208 5.207a1.048 1.048 0 0 0 .006 1.483 1.046 1.046 0 0 0 1.482.005L12 13.486l5.207 5.208a1.048 1.048 0 0 0 1.483-.006 1.046 1.046 0 0 0 .005-1.482L13.486 12z" fill-rule="evenodd"></path></svg>
        </button>
      </div>
    </div>
    <div class="zhihuE_LvBody">${items.map(item => {
        const on = !!menuValue(item.key);
        const chips = (item.tags || []).map(t => `<span class="zhihuE_LvChip">${escapeHtml(t)}</span>`).join('');
        return `<div class="zhihuE_LvCard${on ? ' is-on' : ''}" data-key="${item.key}">
          <div class="zhihuE_LvCardMain">
            <div class="zhihuE_LvCardTop">
              ${item.tag ? `<span class="zhihuE_LvTag">${escapeHtml(item.tag)}</span>` : ''}
              <span class="zhihuE_LvName">${escapeHtml(item.name)}</span>
              ${item.hint ? `<span class="zhihuE_LvHint">${escapeHtml(item.hint)}</span>` : ''}
            </div>
            ${item.desc ? `<p class="zhihuE_LvDesc">${escapeHtml(item.desc)}</p>` : ''}
            ${chips ? `<div class="zhihuE_LvChips">${chips}</div>` : ''}
          </div>
          <button type="button" class="zhihuE_LvSwitch${on ? ' is-on' : ''}" data-key="${item.key}" aria-label="${escapeHtml(item.name)}"></button>
        </div>`;
    }).join('')}</div>
    <div class="zhihuE_LvFoot">${escapeHtml(footer || '修改后刷新页面生效')}</div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    const mask = document.querySelector('.zhihuE_LvMask');
    const close = () => {
        mask.remove();
        const style = document.querySelector('.zhihuE_LvStyle');
        if (style) style.remove();
    };
    mask.querySelector('.zhihuE_LvClose').onclick = close;
    mask.addEventListener('click', event => {
        if (event.target === mask) close();
    });
    mask.querySelectorAll('.zhihuE_LvSwitch').forEach(btn => {
        btn.addEventListener('click', () => {
            const key = btn.dataset.key;
            const next = !menuValue(key);
            menuSet(key, next);
            btn.classList.toggle('is-on', next);
            const card = mask.querySelector(`.zhihuE_LvCard[data-key="${key}"]`);
            if (card) card.classList.toggle('is-on', next);
        });
    });
}

function menuSetting(title, tips, menus) {
    const meta = {
        menu_blockTypeVideo: { tag: '视频', name: '视频', desc: '首页、搜索页和问题页里的视频卡片、视频回答。', tags: ['首页', '搜索', '问题页'] },
        menu_blockTypeArticle: { tag: '文章', name: '文章', desc: '信息流里的专栏文章，不影响问题回答。', tags: ['首页', '搜索'] },
        menu_blockTypePin: { tag: '想法', name: '想法', desc: '首页信息流中的想法/动态。', tags: ['首页'] },
        menu_blockTypeTopic: { tag: '话题', name: '话题', desc: '搜索结果里的话题卡片。', tags: ['搜索'] },
        menu_blockTypeSearch: { tag: '盐选', name: '杂志 / 盐选 / 相关搜索', desc: '搜索页里的杂志、盐选专栏和相关搜索。', tags: ['搜索'] },
        menu_blockYanXuan: { tag: '付费', name: '盐选内容', desc: '问题页里带购买入口的盐选回答。', tags: ['问题页'] },
        menu_blockTypeLiveHot: { tag: '热榜', name: '热榜杂项', desc: '热榜中的直播、广告和非问题条目，并重排序号。', tags: ['热榜'] }
    };
    toggleCardDialog({
        title,
        tips: `${tips} 改完刷新页面后生效。`,
        footer: '打开后隐藏对应类型的信息流',
        items: menus.map(item => Object.assign({
            key: item.key,
            name: item.label,
            desc: item.tip || ''
        }, meta[item.key] || {}))
    });
}

function noiseLevelDialog() {
    toggleCardDialog({
        title: '噪音过滤档位',
        tips: '按语义类别分层计分。L1 最狠，L3 最轻。改完刷新页面后生效。',
        footer: '0–30 保留 · 30–60 降权 · 60–100 隐藏',
        items: [
            { key: 'menu_noiseL1', tag: 'L1', name: '强过滤', hint: '默认开启', desc: '明星八卦、饭圈、男女对立、婚恋生育、吃瓜爆料。命中后更容易直接隐藏。', tags: ['塌房', '热搜', '饭圈', '男女对立', '催婚'] },
            { key: 'menu_noiseL2', tag: 'L2', name: '中强过滤', hint: '默认开启', desc: '二次元抽卡、消费种草、汽车热点、体育赛事、网红生活。多数会降权，而不是一刀切。', tags: ['抽卡', '种草', '理想汽车', '世界杯', '探店'] },
            { key: 'menu_noiseL3', tag: 'L3', name: '低强过滤', hint: '默认关闭', desc: '国际政治情绪、A股短线、社会比较。信息量往往更高，建议按需打开。', tags: ['俄乌', 'A股', '985', '年薪', '特朗普'] }
        ]
    });
}

function parseWeightedWords(input, fallback = 6) {
    const out = Object.create(null);
    for (const part of String(input || '').split(/[,，|/\n\r]+/)) {
        const raw = part.trim();
        if (!raw) continue;
        const m = raw.match(/^(.+?)[:：]\s*(\d+(?:\.\d+)?)$/);
        const word = (m ? m[1] : raw).replace(/\s+/g, '');
        const weight = m ? Number(m[2]) : fallback;
        if (!word) continue;
        out[word] = Math.max(1, Math.min(20, weight));
    }
    return out;
}

function noiseLexiconDialog() {
    if (document.querySelector('.zhihuE_LxMask')) return;
    let lex = getActiveLexicon();
    const buckets = NOISE_CATEGORIES.map(cat => ({
        id: cat.id,
        kind: 'cat',
        token: 'cat:' + cat.id,
        name: `L${cat.level} ${cat.name}`
    })).concat([
        { id: 'emotion', kind: 'map', token: 'emotion', name: '情绪词' },
        { id: 'controversy', kind: 'list', token: 'controversy', name: '争议词' },
        { id: 'clickbait', kind: 'list', token: 'clickbait', name: '标题党' },
        { id: 'value', kind: 'map', token: 'value', name: '价值白名单' }
    ]);
    let current = buckets[0].id;
    let tab = 'words';

    const html = `<style class="zhihuE_LxStyle">
.zhihuE_LxMask {position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:rgba(18,18,18,.48);backdrop-filter:blur(8px);}
.zhihuE_LxRoot {width:min(980px,96vw);height:min(780px,88vh);display:flex;flex-direction:column;background:#fff;color:#1d1d1f;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.22);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;}
.zhihuE_LxHead {padding:24px 28px 16px;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;}
.zhihuE_LxTitle {margin:0;font-size:22px;font-weight:600;}
.zhihuE_LxTips {margin:8px 0 0;font-size:13px;line-height:1.6;color:#8a8a8a;}
.zhihuE_LxClose {flex:none;width:36px;height:36px;border:0;border-radius:50%;background:#f4f4f5;color:#666;cursor:pointer;}
.zhihuE_LxClose:hover {background:#1d1d1f;color:#fff;}
.zhihuE_LxMain {flex:1;min-height:0;display:flex;}
.zhihuE_LxNav {width:200px;flex:none;overflow:auto;padding:12px;border-right:1px solid #eee;background:#fafafa;}
.zhihuE_LxNavBtn {width:100%;text-align:left;border:0;background:transparent;border-radius:10px;padding:10px 12px;margin-bottom:4px;font-size:13px;cursor:pointer;color:#333;}
.zhihuE_LxNavBtn.is-on {background:#1d1d1f;color:#fff;}
.zhihuE_LxPane {flex:1;min-width:0;display:flex;flex-direction:column;padding:16px 24px 12px;}
.zhihuE_LxTabs {display:flex;gap:8px;margin-bottom:12px;}
.zhihuE_LxTab {height:32px;padding:0 12px;border:1px solid #e8e8e8;border-radius:999px;background:#fff;cursor:pointer;font-size:12px;}
.zhihuE_LxTab.is-on {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_LxAdd {display:flex;gap:8px;margin-bottom:12px;}
.zhihuE_LxInput {flex:1;height:40px;padding:0 14px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font-size:13px;outline:none;}
.zhihuE_LxWeight {width:72px;flex:none;}
.zhihuE_LxBtn {height:40px;padding:0 14px;border:0;border-radius:12px;background:#1d1d1f;color:#fff;cursor:pointer;font-size:13px;}
.zhihuE_LxBtn.ghost {background:#fff;border:1px solid #e4e4e4;color:#1d1d1f;}
.zhihuE_LxCloud {flex:1;min-height:0;overflow:auto;display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;}
.zhihuE_LxChip {display:inline-flex;align-items:center;gap:6px;padding:6px 8px 6px 12px;border:1px solid #ececec;border-radius:999px;background:#f7f7f7;font-size:12px;}
.zhihuE_LxChip b {font-weight:600;color:#888;}
.zhihuE_LxDel {width:20px;height:20px;border:0;border-radius:50%;background:transparent;color:#999;cursor:pointer;}
.zhihuE_LxDel:hover {background:#1d1d1f;color:#fff;}
.zhihuE_LxEmpty {width:100%;padding:60px 0;text-align:center;color:#bbb;font-size:13px;}
.zhihuE_LxFoot {display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 28px 20px;border-top:1px solid #eee;color:#8a8a8a;font-size:13px;}
.zhihuE_LxFootRight {display:flex;gap:8px;flex-wrap:wrap;}
[data-theme="dark"] .zhihuE_LxRoot {background:#2b2f36;color:#e8edf2;}
[data-theme="dark"] .zhihuE_LxHead,[data-theme="dark"] .zhihuE_LxNav,[data-theme="dark"] .zhihuE_LxFoot {border-color:#3c434d;}
[data-theme="dark"] .zhihuE_LxNav,[data-theme="dark"] .zhihuE_LxInput,[data-theme="dark"] .zhihuE_LxChip {background:#343a44;color:#e8edf2;border-color:#3c434d;}
[data-theme="dark"] .zhihuE_LxTips,[data-theme="dark"] .zhihuE_LxFoot {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_LxNavBtn {color:#d5dce4;}
[data-theme="dark"] .zhihuE_LxNavBtn.is-on,[data-theme="dark"] .zhihuE_LxTab.is-on,[data-theme="dark"] .zhihuE_LxBtn {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_LxClose:hover,[data-theme="dark"] .zhihuE_LxDel:hover {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_LxBtn.ghost {background:#343a44;border-color:#3c434d;color:#e8edf2;}
</style>
<div class="zhihuE_LxMask">
  <div class="zhihuE_LxRoot">
    <div class="zhihuE_LxHead">
      <div>
        <h3 class="zhihuE_LxTitle">编辑噪音词库</h3>
        <p class="zhihuE_LxTips">按分类增删词条。加权词可用「词:8」导入。未改过的分类会跟随脚本默认更新；改过的只以你的版本为准。</p>
      </div>
      <button type="button" class="zhihuE_LxClose" aria-label="关闭">×</button>
    </div>
    <div class="zhihuE_LxMain">
      <div class="zhihuE_LxNav"></div>
      <div class="zhihuE_LxPane">
        <div class="zhihuE_LxTabs"></div>
        <div class="zhihuE_LxAdd">
          <input class="zhihuE_LxInput zhihuE_LxWord" type="text" placeholder="添加词语，逗号分隔；可写 词:权重" />
          <input class="zhihuE_LxInput zhihuE_LxWeight" type="number" min="1" max="20" value="6" title="默认权重" />
          <button type="button" class="zhihuE_LxBtn zhihuE_LxAddBtn">添加</button>
        </div>
        <div class="zhihuE_LxCloud"></div>
      </div>
    </div>
    <div class="zhihuE_LxFoot">
      <span class="zhihuE_LxCount">0 条</span>
      <div class="zhihuE_LxFootRight">
        <button type="button" class="zhihuE_LxBtn ghost zhihuE_LxCopy">复制本类</button>
        <button type="button" class="zhihuE_LxBtn ghost zhihuE_LxImport">粘贴覆盖</button>
        <button type="button" class="zhihuE_LxBtn ghost zhihuE_LxReset">恢复本类默认</button>
        <span>改完刷新页面生效</span>
      </div>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    const mask = document.querySelector('.zhihuE_LxMask');
    const nav = mask.querySelector('.zhihuE_LxNav');
    const tabs = mask.querySelector('.zhihuE_LxTabs');
    const cloud = mask.querySelector('.zhihuE_LxCloud');
    const countEl = mask.querySelector('.zhihuE_LxCount');
    const wordInput = mask.querySelector('.zhihuE_LxWord');
    const weightInput = mask.querySelector('.zhihuE_LxWeight');

    const persist = () => {
        saveLexicon(lex);
        render();
    };

    const currentBucket = () => buckets.find(b => b.id === current);

    const currentMap = () => {
        const bucket = currentBucket();
        if (bucket.kind === 'cat') {
            const cat = lex.cats[bucket.id];
            return tab === 'excludes' ? null : cat.words;
        }
        if (bucket.kind === 'map') return lex[bucket.id];
        return null;
    };

    const currentList = () => {
        const bucket = currentBucket();
        if (bucket.kind === 'cat' && tab === 'excludes') return lex.cats[bucket.id].excludes;
        if (bucket.kind === 'list') return lex[bucket.id];
        return null;
    };

    const mark = () => touchLexicon(lex, currentBucket().token);

    const renderNav = () => {
        nav.innerHTML = buckets.map(b =>
            `<button type="button" class="zhihuE_LxNavBtn${b.id === current ? ' is-on' : ''}" data-id="${b.id}">${escapeHtml(b.name)}</button>`
        ).join('');
    };

    const renderTabs = () => {
        const bucket = currentBucket();
        if (bucket.kind !== 'cat') {
            tabs.innerHTML = '';
            weightInput.style.display = bucket.kind === 'list' ? 'none' : '';
            return;
        }
        tabs.innerHTML = `<button type="button" class="zhihuE_LxTab${tab === 'words' ? ' is-on' : ''}" data-tab="words">关键词</button>
            <button type="button" class="zhihuE_LxTab${tab === 'excludes' ? ' is-on' : ''}" data-tab="excludes">排除词</button>`;
        weightInput.style.display = tab === 'excludes' ? 'none' : '';
    };

    const renderCloud = () => {
        const map = currentMap();
        const list = currentList();
        if (map) {
            const keys = Object.keys(map);
            countEl.textContent = `${keys.length} 条`;
            cloud.innerHTML = keys.length
                ? keys.map(word => `<span class="zhihuE_LxChip" data-word="${escapeHtml(word)}"><span>${escapeHtml(word)}</span><b>${map[word]}</b><button type="button" class="zhihuE_LxDel" data-word="${escapeHtml(word)}">×</button></span>`).join('')
                : '<div class="zhihuE_LxEmpty">还没有词，在上方添加</div>';
            return;
        }
        countEl.textContent = `${list.length} 条`;
        cloud.innerHTML = list.length
            ? list.map((word, i) => `<span class="zhihuE_LxChip"><span>${escapeHtml(word)}</span><button type="button" class="zhihuE_LxDel" data-index="${i}">×</button></span>`).join('')
            : '<div class="zhihuE_LxEmpty">还没有词，在上方添加</div>';
    };

    const render = () => {
        renderNav();
        renderTabs();
        renderCloud();
    };

    const addWords = text => {
        const fallback = Number(weightInput.value) || 6;
        const bucket = currentBucket();
        mark();
        if (currentMap()) {
            const added = parseWeightedWords(text, fallback);
            Object.assign(currentMap(), added);
        } else {
            const list = currentList();
            for (const word of uniqueWords(parseWords(text))) {
                if (!list.some(x => x.toLowerCase() === word.toLowerCase())) list.push(word);
            }
        }
        persist();
    };

    const exportText = () => {
        const map = currentMap();
        if (map) return Object.keys(map).map(k => `${k}:${map[k]}`).join(', ');
        return (currentList() || []).join(', ');
    };

    const importText = text => {
        if (!String(text || '').trim()) return;
        const fallback = Number(weightInput.value) || 6;
        const bucket = currentBucket();
        mark();
        if (bucket.kind === 'cat' && tab === 'excludes') {
            lex.cats[bucket.id].excludes = uniqueWords(parseWords(text));
        } else if (bucket.kind === 'list') {
            lex[bucket.id] = uniqueWords(parseWords(text));
        } else if (bucket.kind === 'cat') {
            lex.cats[bucket.id].words = parseWeightedWords(text, fallback);
        } else {
            lex[bucket.id] = parseWeightedWords(text, fallback);
        }
        persist();
    };

    const resetCurrent = () => {
        const fresh = defaultLexicon();
        const bucket = currentBucket();
        lex.touched = (lex.touched || []).filter(x => x !== bucket.token);
        if (bucket.kind === 'cat') lex.cats[bucket.id] = fresh.cats[bucket.id];
        else lex[bucket.id] = fresh[bucket.id];
        persist();
    };

    mask.querySelector('.zhihuE_LxClose').onclick = () => {
        mask.remove();
        const style = document.querySelector('.zhihuE_LxStyle');
        if (style) style.remove();
    };
    mask.addEventListener('click', event => {
        if (event.target === mask) mask.querySelector('.zhihuE_LxClose').click();
    });
    nav.addEventListener('click', event => {
        const btn = event.target.closest('.zhihuE_LxNavBtn');
        if (!btn) return;
        current = btn.dataset.id;
        tab = 'words';
        render();
    });
    tabs.addEventListener('click', event => {
        const btn = event.target.closest('.zhihuE_LxTab');
        if (!btn) return;
        tab = btn.dataset.tab;
        render();
    });
    mask.querySelector('.zhihuE_LxAddBtn').onclick = () => {
        addWords(wordInput.value);
        wordInput.value = '';
        wordInput.focus();
    };
    wordInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') mask.querySelector('.zhihuE_LxAddBtn').click();
    });
    cloud.addEventListener('click', event => {
        const btn = event.target.closest('.zhihuE_LxDel');
        if (!btn) return;
        mark();
        if (btn.dataset.word != null) {
            delete currentMap()[btn.dataset.word];
        } else {
            currentList().splice(Number(btn.dataset.index), 1);
        }
        persist();
    });
    mask.querySelector('.zhihuE_LxCopy').onclick = async () => {
        const text = exportText();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
        } catch (e) { /* ignore */ }
        const btn = mask.querySelector('.zhihuE_LxCopy');
        const raw = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(() => { btn.textContent = raw; }, 1200);
    };
    mask.querySelector('.zhihuE_LxImport').onclick = async () => {
        let text = '';
        try {
            if (navigator.clipboard && navigator.clipboard.readText) text = await navigator.clipboard.readText();
        } catch (e) { /* ignore */ }
        if (!text) text = prompt('粘贴词库，覆盖当前分类（词:权重 或纯词）', '') || '';
        importText(text);
    };
    mask.querySelector('.zhihuE_LxReset').onclick = resetCurrent;

    render();
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, ch => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
}

function parseWords(input) {
    return String(input || '').split(/[,，|/\n\r]+/).map(s => s.replace(/\s+/g, '')).filter(Boolean);
}

function uniqueWords(words) {
    const seen = new Set();
    const out = [];
    for (const word of words) {
        const key = word.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(word);
    }
    return out;
}

function editListDialog({ title, tips, storageKey, placeholder }) {
    if (document.querySelector('.zhihuE_DlgRoot')) return;
    let list = [...(menuValue(storageKey) || [])];
    let filter = '';

    const html = `<style class="zhihuE_DlgStyle">
.zhihuE_DlgMask {position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;padding:32px 20px;background:rgba(18,18,18,.48);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}
.zhihuE_DlgRoot {width:min(840px,96vw);height:min(760px,86vh);display:flex;flex-direction:column;background:#fff;color:#1d1d1f;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.22);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Noto Sans SC","Microsoft YaHei",sans-serif;}
.zhihuE_DlgHead {padding:28px 32px 18px;border-bottom:1px solid #eee;}
.zhihuE_DlgHeadTop {display:flex;align-items:flex-start;justify-content:space-between;gap:16px;}
.zhihuE_DlgTitle {margin:0;font-size:22px;font-weight:600;letter-spacing:.02em;line-height:1.3;}
.zhihuE_DlgTips {margin:8px 0 0;font-size:13px;line-height:1.6;color:#8a8a8a;}
.zhihuE_DlgClose {flex:none;width:36px;height:36px;border:0;border-radius:50%;background:#f4f4f5;color:#666;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,color .2s;}
.zhihuE_DlgClose:hover {background:#1d1d1f;color:#fff;}
.zhihuE_DlgBody {flex:1;min-height:0;display:flex;flex-direction:column;padding:20px 32px 12px;}
.zhihuE_DlgAdd {display:flex;gap:10px;margin-bottom:14px;}
.zhihuE_DlgInput,.zhihuE_DlgFilter {width:100%;height:44px;padding:0 16px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font-size:14px;outline:none;transition:border-color .2s,background .2s,box-shadow .2s;}
.zhihuE_DlgInput:focus,.zhihuE_DlgFilter:focus {border-color:#1d1d1f;background:#fff;box-shadow:0 0 0 4px rgba(29,29,31,.06);}
.zhihuE_DlgAddBtn {flex:none;height:44px;padding:0 22px;border:0;border-radius:12px;background:#1d1d1f;color:#fff;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .2s,transform .15s;}
.zhihuE_DlgAddBtn:hover {opacity:.88;}
.zhihuE_DlgFilterWrap {margin-bottom:14px;}
.zhihuE_DlgCloud {flex:1;min-height:0;overflow:auto;padding:6px 2px 12px;display:flex;flex-wrap:wrap;align-content:flex-start;gap:10px;}
.zhihuE_DlgCloud::-webkit-scrollbar {width:8px;}
.zhihuE_DlgCloud::-webkit-scrollbar-thumb {background:#ddd;border-radius:8px;}
.zhihuE_DlgChip {display:inline-flex;align-items:center;gap:8px;max-width:100%;padding:8px 8px 8px 14px;border:1px solid #ececec;border-radius:999px;background:#f7f7f7;font-size:13px;line-height:1.3;color:#333;transition:border-color .15s,background .15s,box-shadow .15s;}
.zhihuE_DlgChip:hover {background:#fff;border-color:#d4d4d4;box-shadow:0 4px 12px rgba(0,0,0,.04);}
.zhihuE_DlgChip span {overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.zhihuE_DlgChipDel {flex:none;width:22px;height:22px;border:0;border-radius:50%;background:transparent;color:#999;font-size:16px;line-height:22px;cursor:pointer;}
.zhihuE_DlgChipDel:hover {background:#1d1d1f;color:#fff;}
.zhihuE_DlgEmpty {width:100%;padding:80px 0;text-align:center;color:#b0b0b0;font-size:14px;}
.zhihuE_DlgFoot {display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 32px 22px;border-top:1px solid #eee;color:#8a8a8a;font-size:13px;}
.zhihuE_DlgFootRight {display:flex;align-items:center;gap:10px;}
.zhihuE_DlgCopy {height:36px;padding:0 16px;border:1px solid #e4e4e4;border-radius:10px;background:#fff;color:#1d1d1f;font-size:13px;cursor:pointer;transition:background .15s,border-color .15s;}
.zhihuE_DlgCopy:hover {background:#f7f7f7;border-color:#ccc;}
.zhihuE_DlgCopy.is-ok {background:#1d1d1f;border-color:#1d1d1f;color:#fff;}
.zhihuE_DlgImport {display:none;padding:0 32px 18px;}
.zhihuE_DlgImport.is-open {display:block;}
.zhihuE_DlgImportArea {width:100%;min-height:120px;padding:12px 14px;border:1px solid #e8e8e8;border-radius:12px;background:#fafafa;font-size:13px;line-height:1.6;resize:vertical;outline:none;box-sizing:border-box;font-family:inherit;}
.zhihuE_DlgImportArea:focus {border-color:#1d1d1f;background:#fff;box-shadow:0 0 0 4px rgba(29,29,31,.06);}
.zhihuE_DlgImportActions {display:flex;justify-content:flex-end;gap:8px;margin-top:10px;}
.zhihuE_DlgCount b {color:#1d1d1f;font-weight:600;}
[data-theme="dark"] .zhihuE_DlgRoot {background:#2b2f36;color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgHead,[data-theme="dark"] .zhihuE_DlgFoot {border-color:#3c434d;}
[data-theme="dark"] .zhihuE_DlgTips,[data-theme="dark"] .zhihuE_DlgFoot {color:#9aa4b2;}
[data-theme="dark"] .zhihuE_DlgClose,[data-theme="dark"] .zhihuE_DlgInput,[data-theme="dark"] .zhihuE_DlgFilter,[data-theme="dark"] .zhihuE_DlgChip {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgInput:focus,[data-theme="dark"] .zhihuE_DlgFilter:focus {background:#2b2f36;border-color:#c8d0da;box-shadow:0 0 0 4px rgba(255,255,255,.06);}
[data-theme="dark"] .zhihuE_DlgAddBtn,[data-theme="dark"] .zhihuE_DlgClose:hover,[data-theme="dark"] .zhihuE_DlgChipDel:hover {background:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_DlgCopy {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgCopy:hover {background:#3c434d;}
[data-theme="dark"] .zhihuE_DlgCopy.is-ok {background:#e8edf2;border-color:#e8edf2;color:#1d1d1f;}
[data-theme="dark"] .zhihuE_DlgImportArea {background:#343a44;border-color:#3c434d;color:#e8edf2;}
[data-theme="dark"] .zhihuE_DlgImportArea:focus {background:#2b2f36;border-color:#c8d0da;}
[data-theme="dark"] .zhihuE_DlgCount b {color:#fff;}
</style>
<div class="zhihuE_DlgMask">
  <div class="zhihuE_DlgRoot">
    <div class="zhihuE_DlgHead">
      <div class="zhihuE_DlgHeadTop">
        <div>
          <h3 class="zhihuE_DlgTitle">${escapeHtml(title)}</h3>
          <p class="zhihuE_DlgTips">${escapeHtml(tips)}</p>
        </div>
        <button type="button" class="zhihuE_DlgClose" title="关闭" aria-label="关闭">
          <svg fill="currentColor" viewBox="0 0 24 24" width="18" height="18"><path d="M13.486 12l5.208-5.207a1.048 1.048 0 0 0-.006-1.483 1.046 1.046 0 0 0-1.482-.005L12 10.514 6.793 5.305a1.048 1.048 0 0 0-1.483.005 1.046 1.046 0 0 0-.005 1.483L10.514 12l-5.208 5.207a1.048 1.048 0 0 0 .006 1.483 1.046 1.046 0 0 0 1.482.005L12 13.486l5.207 5.208a1.048 1.048 0 0 0 1.483-.006 1.046 1.046 0 0 0 .005-1.482L13.486 12z" fill-rule="evenodd"></path></svg>
        </button>
      </div>
    </div>
    <div class="zhihuE_DlgBody">
      <div class="zhihuE_DlgAdd">
        <input class="zhihuE_DlgInput" type="text" placeholder="${escapeHtml(placeholder)}" />
        <button type="button" class="zhihuE_DlgAddBtn">添加</button>
      </div>
      <div class="zhihuE_DlgFilterWrap"><input class="zhihuE_DlgFilter" type="search" placeholder="在已有词条中筛选…" /></div>
      <div class="zhihuE_DlgCloud"></div>
    </div>
    <div class="zhihuE_DlgFoot">
      <div class="zhihuE_DlgCount">共 <b class="zhihuE_DlgCountNum">0</b> 条</div>
      <div class="zhihuE_DlgFootRight">
        <span>修改后刷新页面生效</span>
        <button type="button" class="zhihuE_DlgCopy zhihuE_DlgImportBtn">粘贴导入</button>
        <button type="button" class="zhihuE_DlgCopy zhihuE_DlgCopyAll">复制全部</button>
      </div>
    </div>
    <div class="zhihuE_DlgImport">
      <textarea class="zhihuE_DlgImportArea" placeholder="粘贴词表，用逗号、换行或 | 分隔。确认后覆盖当前列表并自动去重。"></textarea>
      <div class="zhihuE_DlgImportActions">
        <button type="button" class="zhihuE_DlgCopy zhihuE_DlgImportCancel">取消</button>
        <button type="button" class="zhihuE_DlgCopy is-ok zhihuE_DlgImportOk">确认覆盖导入</button>
      </div>
    </div>
  </div>
</div>`;

    document.body.insertAdjacentHTML('beforeend', html);
    const mask = document.querySelector('.zhihuE_DlgMask');
    const cloud = mask.querySelector('.zhihuE_DlgCloud');
    const countEl = mask.querySelector('.zhihuE_DlgCountNum');
    const input = mask.querySelector('.zhihuE_DlgInput');

    const visibleList = () => {
        if (!filter) return list.map((word, index) => ({ word, index }));
        const q = filter.toLowerCase();
        return list.map((word, index) => ({ word, index })).filter(item => item.word.toLowerCase().includes(q));
    };

    const persist = () => {
        menuSet(storageKey, list);
        countEl.textContent = String(list.length);
        const items = visibleList();
        if (!list.length) {
            cloud.innerHTML = '<div class="zhihuE_DlgEmpty">还没有词条，在上方添加</div>';
            return;
        }
        if (!items.length) {
            cloud.innerHTML = '<div class="zhihuE_DlgEmpty">没有匹配的词条</div>';
            return;
        }
        cloud.innerHTML = items.map(({ word, index }) =>
            `<span class="zhihuE_DlgChip" title="${escapeHtml(word)}"><span>${escapeHtml(word)}</span><button type="button" class="zhihuE_DlgChipDel" data-index="${index}" aria-label="删除">×</button></span>`
        ).join('');
    };

    const close = () => {
        mask.remove();
        const style = document.querySelector('.zhihuE_DlgStyle');
        if (style) style.remove();
    };

    const addFromInput = () => {
        const words = parseWords(input.value);
        const added = words.filter(w => !list.includes(w));
        if (!added.length) return;
        list = added.concat(list);
        input.value = '';
        persist();
        input.focus();
    };

    const flashBtn = (btn, text, ok = true) => {
        const raw = btn.dataset.label || btn.textContent;
        btn.dataset.label = raw;
        btn.textContent = text;
        btn.classList.toggle('is-ok', ok);
        setTimeout(() => {
            btn.textContent = btn.dataset.label;
            btn.classList.remove('is-ok');
        }, 1600);
    };

    const applyImport = text => {
        const next = uniqueWords(parseWords(text));
        const btn = mask.querySelector('.zhihuE_DlgImportBtn');
        if (!next.length) {
            flashBtn(btn, '没有可用词条', false);
            return false;
        }
        list = next;
        persist();
        flashBtn(btn, `已导入 ${next.length} 条`);
        return true;
    };

    const openImportPanel = (preset = '') => {
        const panel = mask.querySelector('.zhihuE_DlgImport');
        const area = mask.querySelector('.zhihuE_DlgImportArea');
        panel.classList.add('is-open');
        area.value = preset;
        area.focus();
        area.select();
    };

    const closeImportPanel = () => {
        mask.querySelector('.zhihuE_DlgImport').classList.remove('is-open');
    };

    const importFromPaste = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.readText) {
                const text = (await navigator.clipboard.readText() || '').trim();
                if (text) {
                    applyImport(text);
                    closeImportPanel();
                    return;
                }
            }
        } catch (e) { /* 无剪贴板权限时改为手动粘贴 */ }
        openImportPanel();
    };

    const copyAll = async () => {
        const text = list.join(', ');
        const btn = mask.querySelector('.zhihuE_DlgCopyAll');
        const done = ok => {
            btn.textContent = ok ? '已复制' : '复制失败';
            btn.classList.toggle('is-ok', ok);
            setTimeout(() => {
                btn.textContent = '复制全部';
                btn.classList.remove('is-ok');
            }, 1600);
        };
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                const ta = document.createElement('textarea');
                ta.value = text;
                ta.setAttribute('readonly', '');
                ta.style.cssText = 'position:fixed;left:-9999px;top:0';
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                ta.remove();
            }
            done(true);
        } catch (e) {
            done(false);
        }
    };

    mask.querySelector('.zhihuE_DlgClose').onclick = close;
    mask.addEventListener('click', event => {
        if (event.target === mask) close();
    });
    mask.querySelector('.zhihuE_DlgAddBtn').onclick = addFromInput;
    mask.querySelector('.zhihuE_DlgCopyAll').onclick = copyAll;
    mask.querySelector('.zhihuE_DlgImportBtn').onclick = importFromPaste;
    mask.querySelector('.zhihuE_DlgImportCancel').onclick = closeImportPanel;
    mask.querySelector('.zhihuE_DlgImportOk').onclick = () => {
        if (applyImport(mask.querySelector('.zhihuE_DlgImportArea').value)) closeImportPanel();
    };
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') addFromInput();
        if (event.key === 'Escape') close();
    });
    mask.querySelector('.zhihuE_DlgFilter').addEventListener('input', event => {
        filter = event.target.value.trim();
        persist();
    });
    cloud.addEventListener('click', event => {
        const btn = event.target.closest('.zhihuE_DlgChipDel');
        if (!btn) return;
        const index = Number(btn.dataset.index);
        if (Number.isNaN(index)) return;
        list.splice(index, 1);
        persist();
    });

    persist();
    setTimeout(() => input.focus(), 50);
}

function customBlockUsers() {
    editListDialog({
        title: '编辑屏蔽用户',
        tips: '用户名需完全匹配。可用逗号、顿号或 | 一次添加多个。',
        storageKey: 'menu_customBlockUsers',
        placeholder: '例如：盐选推荐, 故事档案局'
    });
}

function customBlockKeywords() {
    editListDialog({
        title: '编辑屏蔽关键词',
        tips: '不区分大小写，支持表情如 [捂脸]。可用逗号、/ 或 | 一次添加多个。',
        storageKey: 'menu_customBlockKeywords',
        placeholder: '例如：广告, 引流, [捂脸]'
    });
}

/* -------------------------------------------------------------------------- */
/* 收起回答                                                                   */
/* -------------------------------------------------------------------------- */

function getCollapsedAnswerObserver() {
    if (window._collapsedAnswerObserver) return window._collapsedAnswerObserver;

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            if (mutation.target.hasAttribute && mutation.target.hasAttribute('script-collapsed')) return;
            if (mutation.target.classList && mutation.target.classList.contains('RichContent')) {
                for (const addedNode of mutation.addedNodes) {
                    if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
                    if (addedNode.className !== 'RichContent-inner') continue;
                    if (addedNode.offsetHeight < 400) break;
                    const button = mutation.target.querySelector('.ContentItem-actions.Sticky [data-zop-retract-question]');
                    if (button) {
                        mutation.target.setAttribute('script-collapsed', '');
                        button.click();
                        return;
                    }
                }
            } else if (mutation.target.tagName === 'DIV' && !mutation.target.style.cssText && !mutation.target.className) {
                if (mutation.target.parentElement && mutation.target.parentElement.hasAttribute('script-collapsed')) return;
                const button = mutation.target.querySelector('.ContentItem-actions.Sticky [data-zop-retract-question]');
                if (button) {
                    mutation.target.parentElement.setAttribute('script-collapsed', '');
                    button.click();
                    return;
                }
            }
        }
    });

    observer.start = function () {
        if (!this._active) {
            this.observe(document, { childList: true, subtree: true });
            this._active = true;
        }
    };
    observer.end = function () {
        if (this._active) this.disconnect();
        this._active = false;
    };

    window.addEventListener('urlchange', () => {
        observer[location.href.includes('/answer/') ? 'end' : 'start']();
    });
    window._collapsedAnswerObserver = observer;
    return observer;
}

function defaultCollapsedAnswer() {
    if (!menuValue('menu_defaultCollapsedAnswer')) return;
    const observer = getCollapsedAnswerObserver();
    if (!location.href.includes('/answer/')) observer.start();
}

function collapsedAnswer() {
    if (!menuValue('menu_collapsedAnswer')) return;
    const corner = document.querySelector('.CornerAnimayedFlex');
    if (!corner || document.getElementById('collapsed-button')) return;

    injectStyle('zhihu-plus-collapsed-btn', '.CornerButton{margin-bottom:8px !important;}.CornerButtons{bottom:45px !important;}');
    const cls = corner.querySelector('button') ? corner.querySelector('button').className : 'CornerButton';
    corner.insertAdjacentHTML('afterBegin', `<button id="collapsed-button" data-tooltip="收起全部回答/评论" data-tooltip-position="left" data-tooltip-will-hide-on-click="false" aria-label="收起全部回答/评论" type="button" class="${cls}"><svg class="ContentItem-arrowIcon is-active" aria-label="收起全部回答/评论" fill="currentColor" viewBox="0 0 24 24" width="24" height="24"><path d="M16.036 19.59a1 1 0 0 1-.997.995H9.032a.996.996 0 0 1-.997-.996v-7.005H5.03c-1.1 0-1.36-.633-.578-1.416L11.33 4.29a1.003 1.003 0 0 1 1.412 0l6.878 6.88c.782.78.523 1.415-.58 1.415h-3.004v7.005z"></path></svg></button>`);

    document.getElementById('collapsed-button').onclick = function () {
        document.querySelectorAll('.Comments-container').forEach(el => {
            const btn = getXpath('//button[text()="收起评论"]', el);
            if (btn) btn.click();
        });
        document.querySelectorAll('.RichContent >.ContentItem-actions>button:first-of-type').forEach(el => {
            if (el.textContent.includes('收起评论')) el.click();
        });

        const p = page();
        if (p.isHome || p.isHot || p.isFollow) {
            document.querySelectorAll('.ContentItem-rightButton').forEach(el => {
                if (el.hasAttribute('data-zop-retract-question')) el.click();
            });
            return;
        }

        document.querySelectorAll('[script-collapsed]').forEach(scriptCollapsed => {
            scriptCollapsed.querySelectorAll('.ContentItem-actions [data-zop-retract-question], .ContentItem-actions.Sticky [data-zop-retract-question]').forEach(button => button.click());
        });
        document.querySelectorAll('.RichContent:not([script-collapsed]) .ContentItem-actions.Sticky [data-zop-retract-question]').forEach(button => {
            let el = button.parentElement;
            while (el && !el.classList.contains('RichContent')) el = el.parentElement;
            if (el) el.setAttribute('script-collapsed', '');
            button.click();
        });

        const observer = getCollapsedAnswerObserver();
        observer.start();
        if (!menuValue('menu_defaultCollapsedAnswer') && !observer._disconnectListener) {
            window.addEventListener('urlchange', () => {
                observer.end();
                window._collapsedAnswerObserver = null;
            });
            observer._disconnectListener = true;
        }
    };
}

function collapsedNowAnswer(selectors) {
    backToTop(selectors);
    if (!menuValue('menu_collapsedNowAnswer')) return;
    const root = document.querySelector(selectors);
    if (!root) return;

    root.onclick = function (event) {
        if (event.target !== this) return;

        const rightBar = document.querySelector('.ContentItem-actions.Sticky.RichContent-actions.is-fixed.is-bottom');
        if (rightBar) {
            const commentBtn = rightBar.querySelector('button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
            if (commentBtn && commentBtn.textContent.includes('收起评论')) commentBtn.click();
            const retract = rightBar.querySelector('.ContentItem-rightButton[data-zop-retract-question]');
            if (retract) retract.click();
        } else {
            let clicked = false;
            for (const el of document.querySelectorAll('.ContentItem-rightButton[data-zop-retract-question]')) {
                if (!isElementInViewport(el)) continue;
                const commentBtn = el.parentNode.querySelector('button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
                if (commentBtn && commentBtn.textContent.includes('收起评论')) {
                    commentBtn.click();
                    if (!isElementInViewport(commentBtn)) scrollTo(0, el.offsetTop + 50);
                }
                el.click();
                clicked = true;
                break;
            }
            if (!clicked) {
                for (const el of document.querySelectorAll('.List-item, .Card.AnswerCard, .Card.TopstoryItem')) {
                    if (!isElementInViewportPartial(el)) continue;
                    const commentBtn = el.querySelector('button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
                    if (commentBtn && commentBtn.textContent.includes('收起评论')) {
                        commentBtn.click();
                        if (!isElementInViewport(commentBtn)) scrollTo(0, el.offsetTop + 50);
                    }
                    const retract = el.querySelector('.ContentItem-rightButton[data-zop-retract-question]');
                    if (retract) retract.click();
                    break;
                }
            }
        }

        const floating = getXpath('//button[text()="收起评论"]', document.querySelector('.Comments-container'));
        if (floating) {
            floating.click();
            return;
        }

        const fixedBtns = document.querySelectorAll('.ContentItem-actions > button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type, .ContentItem-action > button.Button.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
        for (const el of fixedBtns) {
            if (el.textContent.includes('收起评论') && isElementInViewport(el)) {
                el.click();
                return;
            }
        }

        for (const el of document.querySelectorAll('.Comments-container')) {
            if (!isElementInViewport(el)) continue;
            const parentElement = findParentElement(el, 'List-item') || findParentElement(el, 'Card ');
            if (!parentElement) continue;
            const commentBtn = parentElement.querySelector('.ContentItem-actions > button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
            if (commentBtn && commentBtn.textContent.includes('收起评论')) {
                commentBtn.click();
                if (!isElementInViewport(commentBtn)) scrollTo(0, parentElement.offsetTop + parentElement.offsetHeight - 50);
                return;
            }
        }

        for (const el of document.querySelectorAll('.Editable-content')) {
            if (!isElementInViewport(el)) continue;
            const parentElement = findParentElement(el, 'List-item') || findParentElement(el, 'Card ');
            if (!parentElement) continue;
            const commentBtn = parentElement.querySelector('.ContentItem-actions > button.Button.ContentItem-action.Button--plain.Button--withIcon.Button--withLabel:first-of-type');
            if (commentBtn && commentBtn.textContent.includes('收起评论')) {
                commentBtn.click();
                if (!isElementInViewport(commentBtn)) scrollTo(0, parentElement.offsetTop + parentElement.offsetHeight - 50);
                break;
            }
        }
    };
}

function backToTop(selectors) {
    if (!menuValue('menu_backToTop')) return;
    const root = document.querySelector(selectors);
    if (!root) return;
    root.oncontextmenu = function (event) {
        if (event.target !== this) return;
        event.preventDefault();
        window.scrollTo(0, 0);
    };
}

function closeFloatingComments() {
    observeTree(mutations => {
        forAddedElements(mutations, () => {
            const button = document.querySelector('button[aria-label="关闭"]');
            if (!button) return;
            const wrap = button.parentElement && button.parentElement.parentElement;
            if (!wrap) return;
            wrap.onclick = function (event) {
                if (event.target.parentElement === this) button.click();
            };
        });
    });
}

/* -------------------------------------------------------------------------- */
/* 屏蔽用户 / 关键词                                                          */
/* -------------------------------------------------------------------------- */

function authorFromZop(item) {
    const zop = item && item.dataset && item.dataset.zop;
    if (!zop) return '';
    const m = zop.match(/authorName":"([^"]+)"/);
    return m ? m[1] : '';
}

function userBlocked(name) {
    const list = menuValue('menu_customBlockUsers') || [];
    return name && list.includes(name);
}

function hideBlockedCard(card, item) {
    const name = authorFromZop(item);
    if (!userBlocked(name)) return false;
    card.hidden = true;
    return true;
}

function blockUsers(type) {
    if (!menuValue('menu_blockUsers')) return;
    const list = menuValue('menu_customBlockUsers');
    if (!list || !list.length) return;

    switch (type) {
        case 'index':
            blockUsersFeed('.Card.TopstoryItem.TopstoryItem-isRecommend', 'Card TopstoryItem TopstoryItem-isRecommend');
            break;
        case 'question':
            blockUsersQuestion();
            break;
        case 'search':
            blockUsersSearch();
            break;
        case 'topic':
            blockUsersFeed('.List-item.TopicFeedItem', 'List-item TopicFeedItem');
            break;
        case 'people':
            blockUsersButtonPeople();
            break;
    }
    blockUsersComment();
    blockUsersHoverButton();
}

function blockUsersFeed(selector, className) {
    const scan = () => {
        document.querySelectorAll(selector).forEach(card => {
            hideBlockedCard(card, card.querySelector('.ContentItem.AnswerItem, .ContentItem.ArticleItem'));
        });
    };
    scan();
    window.addEventListener('urlchange', () => setTimeout(scan, 1000));
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.className === className) {
                hideBlockedCard(target, target.querySelector('.ContentItem.AnswerItem, .ContentItem.ArticleItem'));
            }
        });
    });
}

function blockUsersQuestion() {
    const hideItem = item => {
        const answer = item.querySelector('.ContentItem.AnswerItem');
        if (answer) hideBlockedCard(item, answer);
    };
    const onAdd = mutations => {
        forAddedElements(mutations, target => {
            if (page().isAnswer) {
                target.querySelectorAll('.List-item, .Card.AnswerCard').forEach(hideItem);
            } else if (target.className === 'List-item' || target.className === 'Card AnswerCard') {
                hideItem(target);
            }
        });
    };
    observeTree(onAdd);
    document.querySelectorAll('.List-item, .Card.AnswerCard').forEach(hideItem);
}

function blockUsersSearch() {
    const scan = () => {
        if (!location.search.includes('type=content')) return;
        document.querySelectorAll('.Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"], .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"]').forEach(card => {
            const nameEl = card.querySelector('.RichText.ztext.CopyrightRichText-richText b');
            if (nameEl && userBlocked(nameEl.textContent)) card.hidden = true;
        });
    };
    setTimeout(scan, 2000);
    window.addEventListener('urlchange', () => setTimeout(scan, 1000));
    observeTree(mutations => {
        if (!location.search.includes('type=content')) return;
        forAddedElements(mutations, target => {
            const nameEl = target.querySelector('.Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"] .RichText.ztext.CopyrightRichText-richText b, .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"] .RichText.ztext.CopyrightRichText-richText b');
            if (nameEl && userBlocked(nameEl.textContent)) target.hidden = true;
        });
    });
}

function blockUsersComment() {
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            const item = target.querySelector('img.Avatar[width="24"]');
            if (item && userBlocked(item.alt) && item.parentElement && item.parentElement.parentElement) {
                item.parentElement.parentElement.style.display = 'none';
            }
        });
    });
}

function blockUsersHoverButton() {
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            const cn = typeof target.className === 'string' ? target.className : '';
            const hit = cn.includes('Popover-content Popover-content--top HoverCard-popoverTarget') ||
                cn.includes('Popover-content Popover-content--bottom HoverCard-popoverTarget') ||
                target.querySelector('.Popover-content.Popover-content--top.HoverCard-popoverTarget') ||
                target.querySelector('.Popover-content.Popover-content--bottom.HoverCard-popoverTarget');
            if (!hit) return;
            const item = target.querySelector('.MemberButtonGroup.ProfileButtonGroup.HoverCard-buttons');
            const link = target.querySelector('a.UserLink-link');
            if (!item || !link || target.querySelector('button[data-name][data-userid]')) return;
            const name = link.textContent;
            const userid = link.href.split('/')[4];
            item.insertAdjacentHTML('beforeend', blockUserButtonHtml(name, userid, 'width: 100%;margin: 7px 0 0 0;', '屏蔽用户'));
            item.lastElementChild.onclick = function () {
                blockUsersAdd(this.dataset.name, this.dataset.userid, false);
            };
        });
    });
}

function blockUserButtonHtml(name, userid, style, text) {
    return `<button type="button" data-name="${name}" data-userid="${userid}" class="Button FollowButton Button--primary Button--red" style="${style}"><span style="display: inline-flex; align-items: center;">​<svg class="Zi Zi--Plus FollowButton-icon" fill="currentColor" viewBox="0 0 24 24" width="1.2em" height="1.2em"><path d="M18.376 5.624c-3.498-3.499-9.254-3.499-12.752 0-3.499 3.498-3.499 9.254 0 12.752 3.498 3.499 9.254 3.499 12.752 0 3.499-3.498 3.499-9.14 0-12.752zm-1.693 1.693c2.37 2.37 2.596 6.094.678 8.69l-9.367-9.48c2.708-1.919 6.32-1.58 8.69.79zm-9.48 9.48c-2.37-2.37-2.595-6.095-.676-8.69l9.48 9.48c-2.822 1.918-6.433 1.58-8.803-.79z" fill-rule="evenodd"></path></svg></span>${text}</button>`;
}

function blockUsersButtonPeople() {
    const item = document.querySelector('.MemberButtonGroup.ProfileButtonGroup.ProfileHeader-buttons');
    const nameEl = document.querySelector('.ProfileHeader-name');
    if (!item || !nameEl) return;
    const name = nameEl.firstChild && nameEl.firstChild.textContent;
    const userid = location.href.split('/')[4];
    const users = menuValue('menu_customBlockUsers') || [];
    if (users.includes(name)) {
        document.querySelectorAll('.Button.Button--primary.Button--red').forEach(btn => { btn.style.display = 'none'; });
        item.insertAdjacentHTML('beforeend', blockUserButtonHtml(name, userid, 'margin: 0 0 0 12px;', '取消屏蔽'));
        item.lastElementChild.onclick = function () {
            blockUsersDel(this.dataset.name, this.dataset.userid, true);
        };
        return;
    }
    item.insertAdjacentHTML('beforeend', blockUserButtonHtml(name, userid, 'margin: 0 0 0 12px;', '屏蔽用户'));
    item.lastElementChild.onclick = function () {
        blockUsersAdd(this.dataset.name, this.dataset.userid, true);
    };
}

function blockUsersAdd(name, userid, reload) {
    if (!name || !userid) return;
    const users = menuValue('menu_customBlockUsers') || [];
    if (users.includes(name)) {
        notify('该用户已经被屏蔽啦，无需重复屏蔽~');
        return;
    }
    users.push(name);
    menuSet('menu_customBlockUsers', users);
    GM_xmlhttpRequest({ url: `https://www.zhihu.com/api/v4/members/${userid}/actions/block`, method: 'POST', timeout: 2000 });
    if (reload) setTimeout(() => location.reload(), 200);
    else notify('该用户已被屏蔽~\n刷新网页后生效~');
}

function blockUsersDel(name, userid, reload) {
    if (!name || !userid) return;
    const users = menuValue('menu_customBlockUsers') || [];
    const index = users.indexOf(name);
    if (index < 0) {
        notify('没有在屏蔽列表中找到该用户...');
        return;
    }
    users.splice(index, 1);
    menuSet('menu_customBlockUsers', users);
    GM_xmlhttpRequest({ url: `https://www.zhihu.com/api/v4/members/${userid}/actions/block`, method: 'DELETE', timeout: 2000 });
    if (reload) setTimeout(() => location.reload(), 200);
    else notify('该用户已取消屏蔽啦~\n刷新网页后生效~');
}

const NOISE_WEIGHTS = { k: 0.30, c: 0.25, e: 0.15, s: 0.15, b: 0.15, v: 0.30 };
const NOISE_HIDE = 60;
const NOISE_DEMOTE = 30;

function noiseWords(weight, list) {
    const out = Object.create(null);
    for (const word of list) out[word] = weight;
    return out;
}

const NOISE_CATEGORIES = [
    {
        id: 'celebrity', name: '娱乐八卦', level: 1, c: 90,
        words: Object.assign(noiseWords(10, ['塌房', '出轨', '劈腿', '大瓜', '实锤', '爆料', '黑料', '绯闻', '热搜', '饭圈', '追星', '控评', '脱粉', '站姐', '红毯', '生图']),
            noiseWords(8, ['明星', '艺人', '偶像', '爱豆', '流量', '顶流', '娱乐圈', '网红', '主播', '吃瓜', '官宣', '分手', '复合', '粉丝', '颜值', '精修']),
            noiseWords(6, ['演员', '歌手', '男明星', '女明星', '男演员', '女演员', '女神', '帅哥', '小哥哥', '小姐姐', '美女', '八卦', '恋情', '私生活', '机场照']),
            noiseWords(8, ['鞠婧祎', '赵丽颖', '高圆圆', '田曦薇', '李小璐', '张凌赫', '周淑怡', '成龙', '韩红', '曲婉婷', '邹市明', '影视飓风', '鹅腿阿姨'])),
        excludes: ['电影史', '表演理论', '导演', '编剧', '奥斯卡']
    },
    {
        id: 'gender', name: '男女对立', level: 1, c: 90,
        words: Object.assign(noiseWords(10, ['男女对立', '性别对立', '厌男', '厌女', '田园女权', '拳师', '普信男', '普信女', '渣男', '渣女', '雌竞', '雄竞', '恋爱脑']),
            noiseWords(8, ['男权', '女权', '凤凰男', '妈宝男', '舔狗', '接盘侠', '下头男', '下头女', '男性凝视', '女性凝视', '婚恋观', '择偶观']),
            noiseWords(5, ['男性', '女性', '男人', '女人', '男生', '女生', '男子', '女子', '男女', '两性', '性别'])),
        excludes: ['性别平等', '性别医学', '生理性别']
    },
    {
        id: 'marriage', name: '婚恋生育', level: 1, c: 75,
        words: Object.assign(noiseWords(9, ['大龄剩女', '剩女', '剩男', '催婚', '催生', '彩礼', '相亲角', '婚恋市场']),
            noiseWords(6, ['结婚', '离婚', '再婚', '二婚', '婚姻', '相亲', '脱单', '备婚', '领证', '生娃', '生孩子', '备孕', '二胎', '三胎', '丁克', '不婚']),
            noiseWords(5, ['恋爱', '男朋友', '女朋友', '前任', '夫妻', '情侣', '怀孕', '生育率', '大龄女', '大龄男', '择偶'])),
        excludes: ['人口经济学', '生育政策研究', '人口普查']
    },
    {
        id: 'family', name: '原生家庭', level: 1, c: 75,
        words: Object.assign(noiseWords(8, ['原生家庭', '家暴', '家庭暴力', '扶弟魔', '伏地魔', '断亲', '重男轻女', '啃老']),
            noiseWords(6, ['婆媳', '亲子关系', '家庭矛盾', '生物爹', '继父', '继母', '赡养', '带娃', '育儿']),
            noiseWords(4, ['父亲', '母亲', '爸爸', '妈妈', '儿子', '女儿', '小孩', '独生子女'])),
        excludes: ['儿科', '儿童医学', '教育科学']
    },
    {
        id: 'gossip', name: '吃瓜爆料', level: 1, c: 88,
        words: Object.assign(noiseWords(10, ['大瓜', '惊天内幕', '匿名爆料', '独家爆料', '内部消息', '知情人士']),
            noiseWords(8, ['吃瓜', '爆料', '内幕', '黑幕', '实锤', '聊天记录', '圈内人', '细节曝光'])),
        excludes: []
    },
    {
        id: 'looks', name: '外貌身材', level: 1, c: 70,
        words: Object.assign(noiseWords(7, ['白幼瘦', '白富美', '高富帅', '神颜', '颜值巅峰', '私房', '比基尼']),
            noiseWords(5, ['身材', '颜值', '长相', '美貌', '整容', '医美', '微整', '素颜', '腹肌', '大长腿'])),
        excludes: ['整形外科医学', '临床减肥', '运动康复']
    },
    {
        id: 'acg', name: '二次元游戏', level: 2, c: 62,
        words: Object.assign(noiseWords(8, ['抽卡', '卡池', '角色厨', '老婆党', '二次元老婆', 'coser', 'cosplay']),
            noiseWords(6, ['二次元', '漫展', '同人', '手办', '谷子', '痛车', '星穹铁道', '崩铁', '原神', '绝区零', '鸣潮', '恋与深空', '战锤40k', '流萤', '崩坏']),
            noiseWords(4, ['动漫', '番剧', '国漫', '日漫', 'jk', 'lolita', '洛丽塔', '盲盒', '三角洲行动', '崩老头'])),
        excludes: ['gpu', '英伟达', '显卡', '游戏引擎', '图形学', '产业报告']
    },
    {
        id: 'consume', name: '消费种草', level: 2, c: 55,
        words: Object.assign(noiseWords(8, ['种草', '闭眼入', '必买', '直播带货', '网红同款', '明星同款', '小红书同款']),
            noiseWords(5, ['拔草', '好物', '平替', '开箱', '优惠券', '带货', '爆款', '值得买', '天花板', '奶茶', '闲鱼', '得物', '迪士尼'])),
        excludes: ['消费价格指数', 'cpi', '宏观消费']
    },
    {
        id: 'auto', name: '汽车热点', level: 2, c: 35,
        words: Object.assign(noiseWords(5, ['理想l9', '理想汽车', '问界', '小米汽车', '鸿蒙智行', '华为汽车']),
            noiseWords(3, ['新能源汽车', '智驾', '车评', '提车', '落地价', '保值率', '比亚迪', '蔚来', '小鹏', '极氪', '特斯拉'])),
        excludes: ['财报', '供应链', '芯片', '固态电池', '产能', '毛利率']
    },
    {
        id: 'lifestyle', name: '网红生活', level: 2, c: 58,
        words: Object.assign(noiseWords(6, ['vlog', '探店', 'ootd', '松弛感', '氛围感', '仪式感', '精致生活']),
            noiseWords(4, ['打卡', '穿搭', '妆容', '美妆', '护肤', '健身房', '拉丁舞', '旅游攻略'])),
        excludes: ['运动医学', '皮肤科', '营养学']
    },
    {
        id: 'sports', name: '体育热点', level: 2, c: 45,
        words: Object.assign(noiseWords(5, ['世界杯', '欧洲杯', '奥运会', 'nba', 'cba']),
            noiseWords(3, ['球迷', '夺冠', '赛后', '看台', '空座', '体育生', '球星'])),
        excludes: ['运动医学', '体育产业', '生物力学']
    },
    {
        id: 'compare', name: '社会比较', level: 3, c: 40,
        words: Object.assign(noiseWords(6, ['人生赢家', '别人家的孩子', '阶层跃迁', '财富自由']),
            noiseWords(3, ['985', '211', '双一流', '清北', '年薪', '月入', '豪车', '豪宅', '同龄人'])),
        excludes: ['教育统计', '劳动力市场', '收入分配研究']
    },
    {
        id: 'intl', name: '国际情绪', level: 3, c: 22,
        words: Object.assign(noiseWords(4, ['今日俄罗斯', '俄乌战争', '美国大选']),
            noiseWords(2, ['俄罗斯', '特朗普', '普京', '泽连斯基', '北约', '白宫'])),
        excludes: ['国际关系理论', '国际法', '军控研究']
    },
    {
        id: 'stock', name: '股市情绪', level: 3, c: 28,
        words: noiseWords(3, ['a股', 'a股股市', '牛市', '熊市', '涨停', '跌停']),
        excludes: ['货币政策', '美联储', '宏观经济', '利率']
    }
];

const NOISE_EMOTION = Object.assign(
    noiseWords(8, ['炸锅', '破防', '气炸', '怒斥', '炮轰', '细思极恐', '全网炸锅', '网友炸锅']),
    noiseWords(6, ['震惊', '离谱', '炸裂', '怒了', '痛批', '质问', '笑死', '绷不住', '全网热议'])
);
const NOISE_CONTROVERSY = ['争议', '冲突', '对立', '矛盾', '互骂', '开战', '站队', '分成两派', '支持反对'];
const NOISE_CLICKBAIT = ['震惊', '真相', '内幕', '竟然', '居然', '背后', '你绝对想不到', '千万不要', '不转不是', '看完沉默', '太可怕', '建议所有人'];
const NOISE_VALUE = Object.assign(
    noiseWords(10, ['ai', '人工智能', '芯片', '半导体', 'dram', 'hbm', 'gpu', 'cpu', '量子计算', '开源', 'linux', '数据库', '云计算', '网络安全']),
    noiseWords(8, ['编程', '软件', '算法', '论文', '科研', '实验', '工程', '供应链', '产业链', '财报', '宏观经济', '货币政策', '美联储', '长鑫科技']),
    noiseWords(6, ['技术', '科学', '医学', '学术', '利率', '公司业绩'])
);

let noiseIndex = null;
const LEXICON_KEY = 'noise_lexicon_v1';

function cloneWords(map) {
    return Object.assign(Object.create(null), map || {});
}

function defaultLexicon() {
    const cats = Object.create(null);
    for (const cat of NOISE_CATEGORIES) {
        cats[cat.id] = {
            id: cat.id,
            name: cat.name,
            level: cat.level,
            c: cat.c,
            words: cloneWords(cat.words),
            excludes: (cat.excludes || []).slice()
        };
    }
    return {
        touched: [],
        cats,
        emotion: cloneWords(NOISE_EMOTION),
        controversy: NOISE_CONTROVERSY.slice(),
        clickbait: NOISE_CLICKBAIT.slice(),
        value: cloneWords(NOISE_VALUE)
    };
}

function getActiveLexicon() {
    const base = defaultLexicon();
    const saved = GM_getValue(LEXICON_KEY);
    if (!saved || typeof saved !== 'object') return base;
    const touched = new Set(saved.touched || []);
    for (const id of Object.keys(base.cats)) {
        if (!touched.has('cat:' + id) || !saved.cats || !saved.cats[id]) continue;
        const src = saved.cats[id];
        base.cats[id] = {
            id,
            name: src.name || base.cats[id].name,
            level: src.level || base.cats[id].level,
            c: typeof src.c === 'number' ? src.c : base.cats[id].c,
            words: src.words && typeof src.words === 'object' ? cloneWords(src.words) : base.cats[id].words,
            excludes: Array.isArray(src.excludes) ? src.excludes.slice() : base.cats[id].excludes
        };
    }
    if (touched.has('emotion') && saved.emotion) base.emotion = cloneWords(saved.emotion);
    if (touched.has('controversy') && Array.isArray(saved.controversy)) base.controversy = saved.controversy.slice();
    if (touched.has('clickbait') && Array.isArray(saved.clickbait)) base.clickbait = saved.clickbait.slice();
    if (touched.has('value') && saved.value) base.value = cloneWords(saved.value);
    base.touched = [...touched];
    return base;
}

function saveLexicon(data) {
    GM_setValue(LEXICON_KEY, data);
    noiseIndex = null;
}

function touchLexicon(data, token) {
    const set = new Set(data.touched || []);
    set.add(token);
    data.touched = [...set];
}

function compileNoiseIndex() {
    if (noiseIndex) return noiseIndex;
    const lex = getActiveLexicon();
    const enabled = {
        1: menuValue('menu_noiseL1') !== false,
        2: menuValue('menu_noiseL2') !== false,
        3: !!menuValue('menu_noiseL3')
    };
    const cats = [];
    const seen = new Set();
    for (const cat of Object.keys(lex.cats).map(id => lex.cats[id])) {
        if (!enabled[cat.level]) continue;
        const words = Object.keys(cat.words).map(k => ({
            k: k.toLowerCase(),
            w: cat.words[k],
            len: k.length
        })).sort((a, b) => b.len - a.len);
        for (const item of words) seen.add(item.k);
        cats.push({
            c: cat.c,
            excludes: (cat.excludes || []).map(x => x.toLowerCase()),
            words
        });
    }
    const custom = [];
    for (const word of menuValue('menu_customBlockKeywords') || []) {
        if (!word) continue;
        const k = String(word).toLowerCase();
        if (seen.has(k)) continue;
        custom.push(k);
    }
    const toPairs = map => Object.keys(map).map(k => ({ k: k.toLowerCase(), w: map[k] }));
    noiseIndex = {
        cats,
        custom,
        emotion: toPairs(lex.emotion),
        controversy: (lex.controversy || []).map(x => String(x).toLowerCase()),
        clickbait: (lex.clickbait || []).map(x => String(x).toLowerCase()),
        value: toPairs(lex.value)
    };
    return noiseIndex;
}

function scoreText(raw) {
    if (!raw) return { final: 0, K: 0, C: 0, E: 0, S: 0, B: 0, V: 0 };
    const text = String(raw).toLowerCase();
    const idx = compileNoiseIndex();
    let kRaw = 0;
    let bestC = 0;

    for (const cat of idx.cats) {
        let longHits = 0;
        let catW = 0;
        for (const item of cat.words) {
            if (item.len < 2) continue;
            if (text.includes(item.k)) {
                longHits += 1;
                catW += item.w;
            }
        }
        if (longHits) {
            for (const item of cat.words) {
                if (item.len >= 2) continue;
                if (text.includes(item.k)) catW += item.w * 0.35;
            }
            let c = cat.c;
            if (cat.excludes.some(ex => text.includes(ex))) c *= 0.35;
            if (c > bestC) bestC = c;
            kRaw += catW;
        }
    }

    for (const word of idx.custom) {
        if (text.includes(word)) kRaw += 8;
    }

    const K = 100 * (1 - Math.exp(-kRaw / 20));

    let eSum = 0;
    for (const item of idx.emotion) {
        if (text.includes(item.k)) eSum += item.w;
    }
    const E = Math.min(25, eSum);

    let sCount = 0;
    for (const word of idx.controversy) {
        if (text.includes(word)) sCount += 1;
    }
    const S = Math.min(30, 6 * sCount);

    let bCount = 0;
    for (const word of idx.clickbait) {
        if (text.includes(word)) bCount += 1;
    }
    const B = Math.min(25, bCount * 5);

    let V = 0;
    for (const item of idx.value) {
        if (text.includes(item.k)) V += item.w;
    }
    V = Math.min(50, V);

    if (kRaw === 0 && E + B >= 16) bestC = Math.max(bestC, 42);

    const noise = NOISE_WEIGHTS.k * K + NOISE_WEIGHTS.c * bestC + NOISE_WEIGHTS.e * E + NOISE_WEIGHTS.s * S + NOISE_WEIGHTS.b * B;
    const final = Math.max(0, Math.min(100, noise - NOISE_WEIGHTS.v * V));
    return { final, K, C: bestC, E, S, B, V };
}

function injectNoiseStyles() {
    injectStyle('zhihu-plus-noise', `
        .zhihu-plus-noise-hide {display: none !important;}
        .zhihu-plus-noise-demote {opacity: .42; filter: grayscale(.28); transition: opacity .2s;}
        .zhihu-plus-noise-demote:hover {opacity: .8; filter: none;}
        .zhihu-plus-noise-tag {position:absolute;top:8px;right:8px;z-index:2;padding:2px 8px;border-radius:999px;background:rgba(29,29,31,.08);color:#888;font-size:11px;pointer-events:none;}
        [data-theme="dark"] .zhihu-plus-noise-tag {background:rgba(255,255,255,.08);color:#9aa4b2;}
    `);
}

function cardNoiseText(card, titleCss) {
    let title = '';
    if (titleCss) {
        const el = card.querySelector(titleCss);
        if (el) title = el.content || el.textContent || '';
    }
    if (!title) {
        const fallback = card.querySelector('h2.ContentItem-title, h2.HotItem-title, .ContentItem-title, a[data-za-detail-view-id]');
        if (fallback) title = fallback.content || fallback.textContent || '';
    }
    const bodyEl = card.querySelector('.RichContent-inner, .ContentItem-excerpt, .HotItem-excerpt, .RichText.ztext');
    const body = bodyEl ? String(bodyEl.textContent || '').slice(0, 280) : '';
    return { title: title.trim(), body };
}

function applyNoiseToCard(card, titleCss) {
    if (!card || card.dataset.zhihuPlusNoise) return;
    const { title, body } = cardNoiseText(card, titleCss);
    if (!title && !body) return;
    const titleScore = scoreText(title);
    const bodyScore = scoreText(body);
    const final = Math.max(titleScore.final, titleScore.final * 0.72 + bodyScore.final * 0.28);
    card.dataset.zhihuPlusNoise = String(Math.round(final));
    if (final >= NOISE_HIDE) {
        card.classList.add('zhihu-plus-noise-hide');
        card.hidden = true;
        card.style.display = 'none';
        return;
    }
    if (final >= NOISE_DEMOTE) {
        card.classList.add('zhihu-plus-noise-demote');
        if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
        if (!card.querySelector('.zhihu-plus-noise-tag')) {
            const tag = document.createElement('div');
            tag.className = 'zhihu-plus-noise-tag';
            tag.textContent = `噪音 ${Math.round(final)}`;
            card.insertAdjacentElement('afterbegin', tag);
        }
    }
}

function blockKeywords(type) {
    if (!menuValue('menu_blockKeywords')) return;
    noiseIndex = null;
    injectNoiseStyles();

    switch (type) {
        case 'index':
            blockKeywordsFeed('.Card.TopstoryItem.TopstoryItem-isRecommend', 'Card TopstoryItem TopstoryItem-isRecommend');
            break;
        case 'topic':
            blockKeywordsFeed('.List-item.TopicFeedItem', 'List-item TopicFeedItem');
            break;
        case 'people':
            blockKeywordsFeed('.List-item', 'List-item');
            break;
        case 'collection':
            blockKeywordsFeed('.Card.CollectionDetailPageItem', 'Card CollectionDetailPageItem');
            break;
        case 'search':
            blockKeywordsSearch();
            break;
        case 'comment':
            blockKeywordsComment();
            break;
    }
}

function blockKeywordsFeed(selector, className) {
    const scan = () => {
        if (location.pathname === '/hot') {
            document.querySelectorAll('.HotItem').forEach(item => applyNoiseToCard(item, 'h2.HotItem-title'));
        } else {
            document.querySelectorAll(selector).forEach(item => {
                applyNoiseToCard(item, 'h2.ContentItem-title meta[itemprop="name"], meta[itemprop="headline"]');
            });
        }
    };
    scan();
    window.addEventListener('urlchange', () => setTimeout(scan, 1000));
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.className === className) {
                applyNoiseToCard(target, 'h2.ContentItem-title meta[itemprop="name"], meta[itemprop="headline"]');
            }
        });
    });
}

function blockKeywordsSearch() {
    const scan = () => {
        if (!location.search.includes('type=content')) return;
        document.querySelectorAll('.HotLanding-contentItem, .Card.SearchResult-Card[data-za-detail-view-path-module="AnswerItem"], .Card.SearchResult-Card[data-za-detail-view-path-module="PostItem"]').forEach(item => {
            applyNoiseToCard(item, 'a[data-za-detail-view-id]');
        });
    };
    setTimeout(scan, 2000);
    window.addEventListener('urlchange', () => setTimeout(scan, 1000));
    observeTree(mutations => {
        if (!location.search.includes('type=content')) return;
        forAddedElements(mutations, target => {
            if (target.tagName === 'DIV' && target.className === '') {
                const tt = target.querySelector('div[class="Card SearchResult-Card"][data-za-detail-view-path-module="AnswerItem"], div[class="Card SearchResult-Card"][data-za-detail-view-path-module="PostItem"]');
                if (tt) applyNoiseToCard(target.childNodes[0], 'a[data-za-detail-view-id]');
            }
        });
    });
}

function blockKeywordsComment() {
    const filterComment = comment => {
        const content = comment.querySelector('.RichText');
        if (!content || content.dataset.zhihuPlusNoise) return;
        const score = scoreText(content.textContent || '');
        content.dataset.zhihuPlusNoise = String(Math.round(score.final));
        if (score.final >= NOISE_HIDE) {
            content.textContent = '[该评论已降噪]';
        } else if (score.final >= NOISE_DEMOTE) {
            content.style.opacity = '0.45';
        }
    };
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            target.querySelectorAll('.CommentItemV2-metaSibling').forEach(filterComment);
        });
    });
}

/* -------------------------------------------------------------------------- */
/* 屏蔽类别 / 盐选 / 热榜                                                     */
/* -------------------------------------------------------------------------- */

function blockType(type) {
    let name;
    if (type === 'search') {
        if (!menuValue('menu_blockTypeVideo') && !menuValue('menu_blockTypeArticle') && !menuValue('menu_blockTypePin') && !menuValue('menu_blockTypeTopic') && !menuValue('menu_blockTypeSearch')) return;
        if (menuValue('menu_blockTypeSearch') && location.pathname === '/search') {
            setTimeout(() => document.querySelectorAll('.RelevantQuery').forEach(r => { r.parentElement.parentElement.hidden = true; }), 2000);
        }
        name = 'h2.ContentItem-title a:not(.zhihu_e_toQuestion), a.KfeCollection-PcCollegeCard-link, h2.SearchTopicHeader-Title a';
        onReadyNodes(name, blockTypeNode);
    } else if (type === 'question') {
        if (!menuValue('menu_blockTypeVideo')) return;
        injectStyle('zhihu-plus-hide-video-answer', `.VideoAnswerPlayer, .VideoAnswerPlayer video, .VideoAnswerPlayer-video, .VideoAnswerPlayer-iframe {display: none !important;}`);
        name = '.VideoAnswerPlayer';
        document.querySelectorAll(name).forEach(blockTypeNode);
    } else {
        if (!menuValue('menu_blockTypeVideo') && !menuValue('menu_blockTypeArticle') && !menuValue('menu_blockTypePin')) return;
        if (menuValue('menu_blockTypeVideo')) {
            injectStyle('zhihu-plus-hide-index-video', `.Card .ZVideoItem-video, .VideoAnswerPlayer video, nav.TopstoryTabs > a[aria-controls="Topstory-zvideo"] {display: none !important;}`);
        }
        name = menuValue('menu_blockTypePin')
            ? 'h2.ContentItem-title a:not(.zhihu_e_toQuestion), .ContentItem.PinItem'
            : 'h2.ContentItem-title a:not(.zhihu_e_toQuestion)';
        document.querySelectorAll(name).forEach(blockTypeNode);
    }

    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.className === 'Card SearchResult-Card' && target.dataset.zaDetailViewPathModule === undefined) {
                if (menuValue('menu_blockTypeSearch') && location.pathname === '/search' && location.search.includes('type=content')) {
                    target.hidden = true;
                }
            } else {
                blockTypeNode(target.querySelector(name));
            }
        });
    });

    window.addEventListener('urlchange', () => {
        onReadyNodes(name, blockTypeNode);
        if (menuValue('menu_blockTypeSearch') && location.pathname === '/search' && location.search.includes('type=content')) {
            setTimeout(() => document.querySelectorAll('.RelevantQuery').forEach(r => { r.parentElement.parentElement.hidden = true; }), 1500);
        }
    });
}

function blockTypeNode(titleA) {
    if (!titleA) return;
    if (location.pathname === '/search') {
        if (!location.search.includes('type=content')) return;
        const href = titleA.href || '';
        if (href.includes('/zvideo/') || href.includes('video.zhihu.com')) {
            if (menuValue('menu_blockTypeVideo')) {
                const card = findParentElement(titleA, 'Card');
                if (card) card.remove();
            }
        } else if (href.includes('zhuanlan.zhihu.com')) {
            if (menuValue('menu_blockTypeArticle')) {
                const card = findParentElement(titleA, 'Card SearchResult-Card');
                if (card) card.hidden = true;
            }
        } else if (href.includes('/topic/')) {
            if (menuValue('menu_blockTypeTopic')) {
                const card = findParentElement(titleA, 'Card SearchResult-Card');
                if (card) card.hidden = true;
            }
        } else if (href.includes('/market/')) {
            if (menuValue('menu_blockTypeSearch')) {
                const card = findParentElement(titleA, 'Card SearchResult-Card');
                if (card) card.hidden = true;
            }
        }
        return;
    }

    if (location.pathname.includes('/question/')) {
        if (menuValue('menu_blockTypeVideo')) {
            const item = findParentElement(titleA, 'List-item');
            if (item) item.hidden = true;
        }
        return;
    }

    if (titleA.className === 'ContentItem PinItem') {
        if (menuValue('menu_blockTypePin')) {
            const card = findParentElement(titleA, 'Card TopstoryItem TopstoryItem-isRecommend');
            if (card) card.hidden = true;
        }
        return;
    }

    const href = titleA.href || '';
    if (href.includes('/zvideo/') || href.includes('video.zhihu.com') || href.includes('/education/video-course/')) {
        if (menuValue('menu_blockTypeVideo')) {
            const card = findParentElement(titleA, 'Card TopstoryItem TopstoryItem-isRecommend');
            if (card) card.hidden = true;
        }
    } else if (href.includes('/answer/')) {
        const answer = findParentElement(titleA, 'ContentItem AnswerItem');
        if (answer && answer.querySelector('.VideoAnswerPlayer') && menuValue('menu_blockTypeVideo')) {
            const card = findParentElement(titleA, 'Card TopstoryItem TopstoryItem-isRecommend');
            if (card) card.hidden = true;
            answer.remove();
        }
    } else if (href.includes('zhuanlan.zhihu.com')) {
        if (menuValue('menu_blockTypeArticle')) {
            const card = findParentElement(titleA, 'Card TopstoryItem TopstoryItem-isRecommend');
            if (card) card.hidden = true;
        }
    }
}

function blockYanXuan() {
    if (!menuValue('menu_blockYanXuan')) return;
    const isYanXuan = item => item.querySelector('.KfeCollection-AnswerTopCard-Container, .KfeCollection-PurchaseBtn');
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (page().isAnswer) {
                target.querySelectorAll('.List-item, .Card.AnswerCard').forEach(item => {
                    if (isYanXuan(item)) item.hidden = true;
                });
            } else if (target.className === 'List-item' || target.className === 'Card AnswerCard') {
                if (isYanXuan(target)) target.hidden = true;
            }
        });
    });
    document.querySelectorAll('.List-item, .Card.AnswerCard').forEach(item => {
        if (isYanXuan(item)) item.hidden = true;
    });
}

function blockHotOther() {
    if (!menuValue('menu_blockTypeLiveHot')) return;
    const isQuestionItem = hotItem => {
        const linkItem = hotItem.querySelector('.HotItem-content a');
        return !!(linkItem && /\/question\/\d+/.test(linkItem.href));
    };
    const block = () => {
        document.querySelectorAll('.HotList-list .HotItem').forEach(item => {
            if (!isQuestionItem(item)) item.remove();
        });
        document.querySelectorAll('.HotList-list .HotItem:not([hidden])').forEach((item, index) => {
            const rank = item.querySelector('.HotItem-index .HotItem-rank');
            if (rank) rank.innerText = index + 1;
        });
    };
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.classList && target.classList.contains('HotItem')) block();
        });
    });
    block();
}

/* -------------------------------------------------------------------------- */
/* 界面增强                                                                   */
/* -------------------------------------------------------------------------- */

function fullWidthLayout() {
    if (!menuValue('menu_fullWidth')) return;
    injectStyle('zhihu-plus-full-width', `
        .RightSideBar,
        .Question-sideColumn,
        .SearchSideBar,
        .ContentLayout-sideColumn {
            display: none !important;
        }

        :root {
            --right-sidebar-width: 0px !important;
            --container-gap: 0px !important;
            --container-main-column-width: var(--container-width, 1000px) !important;
        }

        .Topstory-container,
        .Question-main,
        .Search-container,
        .ContentLayout {
            width: 100% !important;
            max-width: none !important;
            justify-content: center !important;
        }

        .ListShortcut,
        .Topstory-mainColumn,
        .Topstory-mainColumnCard,
        #TopstoryContent,
        .Topstory-recommend,
        .Question-mainColumn,
        .SearchMain,
        .ContentLayout-mainColumn {
            width: var(--container-width, 1000px) !important;
            max-width: var(--container-width, 1000px) !important;
            flex: 0 1 var(--container-width, 1000px) !important;
            margin-left: auto !important;
            margin-right: auto !important;
        }
    `);
}

function lowProfileMode() {
    if (!menuValue('menu_lowProfile')) return;
    injectStyle('zhihu-plus-low-profile', `
        a { color: #888 !important; }
        a:hover { color: #999 !important; }

        .Button--primary,
        .Button--blue {
            background: #ddd !important;
            border-color: #ddd !important;
            color: #666 !important;
        }

        button.VoteButton {
            background: transparent !important;
            border: none !important;
            color: #888 !important;
            padding: 0 4px !important;
            box-shadow: none !important;
        }
        button.VoteButton:hover { color: #999 !important; }
        button.VoteButton svg { display: none !important; }

        .ContentItem-more {
            background: transparent !important;
            border: none !important;
            color: #888 !important;
            padding: 0 !important;
        }
        .ContentItem-more:hover { color: #999 !important; }
        .ContentItem-more svg { display: none !important; }

        .FollowButton {
            background: transparent !important;
            border: none !important;
            color: #888 !important;
        }

        .zhihu_e_toQuestion {
            color: #888 !important;
            text-decoration: none !important;
        }

        .ContentItem-action { color: #888 !important; }
        .ContentItem-action:hover { color: #999 !important; }

        .TopstoryTabs-link.is-active { color: #666 !important; }

        .Badge,
        span[class*="Badge"] {
            display: none !important;
        }

        a[class*="blue"],
        button[class*="blue"] {
            color: #888 !important;
        }

        .Button { box-shadow: none !important; }
    `);
    bindEmptySearchPlaceholder();
}

function bindEmptySearchPlaceholder() {
    const nodes = document.querySelectorAll('.SearchBar-input > input, input#Popover1-toggle');
    nodes.forEach(el => {
        if (el.dataset.zhihuPlusPlaceholderBound) return;
        el.dataset.zhihuPlusPlaceholderBound = '1';
        el.placeholder = '';
        new MutationObserver(() => {
            if (el.placeholder !== '') el.placeholder = '';
        }).observe(el, { attributes: true, attributeFilter: ['placeholder'] });
    });
}

function removeHighlightLink() {
    const replaceLink = el => {
        if (el.parentElement) el.parentElement.replaceWith(el.textContent);
    };
    observeTree(mutations => {
        forAddedElements(mutations, target => {
            if (target.tagName !== 'A') return;
            if (target.dataset.zaNotTrackLink && target.href.includes('https://www.zhihu.com/search?q=')) replaceLink(target);
        });
    });
    document.querySelectorAll('span > a[data-za-not-track-link][href^="https://www.zhihu.com/search?q="]').forEach(replaceLink);
}

function addTypeTips() {
    if (!menuValue('menu_typeTips')) return;
    const margin = location.pathname === '/search' ? '2' : '4';
    const style = `font-weight: bold;font-size: 13px;padding: 1px 4px 0;border-radius: 2px;display: inline-block;vertical-align: top;margin: ${margin}px 4px 0 0;`;
    injectStyle('zhihu-plus-type-tips', `/* 区分问题文章 */
.AnswerItem .ContentItem-title a:not(.zhihu_e_toQuestion)::before {content:'问题';color: #f68b83;background-color: #f68b8333;${style}}
.TopstoryQuestionAskItem .ContentItem-title a:not(.zhihu_e_toQuestion)::before {content:'问题';color: #ff5a4e;background-color: #ff5a4e33;${style}}
.ZVideoItem .ContentItem-title a::before, .ZvideoItem .ContentItem-title a::before {content:'视频';color: #00BCD4;background-color: #00BCD433;${style}}
.PinItem .ContentItem-title a::before {content:'想法';color: #4CAF50;background-color: #4CAF5033;${style}}
.ArticleItem .ContentItem-title a::before {content:'文章';color: #2196F3;background-color: #2196F333;${style}}`);
}

function addToQuestion() {
    if (!menuValue('menu_toQuestion')) return;
    const css = location.pathname === '/search'
        ? `a.zhihu_e_toQuestion {font-size: 13px !important;font-weight: normal !important;padding: 1px 6px 0 !important;border-radius: 2px !important;display: inline-block !important;vertical-align: top !important;height: 20.67px !important;line-height: 20.67px !important;margin-top: 2px !important;}`
        : `a.zhihu_e_toQuestion {font-size: 13px !important;font-weight: normal !important;padding: 1px 6px 0 !important;border-radius: 2px !important;display: inline-block !important;vertical-align: top !important;margin-top: 4px !important;}`;
    injectStyle('zhihu-plus-to-question', css);

    const decorate = titleA => {
        if (!titleA || titleA.parentElement.querySelector('a.zhihu_e_toQuestion')) return;
        if (titleA.textContent.includes('?')) titleA.innerHTML = titleA.innerHTML.replace('?', '？');
        if (!/answer\/\d+/.test(titleA.href)) return;
        const meta = titleA.parentElement.querySelector('meta[itemprop="url"]');
        if (!meta) return;
        titleA.insertAdjacentHTML('afterend', `<a class="zhihu_e_toQuestion VoteButton" href="${meta.content}" target="_blank">直达问题</a>`);
    };

    if (location.pathname === '/search') onReadyNodes('h2.ContentItem-title a:not(.zhihu_e_tips)', decorate);
    else document.querySelectorAll('h2.ContentItem-title a:not(.zhihu_e_tips)').forEach(decorate);

    observeTree(mutations => {
        forAddedElements(mutations, target => decorate(target.querySelector('h2.ContentItem-title a:not(.zhihu_e_tips)')));
    });
    window.addEventListener('urlchange', () => onReadyNodes('h2.ContentItem-title a:not(.zhihu_e_tips)', decorate));
}

function questionRichTextMore() {
    if (!menuValue('menu_questionRichTextMore')) return;
    const button = document.querySelector('button.QuestionRichText-more');
    if (button) button.click();
}

function removeLogin() {
    const removeLoginModal = mutations => {
        forAddedElements(mutations, target => {
            if (target.querySelector('.signFlowModal')) {
                const button = target.querySelector('.Button.Modal-closeButton.Button--plain');
                if (button) button.click();
            } else if (getXpath('//button[text()="立即登录/注册"]', target)) {
                target.remove();
            }
        });
    };

    const loggedIn = page().isZhuanlan
        ? document.querySelector('.ColumnPageHeader-profile>.AppHeader-menu')
        : document.querySelector('.AppHeader-profile>.AppHeader-menu');
    if (loggedIn) return;

    observeTree(removeLoginModal);
    if (!page().isZhuanlan) {
        injectStyle('zhihu-plus-hide-login', '.Question-mainColumnLogin, button.AppHeader-login {display: none !important;}');
    }
    const loginBtn = getXpath('//button[text()="登录/注册"]');
    if (loginBtn) loginBtn.outerHTML = '<a class="Button AppHeader-login Button--blue" href="https://www.zhihu.com/signin" target="_blank">登录/注册</a>';
}

function cleanTitles() {
    if (!menuValue('menu_cleanTitles')) return;
    if (menuValue('menu_blankTitleFavicon')) return;
    const elTitle = document.head.querySelector('title');
    if (!elTitle) return;
    const original = elTitle.textContent;
    new MutationObserver(() => {
        if (elTitle.textContent !== original) elTitle.textContent = original;
    }).observe(elTitle, { childList: true });
}

function blankTitleAndFavicon() {
    if (!menuValue('menu_blankTitleFavicon')) return;

    const BLANK_ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'/>";
    const ICON_ID = 'zhihu-plus-blank-favicon';
    let applying = false;

    try {
        const proto = Document.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, 'title');
        if (desc && desc.configurable !== false) {
            Object.defineProperty(proto, 'title', {
                configurable: true,
                enumerable: desc.enumerable,
                get() { return ''; },
                set() {}
            });
        }
    } catch (e) { /* sandbox 下改不了原型时，后面用 DOM 观察兜底 */ }

    function apply() {
        if (applying) return;
        applying = true;
        try {
            const titleEl = document.head && document.head.querySelector('title');
            if (titleEl && titleEl.textContent !== '') titleEl.textContent = '';
            if (!document.head) return;

            document.head.querySelectorAll('link[rel*="icon"]').forEach(el => {
                if (el.id !== ICON_ID) el.remove();
            });
            if (!document.getElementById(ICON_ID)) {
                const icon = document.createElement('link');
                icon.id = ICON_ID;
                icon.rel = 'icon';
                icon.href = BLANK_ICON;
                document.head.appendChild(icon);
            }
        } finally {
            applying = false;
        }
    }

    function startObserve() {
        if (!document.head) return false;
        new MutationObserver(apply).observe(document.head, {
            childList: true,
            subtree: true,
            characterData: true
        });
        apply();
        return true;
    }

    apply();
    if (startObserve()) return;

    const waitHead = new MutationObserver(() => {
        if (startObserve()) waitHead.disconnect();
    });
    waitHead.observe(document.documentElement, { childList: true });
}

function cleanSearch() {
    if (!menuValue('menu_cleanSearch')) return;
    bindEmptySearchPlaceholder();
    injectStyle('zhihu-plus-clean-search', '.AutoComplete-group > .SearchBar-label:not(.SearchBar-label--history), .AutoComplete-group > [id^="AutoComplete2-topSearch-"], .AutoComplete-group > [id^="AutoComplete3-topSearch-"] {display: none !important;}');
}

function questionAuthor() {
    if (document.querySelector('.BrandQuestionSymbol, .QuestionAuthor')) return;
    const boot = document.querySelector('#js-initialData');
    const topics = document.querySelector('.QuestionHeader-topics');
    if (!boot || !topics) return;
    try {
        const id = /\d+/.exec(location.pathname)[0];
        const qJson = JSON.parse(boot.textContent).initialState.entities.questions[id].author;
        topics.insertAdjacentHTML('beforebegin', `<div class="BrandQuestionSymbol"><a class="BrandQuestionSymbol-brandLink" href="/people/${qJson.urlToken}"><img role="presentation" src="${qJson.avatarUrl}" class="BrandQuestionSymbol-logo" alt=""><span class="BrandQuestionSymbol-name">${qJson.name}</span></a><div class="BrandQuestionSymbol-divider" style="margin-left: 5px;margin-right: 10px;"></div></div>`);
    } catch (e) { /* 页面结构变化时忽略 */ }
}

function topTime(css, classs) {
    document.querySelectorAll(css).forEach(_this => {
        const t = _this.querySelector('.ContentItem-time');
        if (!t || t.classList.contains('full') || !t.querySelector('span') || t.querySelector('span').textContent == null) return;
        topTimeAllTime(t);
        topTimePublishTop(t, _this, classs);
    });
}

function topTimePost() {
    const t = document.querySelector('.ContentItem-time:not(.xiu-time)');
    if (!t) return;
    if (t.textContent.includes('编辑于') && !t.classList.contains('xiu-time')) {
        const tt = t.textContent;
        t.click();
        t.textContent = t.textContent + ' ，' + tt;
        t.classList.add('xiu-time');
    }
    if (menuValue('menu_publishTop') && !document.querySelector('.Post-Header > .ContentItem-time') && !document.querySelector('.ContentItem-meta > .ContentItem-time')) {
        const temp = t.cloneNode(true);
        temp.style.padding = '0px';
        const header = document.querySelector('.Post-Header');
        if (header) header.insertAdjacentElement('beforeEnd', temp);
    }
}

function topTimeAllTime(t) {
    const span = t.querySelector('span');
    if (t.textContent.includes('发布于') && !t.textContent.includes('编辑于')) {
        span.textContent = span.dataset.tooltip;
        t.classList.add('full');
    } else if (!t.textContent.includes('发布于') && t.textContent.includes('编辑于')) {
        span.textContent = span.dataset.tooltip + ' ，' + span.textContent;
        t.classList.add('full');
    }
}

function topTimePublishTop(t, _this, _class) {
    if (!menuValue('menu_publishTop')) return;
    if (t.parentNode.classList.contains(_class)) return;
    const temp = t.cloneNode(true);
    temp.style.padding = '0px';
    if (_this.offsetHeight < 600) t.style.display = 'none';
    const host = _this.querySelector('.' + _class);
    if (host) host.insertAdjacentElement('beforeEnd', temp);
}

function questionTime() {
    if (document.querySelector('.QuestionPage .QuestionHeader-side .QuestionTime-xiu')) return;
    const side = document.querySelector('.QuestionPage .QuestionHeader-side');
    const created = document.querySelector('.QuestionPage > meta[itemprop=dateCreated]');
    const modified = document.querySelector('.QuestionPage > meta[itemprop=dateModified]');
    if (!side || !created || !modified) return;
    side.insertAdjacentHTML('beforeEnd', `<div class="QuestionTime-xiu" style="color: #9098ac; margin-top: 5px; font-size: 13px; font-style: italic;"><p>创建时间：${getUTC8(new Date(created.content))}</p><p>最后编辑：${getUTC8(new Date(modified.content))}</p></div>`);
}

function questionInvitation() {
    const time = setInterval(() => {
        const q = document.querySelector('.QuestionInvitation-content');
        if (!q) return;
        clearInterval(time);
        q.style.display = 'none';
        const title = document.querySelector('.QuestionInvitation-title');
        if (title) title.innerHTML = title.innerText + '<span style="cursor: pointer; font-size: 14px; color: #919aae;"> 展开/折叠</span>';
        const bar = document.querySelector('.Topbar');
        if (bar) {
            bar.onclick = function () {
                const box = document.querySelector('.QuestionInvitation-content');
                if (box) box.style.display = box.style.display === 'none' ? '' : 'none';
            };
        }
    }, 200);
    setTimeout(() => clearInterval(time), 8000);
}

function directLink(root = document) {
    root.querySelectorAll('a.external[href*="link.zhihu.com/?target="], a.LinkCard[href*="link.zhihu.com/?target="]:not(.MCNLinkCard):not(.ZVideoLinkCard):not(.ADLinkCardContainer)').forEach(a => {
        a.href = decodeURIComponent(a.href.substring(a.href.indexOf('link.zhihu.com/?target=') + 23));
    });
}

function originalPic(root = document) {
    root.querySelectorAll('img[data-original]:not(.comment_sticker):not(.Avatar)').forEach(img => {
        if (img.src !== img.dataset.original) img.src = img.dataset.original;
    });
}

/* 原图 + 直链：用节流观察器替代 100ms 轮询 */
function enhanceMediaAndLinks() {
    originalPic();
    directLink();
    let pending = false;
    observeTree(mutations => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            forAddedElements(mutations, target => {
                originalPic(target);
                directLink(target);
                if (target.matches && target.matches('img[data-original]:not(.comment_sticker):not(.Avatar)') && target.src !== target.dataset.original) {
                    target.src = target.dataset.original;
                }
            });
        });
    });
}

function watchTopTime(css, classs) {
    topTime(css, classs);
    let pending = false;
    observeTree(() => {
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
            pending = false;
            topTime(css, classs);
        });
    });
}

/* -------------------------------------------------------------------------- */
/* 路由                                                                       */
/* -------------------------------------------------------------------------- */

registerMenuCommand();

(function boot() {
    if (window.onurlchange === undefined) addUrlChangeEvent();

    window.addEventListener('urlchange', () => {
        const p = page();
        if (p.isQuestion && !p.isQuestionWaiting && !p.isAnswer) {
            setTimeout(() => {
                collapsedNowAnswer('.QuestionPage');
                collapsedNowAnswer('.Question-main');
                questionRichTextMore();
                blockUsers('question');
                blockYanXuan();
            }, 300);
        } else if (p.isHome) {
            setTimeout(() => {
                blockUsers('index');
                blockKeywords('index');
                blockType();
            }, 500);
        } else if (p.isHot) {
            setTimeout(() => {
                blockKeywords('index');
                blockHotOther();
            }, 500);
        }
    });

    fullWidthLayout();
    lowProfileMode();
    blankTitleAndFavicon();
    removeLogin();
    cleanTitles();

    const handler = GM_info.scriptHandler;
    const version = parseFloat(String(GM_info.version || '').slice(0, 4));
    if (handler === 'Violentmonkey' || (handler === 'Tampermonkey' && version >= 4.18)) {
        setTimeout(start, 300);
    } else {
        start();
    }
})();

function start() {
    const p = page();
    if (menuValue('menu_lowProfile') || menuValue('menu_cleanSearch')) bindEmptySearchPlaceholder();
    removeHighlightLink();
    enhanceMediaAndLinks();
    if (!p.isZhuanlan) {
        if (!p.isColumn) cleanSearch();
        collapsedAnswer();
    }
    closeFloatingComments();
    blockKeywords('comment');

    if (p.isQuestion) {
        if (!p.isQuestionWaiting) {
            collapsedNowAnswer('.QuestionPage');
            collapsedNowAnswer('.Question-main');
            questionRichTextMore();
            blockUsers('question');
            blockYanXuan();
            blockType('question');
            defaultCollapsedAnswer();
        }
        watchTopTime('.ContentItem.AnswerItem', 'ContentItem-meta');
        setTimeout(() => { questionTime(); questionAuthor(); }, 100);
        questionInvitation();
        return;
    }

    if (p.isSearch) {
        collapsedNowAnswer('main div');
        collapsedNowAnswer('.Search-container');
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'SearchItem-meta');
        addTypeTips();
        addToQuestion();
        blockUsers('search');
        blockKeywords('search');
        blockType('search');
        return;
    }

    if (p.isTopic) {
        if (p.pathname.includes('/hot') || p.href.includes('/top-answers')) {
            collapsedNowAnswer('main.App-main');
            watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
            addTypeTips();
            addToQuestion();
            blockUsers('topic');
            blockKeywords('topic');
        }
        return;
    }

    if (p.isZhuanlan) {
        backToTop('article.Post-Main.Post-NormalMain');
        backToTop('div.Post-Sub.Post-NormalSub');
        setTimeout(topTimePost, 300);
        blockUsers();
        return;
    }

    if (p.isColumn) {
        setTimeout(() => {
            collapsedAnswer();
            collapsedNowAnswer('main div');
            watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
            blockUsers();
        }, 300);
        return;
    }

    if (p.isPeople) {
        if (p.pathname.split('/').length === 3) {
            addTypeTips();
            addToQuestion();
        }
        collapsedNowAnswer('main div');
        collapsedNowAnswer('.Profile-main');
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
        blockUsers('people');
        blockKeywords('people');
        return;
    }

    if (p.isCollection) {
        addTypeTips();
        addToQuestion();
        collapsedNowAnswer('main');
        collapsedNowAnswer('.CollectionsDetailPage');
        watchTopTime('.ContentItem.AnswerItem, .ContentItem.ArticleItem', 'ContentItem-meta');
        blockKeywords('collection');
        return;
    }

    injectStyle('zhihu-plus-min-height', '.Topstory-container {min-height: 1500px;}');
    if (menuValue('menu_blockTypeVideo')) {
        injectStyle('zhihu-plus-hide-zvideo-tab', `.Card .ZVideoItem-video, nav.TopstoryTabs > a[aria-controls="Topstory-zvideo"] {display: none !important;}`);
    }
    collapsedNowAnswer('main div');
    collapsedNowAnswer('.Topstory-container');
    watchTopTime('.TopstoryItem', 'ContentItem-meta');
    addTypeTips();
    addToQuestion();
    if (p.isHome) {
        blockUsers('index');
        blockKeywords('index');
        blockType();
    } else if (p.isHot) {
        blockKeywords('index');
        blockHotOther();
    } else {
        blockUsers();
    }
}
