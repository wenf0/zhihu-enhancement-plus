const TASTE_WORD_STEP = 2;
const TASTE_CAT_STEP = 5;
const TASTE_VALUE_STEP = 3;
const TASTE_LEARNED_STEP = 1;
const TASTE_WORD_RANGE = [-8, 12];
const TASTE_CAT_RANGE = [-24, 28];
const TASTE_VALUE_RANGE = [-8, 16];
const TASTE_LEARNED_RANGE = [-10, 10];
const TASTE_LEARNED_MIN = 2;

function emptyTastePrefs() {
    return { words: {}, cats: {}, value: {}, learned: {}, actions: {}, clicks: 0 };
}

function tasteEnabled() {
    return !!menuValue('menu_noiseScore') && menuValue('menu_noiseTaste') !== false;
}

function getTastePrefs() {
    if (tasteCache) return tasteCache;
    const saved = GM_getValue(TASTE_KEY);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) {
        tasteCache = emptyTastePrefs();
        return tasteCache;
    }
    tasteCache = {
        words: saved.words && typeof saved.words === 'object' && !Array.isArray(saved.words) ? saved.words : {},
        cats: saved.cats && typeof saved.cats === 'object' && !Array.isArray(saved.cats) ? saved.cats : {},
        value: saved.value && typeof saved.value === 'object' && !Array.isArray(saved.value) ? saved.value : {},
        learned: saved.learned && typeof saved.learned === 'object' && !Array.isArray(saved.learned) ? saved.learned : {},
        actions: saved.actions && typeof saved.actions === 'object' && !Array.isArray(saved.actions) ? saved.actions : {},
        clicks: Number(saved.clicks) || 0
    };
    return tasteCache;
}

function saveTastePrefs(data) {
    tasteCache = data;
    GM_setValue(TASTE_KEY, data);
    writeSettingsBackup();
    if (jiebaReady) syncJiebaUserDict();
}

function clampTaste(n, range) {
    return Math.max(range[0], Math.min(range[1], n));
}

function bumpTasteEntry(map, key, field, fieldDelta, step, range) {
    const cur = map[key] || { like: 0, dislike: 0, delta: 0 };
    const next = {
        like: Math.max(0, (cur.like || 0) + (field === 'like' ? fieldDelta : 0)),
        dislike: Math.max(0, (cur.dislike || 0) + (field === 'dislike' ? fieldDelta : 0)),
        delta: clampTaste((cur.delta || 0) + step, range)
    };
    if (!next.like && !next.dislike && !next.delta) delete map[key];
    else map[key] = next;
}

function applyTasteSignals(prefs, signals, action, sign) {
    const like = action === 'like';
    const field = like ? 'like' : 'dislike';
    const titleBoost = new Set(signals.titleWords || []);
    const stepFor = (base, word) => Math.round(base * (titleBoost.has(word) ? 1.5 : 1)) * sign;
    const wordStep = like ? -TASTE_WORD_STEP : TASTE_WORD_STEP;
    const catStep = (like ? -TASTE_CAT_STEP : TASTE_CAT_STEP) * sign;
    const valueStep = like ? TASTE_VALUE_STEP : -TASTE_VALUE_STEP;
    const learnedStep = like ? -TASTE_LEARNED_STEP : TASTE_LEARNED_STEP;
    if (!prefs.learned || typeof prefs.learned !== 'object') prefs.learned = {};
    for (const word of signals.noiseWords) {
        bumpTasteEntry(prefs.words, word, field, sign, stepFor(wordStep, word), TASTE_WORD_RANGE);
    }
    for (const id of signals.cats) {
        bumpTasteEntry(prefs.cats, id, field, sign, catStep, TASTE_CAT_RANGE);
    }
    for (const word of signals.valueWords) {
        bumpTasteEntry(prefs.value, word, field, sign, stepFor(valueStep, word), TASTE_VALUE_RANGE);
    }
    for (const word of signals.learned || []) {
        bumpTasteEntry(prefs.learned, word, field, sign, stepFor(learnedStep, word), TASTE_LEARNED_RANGE);
    }
    const learnedKeys = Object.keys(prefs.learned);
    if (learnedKeys.length > 200) {
        learnedKeys.sort((a, b) => {
            const x = prefs.learned[a];
            const y = prefs.learned[b];
            return (Math.abs(x.delta || 0) + (x.like || 0) + (x.dislike || 0))
                - (Math.abs(y.delta || 0) + (y.like || 0) + (y.dislike || 0));
        }).slice(0, learnedKeys.length - 200).forEach(k => delete prefs.learned[k]);
    }
}

function collectTasteSignals(title, body) {
    const idx = compileNoiseIndex();
    const titleText = String(title || '').toLowerCase();
    const bodyText = String(body || '').toLowerCase();
    const mixed = (titleText + '\n' + bodyText).trim();
    const tokenSet = noiseTokenSet(mixed);
    const titleSet = noiseTokenSet(titleText);
    const noiseWords = new Set();
    const valueWords = new Set();
    const cats = new Set();
    const titleWords = new Set();
    const learned = new Set();
    if (tokenSet && idx.lookupNoise) {
        for (const tok of tokenSet) {
            if (tok.length < 2) continue;
            const meta = idx.lookupNoise[tok];
            if (meta) {
                noiseWords.add(tok);
                for (const id of meta.cats) if (id) cats.add(id);
                if (titleSet && titleSet.has(tok)) titleWords.add(tok);
            }
            if (idx.lookupValue && idx.lookupValue[tok]) {
                valueWords.add(tok);
                if (titleSet && titleSet.has(tok)) titleWords.add(tok);
            }
        }
    } else {
        const { titleScore, bodyScore } = scoreFeedNoise(title, body);
        const take = score => {
            if (!score || !score.hits) return;
            for (const item of score.hits.words || []) {
                if (item.source === 'char' || !item.word) continue;
                noiseWords.add(String(item.word).toLowerCase());
            }
            for (const item of score.hits.emotion || []) {
                if (item.word) noiseWords.add(String(item.word).toLowerCase());
            }
            for (const word of score.hits.controversy || []) noiseWords.add(String(word).toLowerCase());
            for (const word of score.hits.clickbait || []) noiseWords.add(String(word).toLowerCase());
            for (const item of score.hits.value || []) {
                if (item.word) valueWords.add(String(item.word).toLowerCase());
            }
            if (score.winningCatId) cats.add(score.winningCatId);
        };
        take(titleScore);
        take(bodyScore);
    }
    const tagged = jiebaTagTokens(mixed);
    const candidates = tagged.length
        ? tagged.filter(item => canLearnJiebaToken(item.word, item.tag)).map(item => item.word)
        : [...(cutNoiseTokens(mixed) || [])].filter(word => canLearnJiebaToken(word, ''));
    for (const word of candidates) {
        if (idx.lookupNoise && idx.lookupNoise[word]) continue;
        if (idx.lookupValue && idx.lookupValue[word]) continue;
        learned.add(word);
        if (titleSet && titleSet.has(word)) titleWords.add(word);
    }
    const learnedList = [...learned].sort((a, b) => {
        const ta = titleWords.has(a) ? 1 : 0;
        const tb = titleWords.has(b) ? 1 : 0;
        return tb - ta || b.length - a.length;
    }).slice(0, 24);
    return {
        noiseWords: [...noiseWords],
        valueWords: [...valueWords],
        cats: [...cats],
        learned: learnedList,
        titleWords: [...titleWords]
    };
}

function tasteDelta(map, key) {
    const item = map && map[key];
    return item ? Number(item.delta) || 0 : 0;
}
