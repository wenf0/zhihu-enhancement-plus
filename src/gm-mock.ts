const memory = new Map<string, any>();

export function GM_getValue(key: string, def?: any) {
    return memory.has(key) ? memory.get(key) : def;
}

export function GM_setValue(key: string, value: any) {
    memory.set(key, value);
}

export function GM_deleteValue(key: string) {
    memory.delete(key);
}

export function GM_notification(options: { text?: string; timeout?: number } | string) {
    const text = typeof options === 'string' ? options : options.text || '';
    console.info('[preview notify]', text);
}

export function GM_registerMenuCommand(_name: string, _fn: () => void) {
    return 1;
}

export function GM_unregisterMenuCommand(_id: string | number) {}

export function GM_openInTab(url: string) {
    window.open(url, '_blank', 'noopener');
}

export function GM_getResourceURL(_name: string) {
    return '';
}

export function GM_xmlhttpRequest(details: {
    url: string;
    method?: string;
    onload?: (res: { status: number; response: ArrayBuffer | null }) => void;
    onerror?: () => void;
    ontimeout?: () => void;
}) {
    fetch(details.url)
        .then(async res => {
            details.onload?.({ status: res.status, response: await res.arrayBuffer() });
        })
        .catch(() => details.onerror?.());
    return { abort() {} };
}

export const GM_info = {
    scriptHandler: 'Preview',
    version: '4.19',
    script: {
        version: '1.12.0',
        name: '知乎增强优化'
    }
};
