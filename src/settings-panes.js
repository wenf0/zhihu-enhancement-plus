/* -------------------------------------------------------------------------- */
/* 菜单                                                                       */
/* -------------------------------------------------------------------------- */

function registerMenuCommand() {
    for (const id of menuCommandIds) GM_unregisterMenuCommand(id);
    menuCommandIds.length = 0;
    for (const item of MENU_ITEMS) {
        cache[item.key] = GM_getValue(item.key);
    }
    menuCommandIds.push(GM_registerMenuCommand('setting', openSettingsPanel));
}

function settingsSwitchRow(key, extra = '') {
    const item = MENU_ITEMS.find(x => x.key === key);
    const on = !!menuValue(key);
    const sub = typeof extra === 'string' && extra.includes('is-sub');
    return `<div data-zplus-row${on ? ' data-on="1"' : ''}${sub ? ' data-sub="1"' : ''} data-key="${key}">
        <div><div class="zhihuE_StName">${escapeHtml(item.label)}</div><div class="zhihuE_StDesc">${escapeHtml(item.tip || '')}</div></div>
        <button type="button" data-zplus-switch${on ? ' data-on="1"' : ''} data-key="${key}" aria-label="${escapeHtml(item.label)}"></button>
    </div>`;
}

function settingsFilterRow() {
    const mode = readFilterMode();
    const opts = [['off', '关闭'], ['demote', '仅降权'], ['hide', '隐藏']];
    return `<div data-zplus-row${mode !== 'off' ? ' data-on="1"' : ''} data-sub="1">
        <div><div class="zhihuE_StName">噪音过滤</div><div class="zhihuE_StDesc">规则和分数分开：隐藏/降权按自定义词执行，分数只表示有多吵。关闭则只打分。</div></div>
        <div class="zhihuE_KwSeg">${opts.map(([id, name]) =>
            `<button type="button" class="zhihuE_KwSegBtn${mode === id ? ' zhihuE_isOn' : ''}" data-filter="${id}">${name}</button>`
        ).join('')}</div>
    </div>`;
}

function settingsToggleCard(item) {
    const on = !!menuValue(item.key);
    const chips = (item.tags || []).map(t => `<span class="zhihuE_LvChip">${escapeHtml(t)}</span>`).join('');
    return `<div data-zplus-card${on ? ' data-on="1"' : ''} data-key="${item.key}">
        <div class="zhihuE_LvCardMain">
            <div class="zhihuE_LvCardTop">
                ${item.tag ? `<span class="zhihuE_LvTag">${escapeHtml(item.tag)}</span>` : ''}
                <span class="zhihuE_LvName">${escapeHtml(item.name)}</span>
                ${item.hint ? `<span class="zhihuE_LvHint">${escapeHtml(item.hint)}</span>` : ''}
            </div>
            ${item.desc ? `<p class="zhihuE_LvDesc">${escapeHtml(item.desc)}</p>` : ''}
            ${chips ? `<div class="zhihuE_LvChips">${chips}</div>` : ''}
        </div>
        <button type="button" data-zplus-switch${on ? ' data-on="1"' : ''} data-key="${item.key}" aria-label="${escapeHtml(item.name)}"></button>
    </div>`;
}

function settingsNoiseCards() {
    return [
        { key: 'menu_noiseL1', tag: 'L1', name: '强过滤', hint: '默认开启', desc: '明星八卦、饭圈、男女对立、婚恋生育、吃瓜爆料。命中后更容易直接隐藏。', tags: ['塌房', '热搜', '饭圈', '男女对立', '催婚'] },
        { key: 'menu_noiseL2', tag: 'L2', name: '中强过滤', hint: '默认开启', desc: '二次元抽卡、消费种草、汽车热点、体育赛事、网红生活。多数会降权，而不是一刀切。', tags: ['抽卡', '种草', '理想汽车', '世界杯', '探店'] },
        { key: 'menu_noiseL3', tag: 'L3', name: '低强过滤', hint: '默认关闭', desc: '国际政治情绪、A股短线、社会比较。信息量往往更高，建议按需打开。', tags: ['俄乌', 'A股', '985', '年薪', '特朗普'] }
    ];
}

function settingsTypeCards() {
    return [
        { key: 'menu_blockTypeVideo', tag: '视频', name: '视频', desc: '首页、搜索页和问题页里的视频卡片、视频回答。', tags: ['首页', '搜索', '问题页'] },
        { key: 'menu_blockTypeArticle', tag: '文章', name: '文章', desc: '信息流里的专栏文章，不影响问题回答。', tags: ['首页', '搜索'] },
        { key: 'menu_blockTypePin', tag: '想法', name: '想法', desc: '首页信息流中的想法/动态。', tags: ['首页'] },
        { key: 'menu_blockTypeTopic', tag: '话题', name: '话题', desc: '搜索结果里的话题卡片。', tags: ['搜索'] },
        { key: 'menu_blockTypeSearch', tag: '盐选', name: '杂志 / 盐选 / 相关搜索', desc: '搜索页里的杂志、盐选专栏和相关搜索。', tags: ['搜索'] },
        { key: 'menu_blockYanXuan', tag: '付费', name: '盐选内容', desc: '问题页里带购买入口的盐选回答。', tags: ['问题页'] },
        { key: 'menu_blockTypeLiveHot', tag: '热榜', name: '热榜杂项', desc: '热榜中的直播、广告和非问题条目，并重排序号。', tags: ['热榜'] }
    ];
}

function settingsNoiseFormulaHtml() {
    const w = NOISE_WEIGHTS;
    const n = x => x.toFixed(2);
    return `<div class="zhihuE_Fx">
        <div class="zhihuE_FxKicker">评分公式</div>
        <div class="zhihuE_FxMain">分数 = clamp(${n(w.k)}K + ${n(w.c)}C + ${n(w.e)}E + ${n(w.s)}S + ${n(w.b)}B − ${n(w.v)}V, 0, 100)</div>
        <div class="zhihuE_FxGrid">
            <div class="zhihuE_FxItem"><b>K</b>关键词饱和<span>K = 100(1 − e<sup>−k/20</sup>)。k 为命中词权重和。自定义词按级别加权：隐藏 +${CUSTOM_LEVELS.hide.k}，降权 +${CUSTOM_LEVELS.demote.k}，加权 +${CUSTOM_LEVELS.weight.k}。隐藏/降权是规则，不改写这个分数。分类单字仅在已有长词命中时计 0.35。词命中走结巴整词；连续词可拼成多字词（如「理想」+「汽车」）。「男」不会命中「男性」。</span></div>
            <div class="zhihuE_FxItem"><b>C</b>分类系数<span>取命中档位的最大 c。该分类有排除词则 ×0.35。无关键词但 E+B ≥ 16 时，C 至少为 42。</span></div>
            <div class="zhihuE_FxItem"><b>E</b>情绪<span>命中情绪词的权重和，上限 25。</span></div>
            <div class="zhihuE_FxItem"><b>S</b>争议<span>6 × 争议词命中数，上限 30。</span></div>
            <div class="zhihuE_FxItem"><b>B</b>标题党<span>5 × 标题党词命中数，上限 25。</span></div>
            <div class="zhihuE_FxItem"><b>V</b>价值<span>白名单权重和，上限 50，从总分里减去。</span></div>
        </div>
        <p class="zhihuE_FxNote">关键词经 jieba-rs 分词后再匹配（顺序切词、相邻拼接、搜索切词）。信息流卡片取 max(标题分, 0.72×标题 + 0.28×摘要)。模型分 ${NOISE_DEMOTE}–${NOISE_HIDE} 降权，${NOISE_HIDE} 及以上隐藏。自定义词的「隐藏 / 降权」作为规则另外执行，分数保持模型分。开启「喜欢 / 不感兴趣」后，分词结果对照词库回写权重；词库外的实词点满 2 次后以小步长进 K 或 V，不改词库原文。</p>
    </div>`;
}

function mountNoiseTestPane(container) {
    container.insertAdjacentHTML('beforeend', `<div class="zhihuE_Ts">
        <p class="zhihuE_StPaneTips">粘贴标题，摘要可选。和信息流同一套公式、当前档位与词库。只填一栏时按标题计分。</p>
        <input class="zhihuE_TsTitle" type="text" placeholder="粘贴或输入标题" />
        <textarea class="zhihuE_TsBody" placeholder="粘贴摘要或正文（可选，信息流只取前 280 字）"></textarea>
        <div class="zhihuE_TsBoard">
            <div class="zhihuE_TsHero">
                <div class="zhihuE_TsScore">—</div>
                <div class="zhihuE_TsVerdict">先粘贴一段内容</div>
            </div>
            <div class="zhihuE_TsSub">标题 — · 摘要 —</div>
            <div class="zhihuE_TsGrid"></div>
            <p class="zhihuE_TsHint"></p>
        </div>
    </div>`);
    const root = container.querySelector('.zhihuE_Ts:last-child');
    const titleEl = root.querySelector('.zhihuE_TsTitle');
    const bodyEl = root.querySelector('.zhihuE_TsBody');
    const scoreEl = root.querySelector('.zhihuE_TsScore');
    const verdictEl = root.querySelector('.zhihuE_TsVerdict');
    const subEl = root.querySelector('.zhihuE_TsSub');
    const gridEl = root.querySelector('.zhihuE_TsGrid');
    const hintEl = root.querySelector('.zhihuE_TsHint');
    const board = root.querySelector('.zhihuE_TsBoard');

    const run = () => {
        noiseIndex = null;
        let title = titleEl.value.trim();
        let body = bodyEl.value.trim();
        if (!title && body) {
            title = body;
            body = '';
        }
        if (!title) {
            scoreEl.textContent = '—';
            verdictEl.textContent = '先粘贴一段内容';
            subEl.textContent = '标题 — · 摘要 —';
            gridEl.innerHTML = '';
            hintEl.textContent = '';
            board.className = 'zhihuE_TsBoard';
            return;
        }
        if (!jiebaReady && !jiebaUnavailable) {
            scoreEl.textContent = '…';
            verdictEl.textContent = '结巴分词加载中';
            hintEl.textContent = '首次会下载 jieba-rs 词典（约 4MB），之后用本地缓存。';
            ensureJieba().then(run);
            return;
        }
        const { final, titleScore, bodyScore, rule } = scoreFeedNoise(title, body);
        const rounded = Math.round(final);
        const verdict = noiseVerdict(final, rule);
        scoreEl.textContent = String(rounded);
        verdictEl.textContent = verdict.name;
        subEl.textContent = `标题 ${Math.round(titleScore.final)} · 摘要 ${body ? Math.round(bodyScore.final) : '—'}`;
        const parts = titleScore;
        gridEl.innerHTML = [
            ['K', '关键词', parts.K],
            ['C', '分类', parts.C],
            ['E', '情绪', parts.E],
            ['S', '争议', parts.S],
            ['B', '标题党', parts.B],
            ['V', '价值', parts.V]
        ].map(([k, name, v]) => `<div class="zhihuE_TsItem"><b>${k}</b>${name}<span>${Math.round(v)}</span></div>`).join('');
        board.className = `zhihuE_TsBoard is-${verdict.id}`;
        const mode = readFilterMode();
        const badgeOn = !!menuValue('menu_noiseBadge');
        if (rule && rule.action === 'hide') {
            hintEl.textContent = mode === 'hide'
                ? '命中隐藏规则，模型分不变。刷新后会移出信息流，可在「已过滤」里复查。'
                : mode === 'demote'
                    ? '命中隐藏规则，当前过滤是仅降权，刷新后只会变淡。'
                    : '命中隐藏规则。过滤已关闭，信息流不处理。';
        } else if (rule && rule.action === 'demote') {
            hintEl.textContent = mode === 'off'
                ? '命中降权规则。过滤已关闭，信息流不处理。'
                : '命中降权规则，模型分不变。刷新后会变淡。';
        } else if (mode !== 'off') {
            hintEl.textContent = '分项来自标题。信息流刷新后才会按此结果隐藏或降权。';
        } else if (badgeOn) {
            hintEl.textContent = '过滤已关闭：信息流会打分并显示角标，但不会隐藏或降权。';
        } else {
            hintEl.textContent = '过滤和角标都已关闭：只按当前词库算分，信息流卡片外观不变。';
        }
    };

    titleEl.addEventListener('input', run);
    bodyEl.addEventListener('input', run);
}

function mountKeywordEditor(container) {
    let list = readKeywordEntries();
    let filter = '';
    let defaultLevel = readCustomDefaultLevel();
    container.insertAdjacentHTML('beforeend', `<div class="zhihuE_ListMount">
        <p class="zhihuE_StPaneTips">预置词默认开着，可关掉。点级别切换隐藏 / 降权 / 加权。隐藏和降权是规则，不改模型分；加权只加分。单字默认加权。匹配走结巴整词，「男」不会命中「男性」。</p>
        <div class="zhihuE_KwBar">
            <span class="zhihuE_KwBarLabel">新词默认</span>
            <div class="zhihuE_KwSeg">${CUSTOM_LEVEL_IDS.map(id =>
                `<button type="button" class="zhihuE_KwSegBtn${id === defaultLevel ? ' zhihuE_isOn' : ''}" data-level="${id}">${CUSTOM_LEVEL_LABELS[id]}</button>`
            ).join('')}</div>
        </div>
        <div class="zhihuE_DlgAdd">
            <input class="zhihuE_DlgInput" type="text" placeholder="例如：广告, 引流, [捂脸]" />
            <button type="button" class="zhihuE_DlgAddBtn">添加</button>
        </div>
        <div class="zhihuE_DlgFilterWrap"><input class="zhihuE_DlgFilter" type="search" placeholder="在已有词条中筛选…" /></div>
        <div class="zhihuE_DlgCloud"></div>
        <div class="zhihuE_DlgFoot">
            <div class="zhihuE_DlgCount">共 <b class="zhihuE_DlgCountNum">0</b> 条 · 启用 <b class="zhihuE_DlgCountOn">0</b> 条</div>
            <div class="zhihuE_DlgFootRight">
                <button type="button" class="zhihuE_DlgCopy zhihuE_DlgImportBtn">粘贴导入</button>
                <button type="button" class="zhihuE_DlgCopy zhihuE_DlgCopyAll">复制全部</button>
            </div>
        </div>
        <div class="zhihuE_DlgImport">
            <textarea class="zhihuE_DlgImportArea" placeholder="粘贴词表，用逗号、换行或 | 分隔。确认后覆盖当前列表并自动去重。预置词仍会保留。"></textarea>
            <div class="zhihuE_DlgImportActions">
                <button type="button" class="zhihuE_DlgCopy zhihuE_DlgImportCancel">取消</button>
                <button type="button" class="zhihuE_DlgCopy is-ok zhihuE_DlgImportOk">确认覆盖导入</button>
            </div>
        </div>
    </div>`);
    const root = container.querySelector('.zhihuE_ListMount:last-child');
    const cloud = root.querySelector('.zhihuE_DlgCloud');
    const input = root.querySelector('.zhihuE_DlgInput');

    const persist = () => {
        writeKeywordEntries(list);
        list = readKeywordEntries();
        render();
    };
    const renderBar = () => {
        root.querySelectorAll('.zhihuE_KwSegBtn').forEach(btn => {
            btn.classList.toggle('zhihuE_isOn', btn.dataset.level === defaultLevel);
        });
    };
    const visible = () => {
        if (!filter) return list.map((item, index) => ({ item, index }));
        const q = filter.toLowerCase();
        return list.map((item, index) => ({ item, index })).filter(row => row.item.word.toLowerCase().includes(q));
    };
    const render = () => {
        root.querySelector('.zhihuE_DlgCountNum').textContent = String(list.length);
        root.querySelector('.zhihuE_DlgCountOn').textContent = String(list.filter(item => item.on).length);
        renderBar();
        const rows = visible();
        if (!list.length) {
            cloud.innerHTML = '<div class="zhihuE_DlgEmpty">还没有词条，在上方添加</div>';
            return;
        }
        if (!rows.length) {
            cloud.innerHTML = '<div class="zhihuE_DlgEmpty">没有匹配的词条</div>';
            return;
        }
        cloud.innerHTML = rows.map(({ item, index }) => {
            const packed = isPackedListItem('menu_customBlockKeywords', item.word);
            const del = packed ? '' : `<button type="button" class="zhihuE_DlgChipDel" data-index="${index}" aria-label="删除">×</button>`;
            return `<span class="zhihuE_DlgChip${packed ? ' is-pack' : ''}${item.on ? '' : ' is-off'}" data-index="${index}">
                <span>${escapeHtml(item.word)}</span>
                <button type="button" class="zhihuE_DlgChipLv is-${item.level}" data-index="${index}">${CUSTOM_LEVEL_LABELS[item.level] || item.level}</button>
                ${del}
            </span>`;
        }).join('');
    };
    const addWords = words => {
        const have = new Set(list.map(item => item.word.toLowerCase()));
        const added = [];
        for (const word of words) {
            const key = word.toLowerCase();
            if (have.has(key)) continue;
            have.add(key);
            added.push({ word, on: true, level: defaultKeywordLevel(word, defaultLevel) });
        }
        if (!added.length) return false;
        list = added.concat(list);
        persist();
        return true;
    };
    root.querySelector('.zhihuE_DlgAddBtn').onclick = () => {
        if (addWords(parseWords(input.value))) input.value = '';
        input.focus();
    };
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            if (addWords(parseWords(input.value))) input.value = '';
        }
    });
    root.querySelector('.zhihuE_KwSeg').addEventListener('click', event => {
        const btn = event.target.closest('.zhihuE_KwSegBtn');
        if (!btn || !CUSTOM_LEVEL_IDS.includes(btn.dataset.level)) return;
        defaultLevel = btn.dataset.level;
        writeCustomDefaultLevel(defaultLevel);
        renderBar();
    });
    root.querySelector('.zhihuE_DlgFilter').addEventListener('input', event => {
        filter = event.target.value.trim();
        render();
    });
    cloud.addEventListener('click', event => {
        const del = event.target.closest('.zhihuE_DlgChipDel');
        if (del) {
            const index = Number(del.dataset.index);
            const item = list[index];
            if (!item || isPackedListItem('menu_customBlockKeywords', item.word)) return;
            list.splice(index, 1);
            persist();
            return;
        }
        const lv = event.target.closest('.zhihuE_DlgChipLv');
        if (lv) {
            const index = Number(lv.dataset.index);
            const item = list[index];
            if (!item) return;
            const current = CUSTOM_LEVEL_IDS.includes(item.level) ? item.level : 'weight';
            item.level = CUSTOM_LEVEL_IDS[(CUSTOM_LEVEL_IDS.indexOf(current) + 1) % CUSTOM_LEVEL_IDS.length];
            persist();
            return;
        }
        const chip = event.target.closest('.zhihuE_DlgChip');
        if (!chip) return;
        const item = list[Number(chip.dataset.index)];
        if (!item) return;
        item.on = !item.on;
        persist();
    });
    const flash = (btn, text) => {
        const raw = btn.textContent;
        btn.textContent = text;
        setTimeout(() => { btn.textContent = raw; }, 1600);
    };
    root.querySelector('.zhihuE_DlgCopyAll').onclick = async () => {
        const text = list.map(item => item.word).join(', ');
        const btn = root.querySelector('.zhihuE_DlgCopyAll');
        try {
            await navigator.clipboard.writeText(text);
            flash(btn, '已复制');
        } catch (err) {
            flash(btn, '复制失败');
        }
    };
    const applyImport = text => {
        const words = uniqueWords(parseWords(text));
        const btn = root.querySelector('.zhihuE_DlgImportBtn');
        if (!words.length) {
            flash(btn, '没有可用词条');
            return false;
        }
        const incoming = new Set(words.map(word => word.toLowerCase()));
        const packed = list.filter(item => isPackedListItem('menu_customBlockKeywords', item.word)).map(item => ({
            ...item,
            on: incoming.has(item.word.toLowerCase())
        }));
        const extras = words
            .filter(word => !isPackedListItem('menu_customBlockKeywords', word))
            .map(word => ({ word, on: true, level: defaultKeywordLevel(word, defaultLevel) }));
        list = packed.concat(extras);
        persist();
        flash(btn, `已导入 ${words.length} 条`);
        return true;
    };
    root.querySelector('.zhihuE_DlgImportBtn').onclick = async () => {
        try {
            const text = navigator.clipboard && navigator.clipboard.readText
                ? (await navigator.clipboard.readText() || '').trim()
                : '';
            if (text) {
                applyImport(text);
                return;
            }
        } catch (err) { /* 改为手动粘贴 */ }
        root.querySelector('.zhihuE_DlgImport').classList.add('is-open');
    };
    root.querySelector('.zhihuE_DlgImportCancel').onclick = () => {
        root.querySelector('.zhihuE_DlgImport').classList.remove('is-open');
    };
    root.querySelector('.zhihuE_DlgImportOk').onclick = () => {
        if (applyImport(root.querySelector('.zhihuE_DlgImportArea').value)) {
            root.querySelector('.zhihuE_DlgImport').classList.remove('is-open');
        }
    };
    render();
}

function mountTastePane(container) {
    const prefs = getTastePrefs();
    const lex = getActiveLexicon();
    const rows = [];
    for (const [word, item] of Object.entries(prefs.words || {})) {
        rows.push({ word, kind: '噪音词', like: item.like || 0, dislike: item.dislike || 0, delta: item.delta || 0 });
    }
    for (const [word, item] of Object.entries(prefs.value || {})) {
        rows.push({ word, kind: '价值词', like: item.like || 0, dislike: item.dislike || 0, delta: item.delta || 0 });
    }
    for (const [id, item] of Object.entries(prefs.cats || {})) {
        const cat = lex.cats && lex.cats[id];
        rows.push({ word: cat ? cat.name : id, kind: '分类', like: item.like || 0, dislike: item.dislike || 0, delta: item.delta || 0 });
    }
    for (const [word, item] of Object.entries(prefs.learned || {})) {
        rows.push({ word, kind: '新词', like: item.like || 0, dislike: item.dislike || 0, delta: item.delta || 0 });
    }
    rows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta) || (b.like + b.dislike) - (a.like + a.dislike));
    const shown = rows.filter(row => row.delta || row.like || row.dislike);
    const sign = n => (n > 0 ? '+' : '') + n;
    container.insertAdjacentHTML('beforeend', `<div class="zhihuE_Taste">
        <p class="zhihuE_StPaneTips">卡片先用结巴分词，再和词库对照。命中的噪音词 / 价值词 / 分类立刻改权重；标题里的词步长 ×1.5。词库外的名词、专名、形容词会记为「新词」，同一词被点满 2 次后才进分数。停用词（的、是、一个）不学。喜欢降低噪音、抬高价值；不感兴趣相反并立刻隐藏该条。再点一次同一按钮可撤销。</p>
        <div class="zhihuE_TasteHead">
            <p class="zhihuE_StPaneTips">已学习 ${prefs.clicks || 0} 次 · ${shown.length} 条增量</p>
            <button type="button" class="zhihuE_IoBtn" data-taste-reset>清空口味</button>
        </div>
        <div class="zhihuE_TasteList">${shown.length ? shown.slice(0, 80).map(row => {
            const cls = row.delta > 0 ? 'is-up' : row.delta < 0 ? 'is-down' : '';
            return `<div class="zhihuE_TasteRow"><div><b>${escapeHtml(row.word)}</b><span> ${escapeHtml(row.kind)} · 喜欢 ${row.like} · 讨厌 ${row.dislike}</span></div><em class="${cls}">${sign(row.delta)}</em></div>`;
        }).join('') : '<p class="zhihuE_StPaneTips">还没有口味增量。在信息流卡片上点「喜欢」或「不感兴趣」就会出现在这里。</p>'}</div>
    </div>`);
    const reset = container.querySelector('[data-taste-reset]');
    if (reset) {
        reset.onclick = () => {
            saveTastePrefs(emptyTastePrefs());
            container.querySelector('.zhihuE_Taste').remove();
            mountTastePane(container);
        };
    }
}

function mountListEditor(container, { storageKey, placeholder, tips }) {
    let list = [...(menuValue(storageKey) || [])];
    let off = readListOff(storageKey);
    let filter = '';
    const withLevels = storageKey === 'menu_customBlockKeywords';
    let defaultLevel = withLevels ? readCustomDefaultLevel() : '';
    let levelMap = withLevels ? readCustomLevelMap() : {};
    const levelBar = withLevels ? `<div class="zhihuE_KwBar">
        <span class="zhihuE_KwBarLabel">默认处理</span>
        <div class="zhihuE_KwSeg">${CUSTOM_LEVEL_IDS.map(id =>
            `<button type="button" class="zhihuE_KwSegBtn${id === defaultLevel ? ' zhihuE_isOn' : ''}" data-level="${id}">${CUSTOM_LEVEL_LABELS[id]}</button>`
        ).join('')}</div>
    </div>` : '';
    container.insertAdjacentHTML('beforeend', `<div class="zhihuE_ListMount">
        ${tips ? `<p class="zhihuE_StPaneTips">${escapeHtml(tips)}</p>` : ''}
        ${levelBar}
        <div class="zhihuE_DlgAdd">
            <input class="zhihuE_DlgInput" type="text" placeholder="${escapeHtml(placeholder)}" />
            <button type="button" class="zhihuE_DlgAddBtn">添加</button>
        </div>
        <div class="zhihuE_DlgFilterWrap"><input class="zhihuE_DlgFilter" type="search" placeholder="在已有词条中筛选…" /></div>
        <div class="zhihuE_DlgCloud"></div>
        <div class="zhihuE_DlgFoot">
            <div class="zhihuE_DlgCount">共 <b class="zhihuE_DlgCountNum">0</b> 条 · 启用 <b class="zhihuE_DlgCountOn">0</b> 条</div>
            <div class="zhihuE_DlgFootRight">
                <button type="button" class="zhihuE_DlgCopy zhihuE_DlgImportBtn">粘贴导入</button>
                <button type="button" class="zhihuE_DlgCopy zhihuE_DlgCopyAll">复制全部</button>
            </div>
        </div>
        <div class="zhihuE_DlgImport">
            <textarea class="zhihuE_DlgImportArea" placeholder="粘贴词表，用逗号、换行或 | 分隔。确认后覆盖当前列表并自动去重。预置词仍会保留，仅开关状态可能变化。"></textarea>
            <div class="zhihuE_DlgImportActions">
                <button type="button" class="zhihuE_DlgCopy zhihuE_DlgImportCancel">取消</button>
                <button type="button" class="zhihuE_DlgCopy is-ok zhihuE_DlgImportOk">确认覆盖导入</button>
            </div>
        </div>
    </div>`);
    const root = container.querySelector('.zhihuE_ListMount:last-child');
    const cloud = root.querySelector('.zhihuE_DlgCloud');
    const countEl = root.querySelector('.zhihuE_DlgCountNum');
    const countOnEl = root.querySelector('.zhihuE_DlgCountOn');
    const input = root.querySelector('.zhihuE_DlgInput');

    const visibleList = () => {
        if (!filter) return list.map((word, index) => ({ word, index }));
        const q = filter.toLowerCase();
        return list.map((word, index) => ({ word, index })).filter(item => item.word.toLowerCase().includes(q));
    };

    const persist = () => {
        menuSet(storageKey, list);
        writeListOff(storageKey, off);
        if (withLevels) writeCustomLevelMap(levelMap);
        noiseIndex = null;
        renderCloud();
        renderLevelBar();
    };

    const renderLevelBar = () => {
        if (!withLevels) return;
        root.querySelectorAll('.zhihuE_KwSegBtn').forEach(btn => {
            btn.classList.toggle('zhihuE_isOn', btn.dataset.level === defaultLevel);
        });
    };

    const renderCloud = () => {
        countEl.textContent = String(list.length);
        countOnEl.textContent = String(list.filter(word => !off.has(word)).length);
        const items = visibleList();
        if (!list.length) {
            cloud.innerHTML = '<div class="zhihuE_DlgEmpty">还没有词条，在上方添加</div>';
            return;
        }
        if (!items.length) {
            cloud.innerHTML = '<div class="zhihuE_DlgEmpty">没有匹配的词条</div>';
            return;
        }
        cloud.innerHTML = items.map(({ word, index }) => {
            const packed = isPackedListItem(storageKey, word);
            const disabled = off.has(word);
            const level = withLevels ? customLevelFor(word, defaultLevel) : '';
            const title = packed ? '预置词，点击开关' : '自定义词，点击开关，× 删除';
            const lv = withLevels
                ? `<button type="button" class="zhihuE_DlgChipLv is-${level}" data-index="${index}" data-level="${level}" title="点击切换隐藏 / 降权 / 加权">${CUSTOM_LEVEL_LABELS[level]}</button>`
                : '';
            const del = packed ? '' : `<button type="button" class="zhihuE_DlgChipDel" data-index="${index}" aria-label="删除">×</button>`;
            return `<span class="zhihuE_DlgChip${packed ? ' is-pack' : ''}${disabled ? ' is-off' : ''}" data-index="${index}" title="${escapeHtml(title)}"><span>${escapeHtml(word)}</span>${lv}${del}</span>`;
        }).join('');
    };

    const addFromInput = () => {
        const words = parseWords(input.value);
        const added = words.filter(w => !list.includes(w));
        if (!added.length) return;
        list = added.concat(list);
        for (const word of added) off.delete(word);
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
        const btn = root.querySelector('.zhihuE_DlgImportBtn');
        if (!next.length) {
            flashBtn(btn, '没有可用词条', false);
            return false;
        }
        const packedKeep = list.filter(w => isPackedListItem(storageKey, w));
        const incoming = new Set(next.map(w => w.toLowerCase()));
        const custom = next.filter(w => !isPackedListItem(storageKey, w));
        list = uniqueWords(packedKeep.concat(custom));
        off = new Set(packedKeep.filter(w => !incoming.has(w.toLowerCase())));
        persist();
        flashBtn(btn, `已导入 ${next.length} 条`);
        return true;
    };

    const openImportPanel = (preset = '') => {
        const panel = root.querySelector('.zhihuE_DlgImport');
        const area = root.querySelector('.zhihuE_DlgImportArea');
        panel.classList.add('is-open');
        area.value = preset;
        area.focus();
        area.select();
    };

    const closeImportPanel = () => {
        root.querySelector('.zhihuE_DlgImport').classList.remove('is-open');
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
        const btn = root.querySelector('.zhihuE_DlgCopyAll');
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

    if (withLevels) {
        root.querySelector('.zhihuE_KwSeg').addEventListener('click', event => {
            const btn = event.target.closest('.zhihuE_KwSegBtn');
            if (!btn || !CUSTOM_LEVEL_IDS.includes(btn.dataset.level)) return;
            defaultLevel = btn.dataset.level;
            writeCustomDefaultLevel(defaultLevel);
            renderCloud();
            renderLevelBar();
        });
    }
    root.querySelector('.zhihuE_DlgAddBtn').onclick = addFromInput;
    root.querySelector('.zhihuE_DlgCopyAll').onclick = copyAll;
    root.querySelector('.zhihuE_DlgImportBtn').onclick = importFromPaste;
    root.querySelector('.zhihuE_DlgImportCancel').onclick = closeImportPanel;
    root.querySelector('.zhihuE_DlgImportOk').onclick = () => {
        if (applyImport(root.querySelector('.zhihuE_DlgImportArea').value)) closeImportPanel();
    };
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') addFromInput();
    });
    root.querySelector('.zhihuE_DlgFilter').addEventListener('input', event => {
        filter = event.target.value.trim();
        renderCloud();
    });
    cloud.addEventListener('click', event => {
        const del = event.target.closest('.zhihuE_DlgChipDel');
        if (del) {
            const index = Number(del.dataset.index);
            if (Number.isNaN(index)) return;
            const word = list[index];
            if (isPackedListItem(storageKey, word)) return;
            list.splice(index, 1);
            off.delete(word);
            if (withLevels) dropCustomLevel(levelMap, word);
            persist();
            return;
        }
        const lvBtn = event.target.closest('.zhihuE_DlgChipLv');
        if (lvBtn && withLevels) {
            const index = Number(lvBtn.dataset.index);
            if (Number.isNaN(index)) return;
            const word = list[index];
            const current = customLevelFor(word, defaultLevel);
            const next = CUSTOM_LEVEL_IDS[(CUSTOM_LEVEL_IDS.indexOf(current) + 1) % CUSTOM_LEVEL_IDS.length];
            if (next === defaultLevel) dropCustomLevel(levelMap, word);
            else {
                dropCustomLevel(levelMap, word);
                levelMap[word] = next;
            }
            persist();
            return;
        }
        const chip = event.target.closest('.zhihuE_DlgChip');
        if (!chip) return;
        const index = Number(chip.dataset.index);
        if (Number.isNaN(index)) return;
        const word = list[index];
        if (off.has(word)) off.delete(word);
        else off.add(word);
        persist();
    });
    persist();
}

function mountLexiconEditor(container) {
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

    container.insertAdjacentHTML('beforeend', `<div class="zhihuE_LxMount">
        <p class="zhihuE_StPaneTips">按分类增删词条。加权词可用「词:8」导入。未改过的分类会跟随脚本默认更新；改过的只以你的版本为准。</p>
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
            </div>
        </div>
    </div>`);
    const root = container.querySelector('.zhihuE_LxMount:last-child');
    const nav = root.querySelector('.zhihuE_LxNav');
    const tabs = root.querySelector('.zhihuE_LxTabs');
    const cloud = root.querySelector('.zhihuE_LxCloud');
    const countEl = root.querySelector('.zhihuE_LxCount');
    const wordInput = root.querySelector('.zhihuE_LxWord');
    const weightInput = root.querySelector('.zhihuE_LxWeight');

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
            `<button type="button" class="zhihuE_LxNavBtn${b.id === current ? ' zhihuE_isOn' : ''}" data-id="${b.id}">${escapeHtml(b.name)}</button>`
        ).join('');
    };
    const renderTabs = () => {
        const bucket = currentBucket();
        if (bucket.kind !== 'cat') {
            tabs.innerHTML = '';
            weightInput.style.display = bucket.kind === 'list' ? 'none' : '';
            return;
        }
        tabs.innerHTML = `<button type="button" class="zhihuE_LxTab${tab === 'words' ? ' zhihuE_isOn' : ''}" data-tab="words">关键词</button>
            <button type="button" class="zhihuE_LxTab${tab === 'excludes' ? ' zhihuE_isOn' : ''}" data-tab="excludes">排除词</button>`;
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
        mark();
        if (currentMap()) Object.assign(currentMap(), parseWeightedWords(text, fallback));
        else {
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
        if (bucket.kind === 'cat' && tab === 'excludes') lex.cats[bucket.id].excludes = uniqueWords(parseWords(text));
        else if (bucket.kind === 'list') lex[bucket.id] = uniqueWords(parseWords(text));
        else if (bucket.kind === 'cat') lex.cats[bucket.id].words = parseWeightedWords(text, fallback);
        else lex[bucket.id] = parseWeightedWords(text, fallback);
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
    root.querySelector('.zhihuE_LxAddBtn').onclick = () => {
        addWords(wordInput.value);
        wordInput.value = '';
        wordInput.focus();
    };
    wordInput.addEventListener('keydown', event => {
        if (event.key === 'Enter') root.querySelector('.zhihuE_LxAddBtn').click();
    });
    cloud.addEventListener('click', event => {
        const btn = event.target.closest('.zhihuE_LxDel');
        if (!btn) return;
        mark();
        if (btn.dataset.word != null) delete currentMap()[btn.dataset.word];
        else currentList().splice(Number(btn.dataset.index), 1);
        persist();
    });
    root.querySelector('.zhihuE_LxCopy').onclick = async () => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(exportText());
        } catch (e) { /* ignore */ }
        const btn = root.querySelector('.zhihuE_LxCopy');
        const raw = btn.textContent;
        btn.textContent = '已复制';
        setTimeout(() => { btn.textContent = raw; }, 1200);
    };
    root.querySelector('.zhihuE_LxImport').onclick = async () => {
        let text = '';
        try {
            if (navigator.clipboard && navigator.clipboard.readText) text = await navigator.clipboard.readText();
        } catch (e) { /* ignore */ }
        if (!text) text = prompt('粘贴词库，覆盖当前分类（词:权重 或纯词）', '') || '';
        importText(text);
    };
    root.querySelector('.zhihuE_LxReset').onclick = resetCurrent;
    render();
}

function mountIoPane(container) {
    const snap = snapshotSettings();
    const compactText = JSON.stringify(snap);
    const prettyText = JSON.stringify(snap, null, 2);
    const compactBytes = utf8Bytes(compactText);
    const keys = Object.keys(snap.values || {}).length;
    container.innerHTML = `<div class="zhihuE_IoMount">
        <p class="zhihuE_StPaneTips">包含全部开关、屏蔽用户/关键词、口味增量（<code>noise_taste_v1</code>），以及完整噪音词库（<code>noise_lexicon_v1</code>）。导入会覆盖当前配置并刷新页面。</p>
        <p class="zhihuE_IoStat">脚本 v${escapeHtml(scriptVersion() || '—')} · 已保存 ${formatBytes(compactBytes)} · 格式化 ${formatBytes(utf8Bytes(prettyText))} · ${keys} 项</p>
        <textarea class="zhihuE_IoArea" spellcheck="false"></textarea>
        <div class="zhihuE_IoMsg"></div>
        <div class="zhihuE_IoFoot">
            <div class="zhihuE_IoBtns">
                <button type="button" class="zhihuE_IoBtn" data-act="download">下载 JSON</button>
                <button type="button" class="zhihuE_IoBtn" data-act="copy">复制</button>
                <button type="button" class="zhihuE_IoBtn" data-act="file">从文件导入</button>
            </div>
            <div class="zhihuE_IoBtns">
                <button type="button" class="zhihuE_IoBtn zhihuE_IoPrimary" data-act="apply">导入并刷新</button>
            </div>
        </div>
        <input class="zhihuE_IoFile" type="file" accept="application/json,.json">
    </div>`;
    const root = container.querySelector('.zhihuE_IoMount');
    const area = root.querySelector('.zhihuE_IoArea');
    const msg = root.querySelector('.zhihuE_IoMsg');
    const stat = root.querySelector('.zhihuE_IoStat');
    const fileInput = root.querySelector('.zhihuE_IoFile');
    area.value = prettyText;

    const refreshStat = () => {
        stat.textContent = `脚本 v${scriptVersion() || '—'} · 已保存 ${formatBytes(compactBytes)} · 编辑区 ${formatBytes(utf8Bytes(area.value))} · ${keys} 项`;
    };
    area.addEventListener('input', refreshStat);
    refreshStat();

    const flash = (btn, text) => {
        const raw = btn.textContent;
        btn.textContent = text;
        btn.classList.add('is-ok');
        setTimeout(() => {
            btn.textContent = raw;
            btn.classList.remove('is-ok');
        }, 1200);
    };
    const showError = text => { msg.textContent = text; };
    const applyText = text => {
        showError('');
        let values;
        try {
            values = parseSettingsJson(text);
        } catch (err) {
            showError(err.message === 'kind' ? '不是本脚本的配置文件。' : 'JSON 无效，请检查后再导入。');
            return;
        }
        const n = applyImportedSettings(values);
        if (!n) {
            showError('没有可导入的设置项。');
            return;
        }
        notify('已导入 ' + n + ' 项，即将刷新');
        location.reload();
    };

    root.querySelector('.zhihuE_IoFoot').addEventListener('click', async event => {
        const btn = event.target.closest('[data-act]');
        if (!btn) return;
        const act = btn.dataset.act;
        if (act === 'download') {
            downloadJsonFile(settingsExportFilename(), area.value.trim() || prettyText);
            flash(btn, '已下载');
            notify('已导出 JSON');
            return;
        }
        if (act === 'copy') {
            const text = area.value.trim() || prettyText;
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
            } catch (e) { /* ignore */ }
            flash(btn, '已复制');
            return;
        }
        if (act === 'file') {
            fileInput.click();
            return;
        }
        if (act === 'apply') {
            if (!confirm('导入将覆盖当前全部设置，确定？')) return;
            applyText(area.value);
        }
    });
    fileInput.addEventListener('change', () => {
        const file = fileInput.files && fileInput.files[0];
        fileInput.value = '';
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            area.value = String(reader.result || '');
            showError('');
            refreshStat();
        };
        reader.onerror = () => showError('无法读取该文件。');
        reader.readAsText(file, 'utf-8');
    });
}
