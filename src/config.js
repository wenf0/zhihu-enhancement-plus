'use strict';

/**
 * 基于 XIU2「知乎增强」2.2.15 的本地优化版。
 * 主要改动：配置对象化、统一路由、合并高频轮询为节流观察器、修正 observer 循环里误用 return 等问题。
 * 噪音评分用 jieba-wasm 2.4.0（jieba-rs WASM）整词匹配；词典经 @resource / GM_xmlhttpRequest 加载。
 * 源码在 src/，改完后执行 `node scripts/pack.mjs` 生成根目录的 zhihu-enhancement-plus.user.js。
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
    { key: 'menu_noiseScore',          label: '噪音评分',             tip: '给信息流打噪音分。过滤和显示得分都要先开这项。', def: true },
    { key: 'menu_blockKeywords',       label: '噪音过滤',             tip: '关闭只打分；仅降权会变淡；隐藏会移出信息流并可复查。', def: 'hide', kind: 'filter' },
    { key: 'menu_noiseBadge',          label: '显示噪音得分',         tip: '每条内容显示模型分，0 分不标。规则隐藏不改这个数字。', def: true },
    { key: 'menu_noiseTaste',          label: '喜欢 / 不感兴趣',       tip: '对卡片分词后对照词库，回写权重；多次出现的新实词也会学进去。', def: true },
    { key: 'menu_customBlockKeywords', label: '编辑屏蔽关键词',       tip: '每条词可开关，并设隐藏 / 降权 / 加权。预置词默认开着。', def: DEFAULT_BLOCK_KEYWORDS, kind: 'keywords' },
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
let noiseIndex = null;
let tasteCache = null;
let noiseRescan = null;
let noiseTasteGen = 1;

/* GM_setValue 跟脚本安装 ID 绑定，卸载重装会丢。再备份到知乎域名 localStorage。 */
const SETTINGS_BACKUP_KEY = 'zhihu-enhancement-plus:settings:v1';
const SETTINGS_GM_FLAG = 'zhihu_plus_persist_v1';
const SETTINGS_KIND = 'zhihu-enhancement-plus-settings';
const LEXICON_KEY = 'noise_lexicon_v1';
const TASTE_KEY = 'noise_taste_v1';
const USERS_OFF_KEY = 'menu_customBlockUsersOff';
const KEYWORDS_OFF_KEY = 'menu_customBlockKeywordsOff';
const KEYWORDS_LEVEL_KEY = 'menu_customBlockKeywordsLevel';
const KEYWORDS_LEVELS_KEY = 'menu_customBlockKeywordsLevels';
const CUSTOM_LEVEL_IDS = ['hide', 'demote', 'weight'];
const CUSTOM_LEVEL_LABELS = { hide: '隐藏', demote: '降权', weight: '加权' };
const SETTINGS_EXTRA_KEYS = ['menu_kw_pack_v1', LEXICON_KEY, TASTE_KEY, USERS_OFF_KEY, KEYWORDS_OFF_KEY, KEYWORDS_LEVEL_KEY, KEYWORDS_LEVELS_KEY];

function pageLocalStorage() {
    try {
        return window.localStorage;
    } catch (err) {
        return null;
    }
}

function readSettingsBackup() {
    const ls = pageLocalStorage();
    if (!ls) return null;
    try {
        const data = JSON.parse(ls.getItem(SETTINGS_BACKUP_KEY) || '');
        return data && data.values && typeof data.values === 'object' ? data.values : null;
    } catch (err) {
        return null;
    }
}

function settingsKnownKeys() {
    const keys = new Set(SETTINGS_EXTRA_KEYS);
    for (const item of MENU_ITEMS) keys.add(item.key);
    return keys;
}

function plainJson(value) {
    return JSON.parse(JSON.stringify(value));
}

function snapshotLexicon() {
    try {
        return plainJson(getActiveLexicon());
    } catch (err) {
        const saved = GM_getValue(LEXICON_KEY);
        return saved != null ? plainJson(saved) : null;
    }
}

function normalizeImportedLexicon(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    const touched = new Set(value.touched || []);
    if (value.cats && typeof value.cats === 'object') {
        for (const id of Object.keys(value.cats)) touched.add('cat:' + id);
    }
    if (value.emotion) touched.add('emotion');
    if (value.controversy) touched.add('controversy');
    if (value.clickbait) touched.add('clickbait');
    if (value.value) touched.add('value');
    return Object.assign({}, value, { touched: [...touched] });
}

function snapshotSettings() {
    const values = {};
    for (const item of MENU_ITEMS) {
        if (item.kind === 'group' || item.kind === 'lexicon') continue;
        values[item.key] = GM_getValue(item.key);
    }
    for (const key of SETTINGS_EXTRA_KEYS) {
        if (key === LEXICON_KEY) continue;
        const value = GM_getValue(key);
        if (value != null) values[key] = value;
    }
    const lexicon = snapshotLexicon();
    if (lexicon) values[LEXICON_KEY] = lexicon;
    const script = scriptVersion();
    return { v: 1, kind: SETTINGS_KIND, script, t: Date.now(), values };
}

function scriptVersion() {
    return (typeof GM_info !== 'undefined' && GM_info.script && GM_info.script.version) || '';
}

function utf8Bytes(text) {
    try {
        return new TextEncoder().encode(String(text || '')).length;
    } catch (err) {
        return unescape(encodeURIComponent(String(text || ''))).length;
    }
}

function formatBytes(n) {
    const size = Math.max(0, Number(n) || 0);
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) {
        const kb = size / 1024;
        return (kb < 10 ? kb.toFixed(1) : String(Math.round(kb))) + ' KB';
    }
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
}

function settingsJsonBytes(pretty) {
    const json = pretty ? JSON.stringify(snapshotSettings(), null, 2) : JSON.stringify(snapshotSettings());
    return utf8Bytes(json);
}

function settingsMetaText() {
    const ver = scriptVersion() || '—';
    const handler = (typeof GM_info !== 'undefined' && GM_info.scriptHandler) || '';
    const size = formatBytes(settingsJsonBytes(false));
    return handler ? `v${ver} · ${handler} · 配置 ${size}` : `v${ver} · 配置 ${size}`;
}

function writeSettingsBackup() {
    const ls = pageLocalStorage();
    if (!ls) return;
    try {
        ls.setItem(SETTINGS_BACKUP_KEY, JSON.stringify(snapshotSettings()));
    } catch (err) { /* 隐私模式或配额 */ }
}

function isValidSettingValue(key, value) {
    if (key === 'menu_kw_pack_v1') return typeof value === 'boolean';
    if (key === LEXICON_KEY) return !!(value && typeof value === 'object' && !Array.isArray(value));
    if (key === TASTE_KEY) {
        return !!(value && typeof value === 'object' && !Array.isArray(value)
            && value.words && typeof value.words === 'object' && !Array.isArray(value.words));
    }
    if (key === USERS_OFF_KEY || key === KEYWORDS_OFF_KEY) {
        return Array.isArray(value) && value.every(x => typeof x === 'string');
    }
    if (key === KEYWORDS_LEVEL_KEY) return CUSTOM_LEVEL_IDS.includes(value);
    if (key === KEYWORDS_LEVELS_KEY) {
        return !!(value && typeof value === 'object' && !Array.isArray(value)
            && Object.values(value).every(x => CUSTOM_LEVEL_IDS.includes(x)));
    }
    const item = MENU_ITEMS.find(x => x.key === key);
    if (!item) return false;
    if (item.kind === 'users') {
        return Array.isArray(value) && value.every(x => typeof x === 'string');
    }
    if (item.kind === 'keywords') {
        return Array.isArray(value) && value.every(x => typeof x === 'string' || (x && typeof x.word === 'string'));
    }
    if (item.kind === 'filter') return value === 'off' || value === 'demote' || value === 'hide' || typeof value === 'boolean';
    if (item.kind === 'group' || item.kind === 'lexicon') return typeof value === 'string';
    return typeof value === 'boolean';
}

function parseSettingsJson(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('format');
    if (data.kind && data.kind !== SETTINGS_KIND) throw new Error('kind');
    if (data.values && typeof data.values === 'object' && !Array.isArray(data.values)) return data.values;
    const known = settingsKnownKeys();
    const values = {};
    for (const key of Object.keys(data)) {
        if (known.has(key)) values[key] = data[key];
    }
    if (!Object.keys(values).length) throw new Error('empty');
    return values;
}

function applyImportedSettings(values) {
    const known = settingsKnownKeys();
    let n = 0;
    for (const [key, value] of Object.entries(values)) {
        if (!known.has(key) || !isValidSettingValue(key, value)) continue;
        const next = key === LEXICON_KEY ? normalizeImportedLexicon(value) : value;
        cache[key] = next;
        GM_setValue(key, next);
        n++;
    }
    if (n) {
        noiseIndex = null;
        tasteCache = null;
        writeSettingsBackup();
    }
    return n;
}

function settingsExportFilename() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `zhihu-enhancement-plus-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`;
}

function downloadJsonFile(filename, text) {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function restoreSettingsIfNeeded() {
    if (GM_getValue(SETTINGS_GM_FLAG)) return;
    const backup = readSettingsBackup();
    if (backup) {
        for (const [key, value] of Object.entries(backup)) {
            if (value === undefined) continue;
            GM_setValue(key, value);
        }
    }
    GM_setValue(SETTINGS_GM_FLAG, true);
}

restoreSettingsIfNeeded();

for (const item of MENU_ITEMS) {
    if (item.key === 'menu_customBlockKeywords' && !GM_getValue('menu_kw_pack_v1')) {
        const current = GM_getValue(item.key);
        if (current == null || (Array.isArray(current) && current.length === 0)) {
            GM_setValue(item.key, DEFAULT_BLOCK_KEYWORDS);
        }
        GM_setValue('menu_kw_pack_v1', true);
    } else if (item.key === 'menu_noiseScore' && GM_getValue(item.key) == null) {
        GM_setValue(item.key, GM_getValue('menu_blockKeywords') !== false);
    } else if (GM_getValue(item.key) == null) {
        GM_setValue(item.key, item.def);
    }
    cache[item.key] = GM_getValue(item.key);
}
writeSettingsBackup();

function menuValue(key) {
    return cache[key];
}

function menuSet(key, value) {
    cache[key] = value;
    GM_setValue(key, value);
    writeSettingsBackup();
}

function listOffKey(storageKey) {
    if (storageKey === 'menu_customBlockUsers') return USERS_OFF_KEY;
    if (storageKey === 'menu_customBlockKeywords') return KEYWORDS_OFF_KEY;
    return '';
}

function isPackedListItem(storageKey, word) {
    if (storageKey === 'menu_customBlockUsers') return DEFAULT_BLOCK_USERS.includes(word);
    if (storageKey === 'menu_customBlockKeywords') {
        const k = String(word).toLowerCase();
        return DEFAULT_BLOCK_KEYWORDS.some(x => x.toLowerCase() === k);
    }
    return false;
}

function readListOff(storageKey) {
    const key = listOffKey(storageKey);
    const raw = key ? GM_getValue(key) : [];
    return new Set(Array.isArray(raw) ? raw : []);
}

function writeListOff(storageKey, off) {
    const key = listOffKey(storageKey);
    if (!key) return;
    GM_setValue(key, [...off]);
    writeSettingsBackup();
}

function normalizeCustomLevel(value) {
    return CUSTOM_LEVEL_IDS.includes(value) ? value : '';
}

function readCustomDefaultLevel() {
    return normalizeCustomLevel(GM_getValue(KEYWORDS_LEVEL_KEY)) || 'hide';
}

function writeCustomDefaultLevel(level) {
    GM_setValue(KEYWORDS_LEVEL_KEY, normalizeCustomLevel(level) || 'hide');
    writeSettingsBackup();
    noiseIndex = null;
}

function readCustomLevelMap() {
    const raw = GM_getValue(KEYWORDS_LEVELS_KEY);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out = {};
    for (const [word, level] of Object.entries(raw)) {
        const lv = normalizeCustomLevel(level);
        if (word && lv) out[word] = lv;
    }
    return out;
}

function writeCustomLevelMap(map) {
    GM_setValue(KEYWORDS_LEVELS_KEY, map && typeof map === 'object' ? map : {});
    writeSettingsBackup();
    noiseIndex = null;
}

function customLevelFor(word, fallback) {
    const map = readCustomLevelMap();
    if (map[word]) return map[word];
    const low = String(word || '').toLowerCase();
    for (const [key, level] of Object.entries(map)) {
        if (key.toLowerCase() === low) return level;
    }
    return fallback || readCustomDefaultLevel();
}

function dropCustomLevel(map, word) {
    delete map[word];
    const low = String(word || '').toLowerCase();
    for (const key of Object.keys(map)) {
        if (key.toLowerCase() === low) delete map[key];
    }
    return map;
}

function readFilterMode() {
    const value = menuValue('menu_blockKeywords');
    if (value === 'off' || value === 'demote' || value === 'hide') return value;
    if (value === false) return 'off';
    return 'hide';
}

function defaultKeywordLevel(word, fallback) {
    if (String(word || '').length < 2) return 'weight';
    return normalizeCustomLevel(fallback) || readCustomDefaultLevel();
}

function normalizeKeywordList(raw) {
    const fallback = readCustomDefaultLevel();
    const off = readListOff('menu_customBlockKeywords');
    const list = Array.isArray(raw) ? raw : [];
    const out = [];
    const seen = new Set();
    for (const item of list) {
        let word = '';
        let on = true;
        let level = '';
        if (typeof item === 'string') {
            word = item;
            on = !off.has(word);
            level = customLevelFor(word, defaultKeywordLevel(word, fallback));
        } else if (item && typeof item.word === 'string') {
            word = item.word;
            on = item.on !== false;
            level = normalizeCustomLevel(item.level) || defaultKeywordLevel(word, fallback);
        }
        const key = word.toLowerCase();
        if (!word || seen.has(key)) continue;
        seen.add(key);
        out.push({ word, on, level: CUSTOM_LEVEL_IDS.includes(level) ? level : defaultKeywordLevel(word, fallback) });
    }
    return out;
}

function readKeywordEntries() {
    return normalizeKeywordList(menuValue('menu_customBlockKeywords'));
}

function writeKeywordEntries(list) {
    menuSet('menu_customBlockKeywords', normalizeKeywordList(list));
    noiseIndex = null;
}

function activeKeywordEntries() {
    return readKeywordEntries().filter(item => item.on && item.word);
}

function hydrateNoiseSettings() {
    const keywords = normalizeKeywordList(GM_getValue('menu_customBlockKeywords'));
    cache.menu_customBlockKeywords = keywords;
    GM_setValue('menu_customBlockKeywords', keywords);
    const filter = GM_getValue('menu_blockKeywords');
    const mode = filter === 'off' || filter === 'demote' || filter === 'hide'
        ? filter
        : filter === false ? 'off' : 'hide';
    cache.menu_blockKeywords = mode;
    GM_setValue('menu_blockKeywords', mode);
    writeSettingsBackup();
}

hydrateNoiseSettings();

function activeListValues(storageKey) {
    const off = readListOff(storageKey);
    return (menuValue(storageKey) || []).filter(word => word && !off.has(word));
}
