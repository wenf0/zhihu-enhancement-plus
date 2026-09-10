export const state = {
    cache: Object.create(null) as Record<string, any>,
    menuCommandIds: [] as Array<string | number>,
    noiseIndex: null as any,
    tasteCache: null as any,
    noiseRescan: null as null | (() => void),
    noiseTasteGen: 1,
    getActiveLexicon: (() => ({
        touched: [],
        cats: {},
        emotion: {},
        controversy: [],
        clickbait: [],
        value: {}
    })) as () => any,
    learnedWords: (() => [] as string[])
};

export function resetNoiseIndex() {
    state.noiseIndex = null;
}
