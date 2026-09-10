function compileNoiseIndex() {
    if (noiseIndex) return noiseIndex;
    const lex = getActiveLexicon();
    const enabled = {
        1: menuValue('menu_noiseL1') !== false,
        2: menuValue('menu_noiseL2') !== false,
        3: !!menuValue('menu_noiseL3')
    };
    const cats = [];
    for (const cat of Object.keys(lex.cats).map(id => lex.cats[id])) {
        if (!enabled[cat.level]) continue;
        const words = Object.keys(cat.words).map(k => ({
            k: k.toLowerCase(),
            w: cat.words[k],
            len: k.length
        })).sort((a, b) => b.len - a.len);
        cats.push({
            id: cat.id,
            name: cat.name,
            level: cat.level,
            c: cat.c,
            excludes: (cat.excludes || []).map(x => x.toLowerCase()),
            words
        });
    }
    const custom = activeKeywordEntries().map(item => ({
        k: String(item.word).toLowerCase(),
        word: item.word,
        level: CUSTOM_LEVELS[item.level] ? item.level : 'weight'
    }));
    const toPairs = map => Object.keys(map).map(k => ({ k: k.toLowerCase(), w: map[k] }));
    const emotion = toPairs(lex.emotion);
    const controversy = (lex.controversy || []).map(x => String(x).toLowerCase());
    const clickbait = (lex.clickbait || []).map(x => String(x).toLowerCase());
    const value = toPairs(lex.value);
    const lookupNoise = Object.create(null);
    const lookupValue = Object.create(null);
    let maxTermLen = 2;
    const putNoise = (word, catId) => {
        const k = String(word || '').toLowerCase();
        if (!k) return;
        if (k.length > maxTermLen) maxTermLen = k.length;
        const cur = lookupNoise[k] || { cats: [] };
        if (catId && !cur.cats.includes(catId)) cur.cats.push(catId);
        lookupNoise[k] = cur;
    };
    for (const cat of cats) {
        for (const item of cat.words) putNoise(item.k, cat.id);
    }
    for (const item of custom) putNoise(item.k, '');
    for (const item of emotion) putNoise(item.k, '');
    for (const word of controversy) putNoise(word, '');
    for (const word of clickbait) putNoise(word, '');
    for (const item of value) {
        lookupValue[item.k] = 1;
        if (item.k.length > maxTermLen) maxTermLen = item.k.length;
    }
    noiseIndex = {
        cats,
        custom,
        emotion,
        controversy,
        clickbait,
        value,
        lookupNoise,
        lookupValue,
        maxTermLen
    };
    jiebaTokenCache.clear();
    jiebaSetCache.clear();
    syncJiebaUserDict();
    return noiseIndex;
}

function scoreText(raw) {
    if (!raw) {
        return {
            final: 0, K: 0, C: 0, E: 0, S: 0, B: 0, V: 0, kRaw: 0,
            hits: { words: [], custom: [], cats: [], emotion: [], controversy: [], clickbait: [], value: [], learned: [] },
            winningCat: '', winningCatId: '', exclude: '', cFallback: false, customHit: false, customFloor: 0,
            rule: { action: '', words: [] }
        };
    }
    const text = String(raw).toLowerCase();
    const idx = compileNoiseIndex();
    const prefs = tasteEnabled() ? getTastePrefs() : null;
    const tokenSet = noiseTokenSet(text);
    const has = term => noiseHas(text, term, tokenSet);
    let kRaw = 0;
    let bestC = 0;
    let winningCat = '';
    let winningCatId = '';
    let exclude = '';
    const wordHits = [];
    const catHits = [];

    for (const cat of idx.cats) {
        let longHits = 0;
        let catW = 0;
        const local = [];
        for (const item of cat.words) {
            if (item.len < 2) continue;
            if (has(item.k)) {
                longHits += 1;
                const w = Math.max(0, item.w + (prefs ? tasteDelta(prefs.words, item.k) : 0));
                catW += w;
                local.push({ word: item.k, w, cat: cat.name, source: 'cat' });
            }
        }
        if (longHits) {
            for (const item of cat.words) {
                if (item.len >= 2) continue;
                if (has(item.k)) {
                    const w = Math.max(0, item.w * 0.35 + (prefs ? tasteDelta(prefs.words, item.k) : 0));
                    catW += w;
                    local.push({ word: item.k, w, cat: cat.name, source: 'char' });
                }
            }
            let c = cat.c + (prefs ? tasteDelta(prefs.cats, cat.id) : 0);
            const hitEx = cat.excludes.find(ex => has(ex)) || '';
            if (hitEx) c *= 0.35;
            c = Math.max(0, c);
            if (c > bestC) {
                bestC = c;
                winningCat = cat.name;
                winningCatId = cat.id || '';
                exclude = hitEx;
            }
            kRaw += catW;
            wordHits.push(...local);
            catHits.push({ word: cat.name, w: c, level: cat.level, exclude: hitEx });
        }
    }

    let customHit = false;
    let customFloor = 0;
    const customHits = [];
    for (const item of idx.custom) {
        const word = item && item.k;
        if (!word || !has(word)) continue;
        const spec = CUSTOM_LEVELS[item.level] || CUSTOM_LEVELS.weight;
        customHit = true;
        customFloor = Math.max(customFloor, spec.floor);
        const w = spec.k + (prefs ? tasteDelta(prefs.words, word) : 0);
        customHits.push({ word: item.word || word, w, level: spec.id, cat: '自定义', source: 'custom' });
        if (!wordHits.some(hit => hit.word === word || hit.word === item.word)) {
            kRaw += Math.max(0, w);
            wordHits.push({ word: item.word || word, w, level: spec.id, cat: '自定义', source: 'custom' });
        }
    }
    const rule = noiseRuleFromHits(customHits);

    const learnedHits = [];
    if (prefs && prefs.learned) {
        for (const word of Object.keys(prefs.learned)) {
            const item = prefs.learned[word];
            if (!item || !has(word)) continue;
            if ((item.like || 0) + (item.dislike || 0) < TASTE_LEARNED_MIN) continue;
            const d = Number(item.delta) || 0;
            if (!d) continue;
            learnedHits.push({ word, w: d, cat: '口味新词', source: 'learned' });
            if (d > 0) kRaw += d;
        }
    }

    const K = 100 * (1 - Math.exp(-kRaw / 20));

    const emotion = [];
    let eSum = 0;
    for (const item of idx.emotion) {
        if (has(item.k)) {
            const w = Math.max(0, item.w + (prefs ? tasteDelta(prefs.words, item.k) : 0));
            eSum += w;
            emotion.push({ word: item.k, w });
        }
    }
    const E = Math.min(25, eSum);

    const controversy = [];
    let sRaw = 0;
    for (const word of idx.controversy) {
        if (has(word)) {
            controversy.push(word);
            sRaw += Math.max(0, 6 + (prefs ? tasteDelta(prefs.words, word) : 0));
        }
    }
    const S = Math.min(30, sRaw);

    const clickbait = [];
    let bRaw = 0;
    for (const word of idx.clickbait) {
        if (has(word)) {
            clickbait.push(word);
            bRaw += Math.max(0, 5 + (prefs ? tasteDelta(prefs.words, word) : 0));
        }
    }
    const B = Math.min(25, bRaw);

    const value = [];
    let V = 0;
    for (const item of idx.value) {
        if (has(item.k)) {
            const w = Math.max(0, item.w + (prefs ? tasteDelta(prefs.value, item.k) : 0));
            V += w;
            value.push({ word: item.k, w });
        }
    }
    for (const item of learnedHits) {
        if (item.w < 0) V += Math.abs(item.w);
    }
    V = Math.min(50, V);

    const cFallback = kRaw === 0 && E + B >= 16;
    if (cFallback) {
        bestC = Math.max(bestC, 42);
        if (!catHits.length) catHits.push({ word: '情绪保底', w: bestC });
    }

    const noise = NOISE_WEIGHTS.k * K + NOISE_WEIGHTS.c * bestC + NOISE_WEIGHTS.e * E + NOISE_WEIGHTS.s * S + NOISE_WEIGHTS.b * B;
    const final = Math.max(0, Math.min(100, noise - NOISE_WEIGHTS.v * V));
    return {
        final, K, C: bestC, E, S, B, V, kRaw,
        hits: { words: wordHits, custom: customHits, cats: catHits, emotion, controversy, clickbait, value, learned: learnedHits },
        winningCat, winningCatId, exclude, cFallback, customHit, customFloor, rule
    };
}

function noiseRuleFromHits(hits) {
    let action = '';
    for (const item of hits || []) {
        if (item.level === 'hide') action = 'hide';
        else if (item.level === 'demote' && action !== 'hide') action = 'demote';
    }
    return { action, words: hits || [] };
}

function mergeNoiseRules(a, b) {
    const words = [...((a && a.words) || []), ...((b && b.words) || [])];
    const action = (a && a.action) === 'hide' || (b && b.action) === 'hide'
        ? 'hide'
        : (a && a.action) === 'demote' || (b && b.action) === 'demote'
            ? 'demote'
            : '';
    return { action, words };
}

function scoreFeedNoise(title, body) {
    const titleScore = scoreText(title);
    const bodyScore = scoreText(String(body || '').slice(0, 280));
    const final = Math.max(titleScore.final, titleScore.final * 0.72 + bodyScore.final * 0.28);
    const rule = mergeNoiseRules(titleScore.rule, bodyScore.rule);
    return { final, titleScore, bodyScore, rule };
}

function noiseVerdict(score, rule) {
    if (rule && rule.action === 'hide') return { id: 'hide', name: '规则隐藏' };
    if (score >= NOISE_HIDE) return { id: 'hide', name: '会隐藏' };
    if (rule && rule.action === 'demote') return { id: 'demote', name: '规则降权' };
    if (score >= NOISE_DEMOTE) return { id: 'demote', name: '会降权' };
    return { id: 'keep', name: '会保留' };
}

function noiseTint(score) {
    const s = Math.max(0, Math.min(100, Number(score) || 0));
    if (s <= NOISE_DEMOTE) return (s / NOISE_DEMOTE) * 0.38;
    if (s < NOISE_HIDE) return 0.38 + (s - NOISE_DEMOTE) / (NOISE_HIDE - NOISE_DEMOTE) * 0.32;
    return 0.7 + (s - NOISE_HIDE) / (100 - NOISE_HIDE) * 0.3;
}
