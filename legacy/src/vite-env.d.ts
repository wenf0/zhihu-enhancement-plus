/// <reference types="vite/client" />
/// <reference types="vite-plugin-monkey/client" />

interface Window {
    onurlchange?: unknown;
    _collapsedAnswerObserver?: MutationObserver & { start?: () => void; end?: () => void; _active?: boolean };
    _zhihuPlusCornerStyleWatch?: boolean;
}

declare module '*.css?inline' {
    const css: string;
    export default css;
}

declare module '../../vendor/jieba-rs-wasm-glue.js' {
    const wasm: {
        cut(text: string, hmm?: boolean | null): string[];
        cut_for_search(text: string, hmm?: boolean | null): string[];
        tag(sentence: string, hmm?: boolean | null): Array<{ word?: string; tag?: string; flag?: string } | string>;
        add_word(word: string, freq?: number, tag?: string): void;
        initSync(opts: { module: BufferSource }): void;
        init(module?: BufferSource | Request | string): Promise<unknown>;
    };
    export default wasm;
}
