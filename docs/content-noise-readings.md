# 互联网内容噪音屏蔽：精读清单

这份清单谈的是**整张网上的内容噪音**，不是知乎产品文档。
「噪音」在这里指：为抢注意力而优化、信息密度低、情绪或对立收益高的内容——标题党、吃瓜、愤怒循环、种草话术、算法推荐里的低质高互动条目。
平台反垃圾（广告、导流、辱骂）是相邻问题，不是同一件事。

链接尽量给 DOI 和开放 PDF。付费篇会标作者稿或预印本。DOI 打不开时，用落地页。

## 怎么读

先读这 6 篇，再按需要下钻。

1. Belkin & Croft (1992)：信息过滤是什么
2. Chakraborty et al. (2016)：用户端屏蔽长什么样
3. Hutto & Gilbert (2014)：词典 + 规则怎么打出一个连续分
4. Brady, Crockett & Van Bavel (2020)：为什么愤怒和对立会被放大
5. Li, Chhabra & Wojcieszak (2026)：降权为什么往往比替换/一刀切稳
6. El Malki et al. (2026)：按意图重建信息流，而不是只删帖

读一篇时盯三个问题：它把噪音定义成什么、干预发生在哪一侧（平台 / 用户 / 客户端）、动作是警告、降权还是隐藏。

---

## 1. 信息过滤本身

### Belkin, N. J., & Croft, W. B. (1992). Information filtering and information retrieval: Two sides of the same coin? *Communications of the ACM*, 35(12), 29–38.

- DOI: https://doi.org/10.1145/138859.138861
- PDF: https://maroo.cs.umass.edu/getpdf.php?id=131
- 必读。把「从流里丢掉不需要的」和「从库里找出需要的」分开。后续几乎所有 feed 过滤、黑名单、用户画像，都站在这篇的区分上。

### Hutto, C. J., & Gilbert, E. (2014). VADER: A parsimonious rule-based model for sentiment analysis of social media text. *ICWSM*, 8(1), 216–225.

- DOI: https://doi.org/10.1609/icwsm.v8i1.14550
- PDF: http://eegilbert.org/papers/icwsm14.vader.hutto.pdf
- 必读。词典权重 + 否定/程度/饱和规则，再合成一个分数。可解释的本地打分，和机器学习分类器不是一条路。

### Tausczik, Y. R., & Pennebaker, J. W. (2010). The psychological meaning of words: LIWC and computerized text analysis methods. *Journal of Language and Social Psychology*, 29(1), 24–54.

- DOI: https://doi.org/10.1177/0261927X09351676
- 落地页: https://journals.sagepub.com/doi/10.1177/0261927X09351676
- 选读。主题/情绪词表怎么建成、怎么验。分类词库（八卦、对立、种草、价值白名单）的方法论祖先。

---

## 2. 为什么网上会堆噪音

### Simon, H. A. (1971). Designing organizations for an information-rich world. In M. Greenberger (Ed.), *Computers, communications, and the public interest* (pp. 37–72). Johns Hopkins Press.

- 无 DOI（书籍章节）
- PDF（扫描稿，来源不一）: https://muse.jhu.edu/pub/1/monograph/chapter/243241
- 必读观念，不必抠每一页。信息丰富时，稀缺的是注意力。后面整个注意力经济都从这句话长出来。

### Goldhaber, M. H. (1997). The attention economy and the Net. *First Monday*, 2(4).

- DOI: https://doi.org/10.5210/fm.v2i4.519
- PDF/HTML: https://firstmonday.org/ojs/index.php/fm/article/view/519
- 选读。把「抢注意力」写成网络的默认经济，而不是事后才出现的平台病。

### Eppler, M. J., & Mengis, J. (2004). The concept of information overload: A review of literature from organization science, accounting, marketing, MIS, and related disciplines. *The Information Society*, 20(5), 325–344.

- DOI: https://doi.org/10.1080/01972240490507974
- 落地页: https://www.tandfonline.com/doi/abs/10.1080/01972240490507974
- 选读。过载的成因、后果、对策综述。用户为什么会自己做过滤、回避、降权，这里有组织科学的根。

### Crockett, M. J. (2017). Moral outrage in the digital age. *Nature Human Behaviour*, 1(11), 769–771.

- DOI: https://doi.org/10.1038/s41562-017-0213-3
- 落地页: https://www.nature.com/articles/s41562-017-0213-3
- 短评，必读。线上表达愤怒的成本下降，平台又按互动排序，愤怒会变得又密又便宜。

### Brady, W. J., Wills, J. A., Jost, J. T., Tucker, J. A., & Van Bavel, J. J. (2017). Emotion shapes the diffusion of moralized content in social networks. *PNAS*, 114(28), 7313–7318.

- DOI: https://doi.org/10.1073/pnas.1618923114
- PDF: https://www.pnas.org/doi/pdf/10.1073/pnas.1618923114
- PMC: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5514704/
- 必读实证。道德-情绪词每多一个，扩散大约 +20%；而且主要在群体内部传。解释了对立、站队、吃瓜为什么会占领信息流。

### Brady, W. J., Crockett, M. J., & Van Bavel, J. J. (2020). The MAD model of moral contagion: The role of motivation, attention, and design in the spread of moralized content online. *Perspectives on Psychological Science*, 15(4), 978–1010.

- DOI: https://doi.org/10.1177/1745691620917336
- 预印本: https://doi.org/10.31234/osf.io/pz9g6
- PDF（OSF）: https://osf.io/pz9g6
- 必读框架。Motivation（群体身份）× Attention（情绪抓注意）× Design（平台设计）三件事叠在一起，道德化内容才会爆。做屏蔽时，要分清你在挡「内容」还是在挡「放大机制」。

### Brady, W. J., McLoughlin, K., Doan, T. N., & Crockett, M. J. (2021). How social learning amplifies moral outrage expression in online social networks. *Science Advances*, 7(33), eabe5641.

- DOI: https://doi.org/10.1126/sciadv.abe5641
- PDF: https://www.science.org/doi/pdf/10.1126/sciadv.abe5641
- 选读。点赞/转发会强化下一次愤怒表达。噪音不只是「坏标题」，还是被反馈回路训练出来的表达习惯。

### Skovsgaard, M., & Andersen, K. (2020). Conceptualizing news avoidance: Towards a shared understanding of different causes and potential solutions. *Journalism Studies*, 21(4), 459–476.

- DOI: https://doi.org/10.1080/1461670X.2019.1686410
- 落地页: https://www.tandfonline.com/doi/full/10.1080/1461670X.2019.1686410
- 选读。把「主动不看」和「被别的内容挤掉」分开。用户侧屏蔽、降权、清空热搜，都属于有意回避的工具，不是单纯厌世。

---

## 3. 标题党与诱饵检测

标题党是噪音里最好测、论文也最多的一块。注意：英文规则（listicle、you won't believe）不能原样搬到中文。

### Blom, J. N., & Hansen, K. R. (2015). Click bait: Forward-reference as lure in online news headlines. *Journal of Pragmatics*, 76, 87–100.

- DOI: https://doi.org/10.1016/j.pragma.2014.11.010
- 落地页: https://www.sciencedirect.com/science/article/abs/pii/S0378216614002262
- 选读。语言学定义：前指制造信息缺口（「她变成了这样」「内幕是……」），逼你点进去补全。后面几乎所有特征工程都引用这篇。

### Potthast, M., Köpsel, S., Stein, B., & Hagen, M. (2016). Clickbait detection. In *ECIR 2016* (LNCS 9626, pp. 810–817). Springer.

- DOI: https://doi.org/10.1007/978-3-319-30671-1_72
- PDF: https://downloads.webis.de/publications/papers/potthast_2016b.pdf
- 必读。第一份公开 Twitter 标题党语料 + 215 维特征。目标就是给读者一条过滤新闻流的路。

### Chakraborty, A., Paranjape, B., Kakarla, S., & Ganguly, N. (2016). Stop Clickbait: Detecting and preventing clickbaits in online news media. In *ASONAM 2016* (pp. 9–16). IEEE.

- DOI: https://doi.org/10.1109/ASONAM.2016.7752207
- PDF: https://arxiv.org/pdf/1610.09786
- 必读。检测 + Chrome 扩展：警告、按用户选择屏蔽、根据反馈个性化。用户端噪音过滤的产品原型。

### Potthast, M., Gollub, T., Hagen, M., & Stein, B. (2018). The Clickbait Challenge 2017: Towards a regression model for clickbait strength. arXiv:1812.10847.

- DOI: https://doi.org/10.48550/arXiv.1812.10847
- PDF: https://arxiv.org/pdf/1812.10847
- 必读。把「标题党程度」做成连续回归，而不是死二分。和 0–100 噪音分是同一类问题。

### Wiegmann, M., Potthast, M., & Stein, B. (2018). Heuristic feature selection for clickbait detection. In *Clickbait Challenge 2017*.

- 无正式 DOI
- PDF: https://downloads.webis.de/publications/papers/wiegmann_2018.pdf
- 选读。特征一多，对「强度打分」有用的和对「分类」有用的不是同一批。做加权公式时值得看。

### Rony, M. M. U., Hassan, N., & Yousuf, M. (2018). BaitBuster: A clickbait identification framework. *AAAI*, 32(1).

- DOI: https://doi.org/10.1609/aaai.v32i1.11378
- PDF: https://ojs.aaai.org/index.php/AAAI/article/view/11378
- 选读。Facebook 时间线扩展：标标题党、解释命中了哪些语言特征、给正文摘要。强调可解释，不只给一个黑箱标签。

### Liu, T., Yu, K., Wang, L., Zhang, X., Zhou, H., & Wu, X. (2022). Clickbait detection on WeChat: A deep model integrating semantic and syntactic information. *Knowledge-Based Systems*, 243, 108605.

- DOI: https://doi.org/10.1016/j.knosys.2022.108605
- 落地页: https://www.sciencedirect.com/science/article/abs/pii/S0950705122002714
- 选读（中文语料）。微信标题党：中文更靠语义和句法诱饵，清单体、前指可以叠在更短的标题里。不要只搬英文 n-gram。

### Lee, C.-L., Chung, S.-F., & Liu, H.-W. (2019). Investigation of Mandarin clickbait headlines: A case study of *biàn zhèyàng*. In *PACLIC 33* (pp. 442–451).

- 无 DOI（会议论文集）
- PDF: http://jaslli.org/files/proceedings/51_paclic33_postconf.pdf
- 选读。普通话标题党高频落在外貌和明星；手法是前指、预设、情绪词。

### Chang, C.-W., & Huang, C.-H. (2024). Linguistic feature-based clickbait detection in Taiwanese news headlines. In *PACLIC 38*.

- ACL Anthology: https://aclanthology.org/2024.paclic-1.71/
- PDF: https://aclanthology.org/2024.paclic-1.71.pdf
- 选读。繁中标题：前指、清单、悬念词、夸张词；加这些特征后模型上升。可当中文「标题党词」的对照表。

---

## 4. 用户端干预：屏蔽、降权、重做信息流

平台审核慢、不透明、一刀切。用户侧可以自己减曝光，不必等平台改推荐。

### Chakraborty et al. (2016). Stop Clickbait.

见上一节。扩展形态的起点。

### Lyngs, U., Lukoff, K., Slovak, P., Binns, R., Slack, A., Inzlicht, M., Van Kleek, M., & Shadbolt, N. (2019). Self-control in cyberspace: Applying dual systems theory to a review of digital self-control tools. In *CHI 2019*.

- DOI: https://doi.org/10.1145/3290605.3300361
- PDF: https://arxiv.org/pdf/1902.00157
- 必读。扫了 367 个应用/扩展：屏蔽、限时、追踪、奖惩。点击诱饵走的是自下而上的注意通道；客户端过滤是在 System 1 被勾住之前加闸。把「内容噪音过滤」放进数字自制工具谱系。

### Li, L., Chhabra, A., & Wojcieszak, M. (2026). User-side interventions reduce harmful content exposure in algorithmic feeds. *ICWSM*.

- 刊物页: https://ojs.aaai.org/index.php/ICWSM/article/view/42704
- PDF: 同一页提供开放获取全文
- 必读。YouTube 上对比 **Downranking（降权）** 和 Replacement。长期模拟里，降权更稳、累计暴露降得更清楚。设计含义：中等噪音先降权，高分再隐藏，通常比全部删除更耐久。

### El Malki, O., Aubin Le Quéré, M., Monroy-Hernández, A., & Horta Ribeiro, M. (2026). Bonsai: Intentional and personalized social media feeds. In *CHI 2026*.

- DOI: https://doi.org/10.1145/3772318.3791855
- PDF: https://arxiv.org/pdf/2509.10776
- 必读。用户用自然语言声明意图，再经过规划 / 取源 / 策展 / 排序。被试会主动写：去掉 outrage-farming、政治撕、争议、悲伤内容。过滤有效，但策展比刷算法流费力；透明（为什么留下/去掉）是信任条件。

---

## 5. 年鉴与书（不是论文，但好用）

### Reuters Institute. *Digital News Report*（逐年）.

- 站点: https://reutersinstitute.politics.ox.ac.uk/digital-news-report
- 看「news avoidance」专章。全球调查里，躲开让人累、怒、无助的新闻是稳定行为，不是个案。

### Wu, T. (2016). *The Attention Merchants*. Knopf.

- ISBN: 978-0385352017
- 注意力被商品化的史话。不代替论文，用来建立直觉。

---

## 和实现的对应（便于回看）

若你在做本地词库打分 + 保留 / 降权 / 隐藏，可按组件对照：

| 组件 | 最相关阅读 |
| --- | --- |
| 过滤 vs 检索 | Belkin & Croft 1992 |
| 词典权重、规则、饱和 | VADER 2014；LIWC 2010 |
| 连续「噪音强度」而不是二分 | Clickbait Challenge 2017 |
| 标题党语言特征 | Blom & Hansen 2015；Potthast 2016；中文看 Liu 2022、PACLIC |
| 用户端扩展、可解释标记 | Stop Clickbait 2016；BaitBuster 2018 |
| 降权优于一刀切 | Li et al. 2026 |
| 按意图过滤，而不是只删 | Bonsai 2026；Lyngs 2019 |
| 为何情绪/对立占满信息流 | Crockett 2017；Brady et al. 2017 / 2020 / 2021 |
| 知乎关键词屏蔽（无打分） | [XIU2/UserScript](https://github.com/XIU2/UserScript)；[zhihu-custom](https://github.com/liuyubing233/zhihu-custom) |
| 可复用情绪/褒贬词 | [vaderSentiment](https://github.com/cjhutto/vaderSentiment)；[cnsenti](https://github.com/hiDaDeng/cnsenti) / [cntext](https://github.com/hiDaDeng/cntext) |
| 标题党代码与中文例句 | [bhargaviparanjape/clickbait](https://github.com/bhargaviparanjape/clickbait)；[lexmin0412/clickbait](https://github.com/lexmin0412/clickbait) |
| 离线扩词、少样本分类 | [text2vec](https://github.com/shibing624/text2vec)；SetFit 2022 |
| 标题–正文不一致（标题党） | Liu et al. 2022；CA-CD；TTNN / BCCD |
| 浏览器里跑小模型（一般不要进脚本） | [Transformers.js](https://github.com/huggingface/transformers.js) |

刻意没收进清单的：平台反垃圾/反作弊工程博客、假新闻传播（Vosoughi et al. 2018 等）、过滤泡（Pariser）。那些相邻，但优化目标不是「降低注意力噪音」。

---

## 6. GitHub 上能对上的工作

论文之外，仓库里能直接点开的多半是**扁平关键词屏蔽**、**情感词典**、或**标题党数据集**。
带权重、分类、排除词、价值白名单，再打连续分并降权/隐藏的中文注意力噪音词库，目前没看到可替换 `noise_lexicon_v1` 的现成库。
能搬的是方法和候选词，不是整表。

### 知乎客户端过滤（产品近邻）

#### [XIU2/UserScript](https://github.com/XIU2/UserScript)

- 本项目上游。关键词用 `|` 分隔，标题/评论命中即屏蔽。
- 没有分类档、权重、排除词、降权。用户名单是扁平列表，可当「别人在挡什么」的对照，不能当评分词库。

#### [liuyubing233/zhihu-custom](https://github.com/liuyubing233/zhihu-custom)

- 标题词 / 内容词两套名单；过滤后打「不感兴趣」。
- 盐选账号、视频、低赞是规则屏蔽。词表 UI 和「不感兴趣」反馈值得看，同样没有连续分。

#### [liuyubing233/zhihu-custom-mobile](https://github.com/liuyubing233/zhihu-custom-mobile)

- 上一仓库的移动版，功能更窄，仍是规则隐藏。

#### [知乎标题关键词屏蔽](https://greasyfork.org/scripts/574423)（Greasy Fork）

- 只滤问题标题。自称 inspired by 知乎增强。体量很小，说明「关键词一刀切」这条线还在被人反复重写。

### 词典打分（方法近，本体不同）

这些测的是情绪正负或 7 类基本情绪，不是「八卦 / 对立 / 种草 vs 芯片 / 论文」。

#### [cjhutto/vaderSentiment](https://github.com/cjhutto/vaderSentiment)

- 对应上文 Hutto & Gilbert 2014。词带强度，再加否定、程度、饱和。
- 词本身是英文，不能灌进知乎。可对的是计分结构，不是词表。

#### [hiDaDeng/cnsenti](https://github.com/hiDaDeng/cnsenti) → 后续 [hiDaDeng/cntext](https://github.com/hiDaDeng/cntext)

- 默认 HowNet 正负 + 大连理工情感词汇本体（好/乐/哀/怒/惧/恶/惊，带强度）。
- 适合补 `NOISE_EMOTION`，补不了「塌房 / 普信 / 种草」。
- 大连理工本体约 2.7 万词；发表论文要注意他们的使用协议。简介见 [计算传播学笔记](https://chengjun.github.io/mybook/11-2-emotion-dict.html)。

#### NTUSD / 清华褒贬义 / HowNet 合集

- 各类 `SentimentAnalysisDictionary` 镜像，例如 [zerahuang/SentimentAnalysisDictionary](https://github.com/zerahuang/SentimentAnalysisDictionary)。
- 同样是褒贬，不是主题噪音。

若要从开源词库扩本项目：优先抽「惊 / 怒 / 恶」和夸张程度词去喂情绪、标题党；分类词仍需本地维护。

### 标题党代码、语料、拦截列表

#### [bhargaviparanjape/clickbait](https://github.com/bhargaviparanjape/clickbait)

- Stop Clickbait（ASONAM 2016）的代码和英文标题语料，含 hyperbolic word / n-gram。
- 扩展形态和这边最像，语言不对。

#### Webis Clickbait Challenge

- 数据入口：[webis.de/data](https://webis.de/data.html)、[Webis-Clickbait-22](https://webis.de/data/webis-clickbait-22.html)
- 代码归档：[mam10eks/clickbait-spoiling-archive](https://github.com/mam10eks/clickbait-spoiling-archive)
- 英文 Twitter / Facebook 标注，以及后来的「剧透标题党」任务。可对连续强度，不可对中文词。

#### [lexmin0412/clickbait](https://github.com/lexmin0412/clickbait)

- 中文标题党例句收集（主要来自掘金）。
- 能给 `NOISE_CLICKBAIT` 提供候选，不是带权重的词库。

#### [cpeterso/clickbait-blocklist](https://github.com/cpeterso/clickbait-blocklist)

- uBlock 规则，按站点/选择器挡标题党版位，不按文本打分。

#### [rahulkapoor90/This-is-Clickbait](https://github.com/rahulkapoor90/This-is-Clickbait)

- Chrome 扩展，标 Facebook 帖是否标题党。用户端干预，词表/模型是英文。

#### [pietervanheijningen/clickbait-remover-for-youtube](https://github.com/pietervanheijningen/clickbait-remover-for-youtube)

- 改 YouTube 缩略图和标题，走视觉诱饵，不是主题词库。

### 和 `noise_lexicon_v1` 的差距

| | 常见 GitHub 项目 | 本仓库 |
| --- | --- | --- |
| 单位 | 词命中 → 删 | 多特征加权 → 0–100 分 |
| 词表 | 用户自填扁平名单，或情感正负 | L1/L2/L3 主题 + 排除词 + 价值白名单 |
| 动作 | 隐藏 / 不感兴趣 | 保留 / 降权 / 隐藏 |
| 语言 | 英文标题党，或中文褒贬 | 中文注意力噪音（塌房、普信、种草、盐选） |

---

## 7. 深度学习：能用什么、不该塞进脚本的是什么

本项目是油猴脚本，声明**无远程外部脚本**，分数还必须能解释。
深度学习更适合做**离线扩词、标定权重、少样本残差**，不适合把 BERT 塞进页面替换现有公式。

对实现的含义：词库继续当主模型；深度模型只在仓库工具链或可选本地头上帮忙。

### 少样本：用隐藏/保留样本学一个残差

#### Tunstall, L., Reimers, N., Jo, U. E. S., Bates, L., Korat, D., Wasserblat, M., & Pereg, O. (2022). Efficient few-shot learning without prompts. arXiv:2209.11055.

- DOI: https://doi.org/10.48550/arXiv.2209.11055
- PDF: https://arxiv.org/pdf/2209.11055
- 代码: https://github.com/huggingface/setfit
- 每类大约 8 条标注就能训一个句向量分类头。用户在试算面板或复查托盘里标「这不该藏 / 这是噪音」，离线 SetFit 学 keep/demote/hide，运行时只加一个残差，词库分仍可见。

### 中文句向量：离线扩词，不进页面

#### [shibing624/text2vec](https://github.com/shibing624/text2vec)

- 中文句向量 / 词向量，默认 [text2vec-base-chinese](https://huggingface.co/shibing624/text2vec-base-chinese)。
- 用法：对现有分类词找近邻，生成「待审候选」（塌房 → 塌了、吃瓜群众），人工进词库。不要自动把近邻写进线上表，否则误伤会扩散。

#### [Xenova/text2vec-base-chinese-sentence](https://huggingface.co/Xenova/text2vec-base-chinese-sentence)

- 上一模型的 ONNX，给 [Transformers.js](https://github.com/huggingface/transformers.js) 用。
- 能在浏览器算相似度，但要下模型，和「无远程脚本」冲突；若做，只能整包进扩展，不该进当前 user.js。

#### [chatopera/Synonyms](https://github.com/chatopera/Synonyms)

- 基于词向量的中文近义词。MacBERT 预训练也用它找相似词。扩 `NOISE_CLICKBAIT` / 情绪词比扩主题名人名更安全。

### 中文预训练：标题党、标题–正文不一致

现有公式用 `max(标题分, 0.72×标题 + 0.28×摘要)`，没有「标题很吵、正文很淡」这一项。下面几篇都说明：中文标题党经常要看标题和正文是否对得上。

#### Cui, Y., Che, W., Liu, T., Qin, B., & Yang, Z. (2021). Pre-training with whole word masking for Chinese BERT. *IEEE/ACM TASLP*.

- DOI: https://doi.org/10.1109/TASLP.2021.3124365
- PDF: https://ymcui.com/pdf/chinese-bert-wwm.pdf
- 代码: https://github.com/ymcui/Chinese-BERT-wwm
- 同组 [MacBERT](https://github.com/ymcui/MacBERT)。离线微调「噪音 / 非噪音」或「标题党」的底座，不进脚本。

#### Liu, T., Yu, K., Wang, L., Zhang, X., Zhou, H., & Wu, X. (2022). Clickbait detection on WeChat.

见第 3 节。语义 + 句法图。提醒：中文诱饵叠在短标题里，只靠 `includes` 会漏结构型标题党。

#### Zheng, J., Yu, K., & Wu, X. (2021). A deep model based on lure and similarity for adaptive clickbait detection. *Knowledge-Based Systems*, 214, 106714.

- DOI: https://doi.org/10.1016/j.knosys.2020.106714
- 标题诱饵 + 标题–正文相似度。可先做成规则特征，不必上 BERT：标题分高、摘要分低、重叠词少 → 加 B。

#### Chen, Y., et al. CA-CD: context-aware clickbait detection using new Chinese clickbait dataset with transfer learning.

- 落地页: https://www.emerald.com/dta/article/doi/10.1108/DTA-09-2022-0371
- 标题和正文一起训。数据集比纯标题列表更接近信息流卡片。

#### Liu, T., et al. (2022). Clickbait analysis and detection method on Chinese social media (TTNN / BCCD). In *BigCom 2022*.

- DOI: https://doi.org/10.1109/BigCom57025.2022.00049
- 中文新闻标题党约 7000 条；BERT+CNN。可当离线评测集，检验词库漏了哪些句式。

### 浏览器推理（对照，默认不做）

#### [huggingface/transformers.js](https://github.com/huggingface/transformers.js)

- 浏览器 ONNX。和「无远程外部脚本、可解释分数」两条约束打架。
- 若以后做独立扩展，可以当可选「语义模式」：词库分 + 本地小模型残差。不要替换 K/C/E/S/B/V。

最后更新：2026-09-10。
