/// <reference types="vite/client" />
/// <reference path="../.wxt/wxt.d.ts" />

interface Window {
  onurlchange?: unknown;
  _collapsedAnswerObserver?: MutationObserver & { start: () => void; end: () => void; _active?: boolean; _disconnectListener?: boolean };
  _zhihuPlusCornerStyleWatch?: boolean;
}

declare module '*?inline' {
  const css: string;
  export default css;
}

declare module '@/lib/noise/jieba-glue.js' {
  const Jieba: {
    initSync(opts: { module: ArrayBuffer | WebAssembly.Module }): unknown;
    cut(text: string, hmm?: boolean): string[];
    cut_for_search?(text: string, hmm?: boolean): string[];
    tag?(text: string, hmm?: boolean): Array<{ word?: string; tag?: string; flag?: string } | string>;
    add_word(word: string, freq?: number, tag?: string): void;
  };
  export default Jieba;
}
