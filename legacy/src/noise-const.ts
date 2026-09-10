export const NOISE_WEIGHTS = { k: 0.30, c: 0.25, e: 0.15, s: 0.15, b: 0.15, v: 0.30 };
export const NOISE_HIDE = 60;
export const NOISE_DEMOTE = 30;
export const CUSTOM_LEVELS = {
    hide: { id: 'hide', name: '隐藏', k: 48, floor: NOISE_HIDE },
    demote: { id: 'demote', name: '降权', k: 24, floor: NOISE_DEMOTE },
    weight: { id: 'weight', name: '加权', k: 12, floor: 0 }
};
