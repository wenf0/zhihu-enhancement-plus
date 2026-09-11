import type { MenuItem } from './types';

export const DEFAULT_BLOCK_USERS = [
  '故事档案局', '盐选推荐', '盐选科普', '盐选成长计划', '知乎盐选会员', '知乎盐选创作者',
  '盐选心理', '盐选健康必修课', '盐选奇妙物语', '盐选生活馆', '盐选职场', '盐选文学甄选',
  '盐选作者小管家', '盐选博物馆', '盐选点金', '盐选测评室', '盐选科技前沿', '盐选会员精品',
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
  { key: 'menu_questionRichTextMore', label: '展开问题描述', tip: '进入问题页时自动点开「显示全部」，完整展示题干。', def: true },
  { key: 'menu_autoExpandShort', label: '短内容自动展开', tip: '摘要截断后若全文约 ≤450 字且不太高，自动展开；长文会收回。', def: true },
  { key: 'menu_publishTop', label: '置顶显示时间', tip: '把发布/编辑时间提到标题附近，不用滚到底才看到。', def: true },
  { key: 'menu_typeTips', label: '区分问题文章', tip: '信息流标题旁加「问题 / 文章 / 视频 / 想法」圆角标签。', def: true },
  { key: 'menu_toQuestion', label: '直达问题按钮', tip: '回答标题旁加圆角按钮，直接打开对应问题页，而不是该回答。', def: true },

  { key: 'menu_blockUsers', label: '屏蔽指定用户', tip: '隐藏黑名单用户的回答、文章和评论。可在下方编辑名单。', def: true },
  { key: 'menu_customBlockUsers', label: '编辑屏蔽用户', tip: '自定义屏蔽用户', def: DEFAULT_BLOCK_USERS, kind: 'users' },
  { key: 'menu_noiseScore', label: '噪音评分', tip: '给信息流打噪音分。过滤和显示得分都要先开这项。', def: true },
  { key: 'menu_blockKeywords', label: '噪音过滤', tip: '只打分不处理信息流；仅降权会变淡；隐藏会移出信息流并可复查。', def: 'off', kind: 'filter' },
  { key: 'menu_noiseBadge', label: '显示噪音得分', tip: '每条内容显示模型分，0 分不标。', def: true },
  { key: 'menu_noiseTaste', label: '喜欢 / 不感兴趣', tip: '对卡片分词后对照词库，回写权重；多次出现的新实词也会学进去。', def: true },
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
  { key: 'menu_blockTypeVideo', label: '视频', tip: '隐藏首页推荐、搜索结果、问题页里的视频卡片与视频回答；首页顶栏「视频」入口一并藏掉。', def: true, kind: 'hidden' },
  { key: 'menu_blockTypeArticle', label: '文章', tip: '隐藏首页推荐和搜索结果里链到专栏文章（zhuanlan）的卡片。', def: true, kind: 'hidden' },
  { key: 'menu_blockTypePin', label: '想法', tip: '隐藏首页推荐信息流里的「想法」短动态，不影响回答与文章。', def: false, kind: 'hidden' },
  { key: 'menu_blockTypeTopic', label: '话题', tip: '在搜索「综合/内容」结果里隐藏话题卡片，减少跳进话题页的入口。', def: false, kind: 'hidden' },
  { key: 'menu_blockTypeSearch', label: '搜索商业与相关推荐', tip: '在搜索页隐藏杂志/盐选等市场类卡片，以及底部「相关搜索」推荐条。', def: true, kind: 'hidden' },
  { key: 'menu_blockYanXuan', label: '盐选回答', tip: '在问题页隐藏带盐选购买栏或盐选顶栏的付费回答。', def: true, kind: 'hidden' },
  { key: 'menu_blockTypeLiveHot', label: '热榜非问题', tip: '在热榜只保留指向问题的条目；文章、直播、广告等其它热点会移除并重排序号。', def: true, kind: 'hidden' },
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
  'menu_autoExpandShort',
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
