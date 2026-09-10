// @ts-nocheck
import { getSavedLexicon, saveLexicon as persistLexicon } from '../storage';
import { runtime } from '../content/state';
import { noiseWords } from './jieba';
import { normalizeLexicon } from '../lexicon-io';

export const NOISE_CATEGORIES = [
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

export const NOISE_EMOTION = Object.assign(
    noiseWords(8, ['炸锅', '破防', '气炸', '怒斥', '炮轰', '细思极恐', '全网炸锅', '网友炸锅']),
    noiseWords(6, ['震惊', '离谱', '炸裂', '怒了', '痛批', '质问', '笑死', '绷不住', '全网热议'])
);
export const NOISE_CONTROVERSY = ['争议', '冲突', '对立', '矛盾', '互骂', '开战', '站队', '分成两派', '支持反对'];
export const NOISE_CLICKBAIT = ['震惊', '真相', '内幕', '竟然', '居然', '背后', '你绝对想不到', '千万不要', '不转不是', '看完沉默', '太可怕', '建议所有人'];
export const NOISE_VALUE = Object.assign(
    noiseWords(10, ['ai', '人工智能', '芯片', '半导体', 'dram', 'hbm', 'gpu', 'cpu', '量子计算', '开源', 'linux', '数据库', '云计算', '网络安全']),
    noiseWords(8, ['编程', '软件', '算法', '论文', '科研', '实验', '工程', '供应链', '产业链', '财报', '宏观经济', '货币政策', '美联储', '长鑫科技']),
    noiseWords(6, ['技术', '科学', '医学', '学术', '利率', '公司业绩'])
);

export function cloneWords(map) {
    return Object.assign(Object.create(null), map || {});
}

export function defaultLexicon() {
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
    return normalizeLexicon({
        cats,
        emotion: cloneWords(NOISE_EMOTION),
        controversy: NOISE_CONTROVERSY.slice(),
        clickbait: NOISE_CLICKBAIT.slice(),
        value: cloneWords(NOISE_VALUE)
    });
}

/** storage 有完整词库则用之；否则内置默认。不做旧版 touched 增量合并。 */
export function getActiveLexicon() {
    const saved = getSavedLexicon();
    if (saved && typeof saved === 'object') {
        const normalized = normalizeLexicon(saved);
        if (normalized && Object.keys(normalized.cats).length) return normalized;
    }
    return defaultLexicon();
}

export async function saveLexicon(data) {
    runtime.noiseIndex = null;
    const normalized = normalizeLexicon(data) || defaultLexicon();
    await persistLexicon(normalized);
}
