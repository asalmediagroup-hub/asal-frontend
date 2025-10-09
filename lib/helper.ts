// /lib/dynamic-translator.ts
// Client-side dynamic translator using LibreTranslate (free).
// - Walks any JSON-like data
// - Translates plain strings to Somali, Arabic, or English
// - Caches results in memory + localStorage
// - Skips URLs and HTML

export type Locale = "en" | "so" | "ar";

// Public LibreTranslate endpoint (rate-limited) or your own instance
const ENDPOINT =
    process.env.NEXT_PUBLIC_LIBRE_TRANSLATE_URL?.trim() ||
    "https://libretranslate.de/translate";

const CACHE_PREFIX = "dyn_tr_v1_";
const memoryCache = new Map<string, string>();

function hashKey(text: string, to: Locale) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return `${CACHE_PREFIX}${to}_${(h >>> 0).toString(16)}`;
}

function getCached(text: string, to: Locale) {
    const key = hashKey(text, to);
    if (memoryCache.has(key)) return memoryCache.get(key)!;
    try {
        const v = localStorage.getItem(key);
        if (v) {
            memoryCache.set(key, v);
            return v;
        }
    } catch { }
    return null;
}

function setCached(text: string, to: Locale, translated: string) {
    const key = hashKey(text, to);
    memoryCache.set(key, translated);
    try {
        localStorage.setItem(key, translated);
    } catch { }
}

const isURL = (s: string) => /^https?:\/\//i.test(s) || /^data:/i.test(s);
const isHTML = (s: string) => /<\/?[a-z][\s\S]*>/i.test(s);

async function translateOne(
    text: string,
    to: Locale,
    from: string = "auto",
    signal?: AbortSignal
): Promise<string> {
    try {
        const res = await fetch(ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal,
            body: JSON.stringify({ q: text, source: from, target: to, format: "text" }),
        });
        if (!res.ok) return text;
        const data = await res.json();
        return data?.translatedText ?? text;
    } catch {
        return text; // fail-soft
    }
}

/**
 * Translate all plain strings in a JSON-like object/array.
 * - Uses cache (localStorage + memory)
 * - Skips URLs/HTML
 * - Returns a deep-cloned structure with translated strings
 */
export async function translateDynamicPayloadClient<T>(
    data: T,
    to: Locale,
    opts?: { minLen?: number; from?: string; abortSignal?: AbortSignal }
): Promise<T> {
    const minLen = opts?.minLen ?? 3;

    const strings: string[] = [];
    const nodes: Array<{ tgt: any; key: string; orig: string }> = [];

    const walk = (node: any): any => {
        if (Array.isArray(node)) return node.map(walk);
        if (node && typeof node === "object") {
            const out: any = {};
            for (const [k, v] of Object.entries(node)) {
                if (typeof v === "string") {
                    const s = v.trim();
                    if (s.length >= minLen && !isURL(s) && !isHTML(s)) {
                        const cached =
                            typeof window !== "undefined" ? getCached(s, to) : null;
                        if (cached) {
                            out[k] = cached;
                        } else {
                            out[k] = s; // placeholder, replace later
                            strings.push(s);
                            nodes.push({ tgt: out, key: k, orig: s });
                        }
                    } else {
                        out[k] = v;
                    }
                } else {
                    out[k] = walk(v);
                }
            }
            return out;
        }
        return node;
    };

    const cloned = walk(data);

    // nothing to translate
    if (strings.length === 0) return cloned as T;

    // unique list
    const unique = Array.from(new Set(strings));

    for (const orig of unique) {
        const translated = await translateOne(orig, to, opts?.from, opts?.abortSignal);
        setCached(orig, to, translated);
        for (const n of nodes.filter((n) => n.orig === orig)) {
            n.tgt[n.key] = translated;
        }
    }

    return cloned as T;
}
