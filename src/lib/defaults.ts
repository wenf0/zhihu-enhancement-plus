import type { MenuItem } from './types';

export const DEFAULT_BLOCK_USERS = [
  '故事档案局', '盐选推荐', '盐选科普', '盐选成长计划', '知乎盐选会员', '知乎盐选创作者',
  '盐选心理', '盐选健康必修课', '盐选奇妙物语', '盐选生活馆', '盐选职场', '盐选文学甄选',
  '盐选作者小管家', '盐选博物馆', '盐选点金', '盐选测评室', '盐选科技前沿', '盐选会员精品',
];

export const DEFAULT_BLOCK_KEYWORDS = [
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
  '今日俄罗斯',
];

export const MENU_ITEMS: MenuItem[] = [
  { key: 'menu_lowProfile', label: '低饱和模式', tip: '把链接、按钮、关注等改成灰调，页面更素、少抢眼。', def: true },
  { key: 'menu_fullWidth', label: '隐藏右侧栏', tip: '去掉推荐关注、相关问题等侧栏，主栏居中加宽。', def: true },
  { key: 'menu_blankTitleFavicon', label: '清空标题和图标', tip: '浏览器标签页标题和图标变空白，减少切页干扰。开启后「净化标题消息」不再生效。', def: true },
  { key: 'menu_cleanTitles', label: '净化标题消息', tip: '锁住当前页标题，去掉「(1 条消息)」一类红点提醒。清空标题开启时此项无效。', def: false },
  { key: 'menu_cleanSearch', label: '净化搜索热门', tip: '去掉搜索框里的热搜占位词和下拉热榜，输入框保持空白。', def: false },

  { key: 'menu_defaultCollapsedAnswer', label: '默认收起回答', tip: '打开问题页时回答先收起，只留摘要，减少一屏信息量。', def: true },
  { key: 'menu_collapsedAnswer', label: '一键收起全部', tip: '右下角加按钮，一次收起当前页所有展开的回答和评论。', def: true },
  { key: 'menu_collapsedNowAnswer', label: '点击两侧收起', tip: '点击页面左右空白区域，收起当前展开的回答或评论。', def: true },
  { key: 'menu_backToTop', label: '右键两侧回顶', tip: '在页面左右空白处点右键，快速滚回顶部。', def: true },
  { key: 'menu_questionRichTextMore', label: '展开问题描述', tip: '进入问题页时自动点开「显示全部」，完整展示题干。', def: false },
  { key: 'menu_publishTop', label: '置顶显示时间', tip: '把发布/编辑时间提到标题附近，不用滚到底才看到。', def: true },
  { key: 'menu_typeTips', label: '区分问题文章', tip: '信息流标题前加「问题 / 文章 / 视频 / 想法」标签。', def: true },
  { key: 'menu_toQuestion', label: '直达问题按钮', tip: '回答卡片旁加按钮，直接打开对应问题页，而不是该回答。', def: true },

  { key: 'menu_blockUsers', label: '屏蔽指定用户', tip: '隐藏黑名单用户的回答、文章和评论。可在下方编辑名单。', def: true },
  { key: 'menu_customBlockUsers', label: '编辑屏蔽用户', tip: '自定义屏蔽用户', def: DEFAULT_BLOCK_USERS, kind: 'users' },
  { key: 'menu_noiseScore', label: '噪音评分', tip: '给信息流打噪音分。过滤和显示得分都要先开这项。', def: true },
  { key: 'menu_blockKeywords', label: '噪音过滤', tip: '关闭只打分；仅降权会变淡；隐藏会移出信息流并可复查。', def: 'hide', kind: 'filter' },
  { key: 'menu_noiseBadge', label: '显示噪音得分', tip: '每条内容显示模型分，0 分不标。规则隐藏不改这个数字。', def: true },
  { key: 'menu_noiseTaste', label: '喜欢 / 不感兴趣', tip: '对卡片分词后对照词库，回写权重；多次出现的新实词也会学进去。', def: true },
  { key: 'menu_customBlockKeywords', label: '编辑屏蔽关键词', tip: '每条词可开关，并设隐藏 / 降权 / 加权。预置词默认开着。', def: DEFAULT_BLOCK_KEYWORDS, kind: 'keywords' },
  {
    key: 'menu_noiseLevel',
    label: '噪音过滤档位',
    tip: '勾选启用该档分类。L1 最狠，L3 最轻。',
    def: '',
    kind: 'group',
    children: ['menu_noiseL1', 'menu_noiseL2', 'menu_noiseL3'],
  },
  { key: 'menu_noiseL1', label: 'L1 强过滤（八卦 / 对立 / 婚恋 / 吃瓜）', tip: 'L1 强过滤', def: true, kind: 'hidden' },
  { key: 'menu_noiseL2', label: 'L2 中强（二次元 / 消费 / 汽车 / 体育）', tip: 'L2 中强过滤', def: true, kind: 'hidden' },
  { key: 'menu_noiseL3', label: 'L3 低强（国际 / A股 / 社会比较）', tip: 'L3 低强过滤', def: false, kind: 'hidden' },
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
      'menu_blockTypeLiveHot',
    ],
  },
  { key: 'menu_blockTypeVideo', label: '视频（首页 / 搜索 / 问题）', tip: '视频（首页、搜索页、问题页）', def: true, kind: 'hidden' },
  { key: 'menu_blockTypeArticle', label: '文章（首页 / 搜索）', tip: '文章（首页、搜索页）', def: false, kind: 'hidden' },
  { key: 'menu_blockTypePin', label: '想法（首页）', tip: '想法（首页）', def: false, kind: 'hidden' },
  { key: 'menu_blockTypeTopic', label: '话题（搜索）', tip: '话题（搜索页）', def: false, kind: 'hidden' },
  { key: 'menu_blockTypeSearch', label: '杂志 / 盐选 / 相关搜索（搜索）', tip: '相关搜索、杂志、盐选等（搜索页）', def: false, kind: 'hidden' },
  { key: 'menu_blockYanXuan', label: '盐选内容（问题）', tip: '盐选内容（问题页）', def: false, kind: 'hidden' },
  { key: 'menu_blockTypeLiveHot', label: '热榜杂项（文章 / 直播 / 广告）', tip: '热榜文章、直播、广告等 [热榜]', def: true, kind: 'hidden' },
];

export const APPEARANCE_KEYS = [
  'menu_lowProfile',
  'menu_fullWidth',
  'menu_blankTitleFavicon',
  'menu_cleanTitles',
  'menu_cleanSearch',
];

export const READING_KEYS = [
  'menu_defaultCollapsedAnswer',
  'menu_collapsedAnswer',
  'menu_collapsedNowAnswer',
  'menu_backToTop',
  'menu_questionRichTextMore',
  'menu_publishTop',
  'menu_typeTips',
  'menu_toQuestion',
];

export const FILTER_TOGGLE_KEYS = [
  'menu_blockUsers',
  'menu_noiseScore',
  'menu_noiseBadge',
  'menu_noiseTaste',
];

export const NOISE_LEVEL_KEYS = ['menu_noiseL1', 'menu_noiseL2', 'menu_noiseL3'];

export const BLOCK_TYPE_KEYS = [
  'menu_blockTypeVideo',
  'menu_blockTypeArticle',
  'menu_blockTypePin',
  'menu_blockTypeTopic',
  'menu_blockTypeSearch',
  'menu_blockYanXuan',
  'menu_blockTypeLiveHot',
];

export const QUICK_TOGGLE_KEYS = [
  'menu_lowProfile',
  'menu_fullWidth',
  'menu_blankTitleFavicon',
  'menu_noiseScore',
  'menu_noiseBadge',
  'menu_noiseTaste',
];
