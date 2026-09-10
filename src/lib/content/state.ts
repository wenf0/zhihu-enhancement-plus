import type { TastePrefs } from '../types';

export const runtime = {
  noiseIndex: null as unknown,
  noiseTasteGen: 0,
  noiseRescan: null as null | (() => void),
  hiddenNoiseItems: [] as Array<Record<string, unknown>>,
  learnedWords: [] as string[],
  tasteCache: null as TastePrefs | null,
};

export function invalidateNoise() {
  runtime.noiseIndex = null;
  runtime.tasteCache = null;
  runtime.noiseTasteGen += 1;
}
