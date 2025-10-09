// /lib/translator.ts
import { Locale, pickLocale, trCategory } from "./i18n";

/**
 * Options for the translator
 */
export type TranslatorOptions = {
    /**
     * Field names that should be treated as localized text if their value is an object with { en, so, ar }.
     * Defaults: ["title", "description", "text", "subtitle", "body", "content"]
     */
    localizedFieldNames?: string[];

    /**
     * Field names that represent category KEYS (e.g., "documentary"). These will be mapped to localized labels.
     * Defaults: ["category"]
     */
    categoryFieldNames?: string[];

    /**
     * When true (default), we attempt to detect localized objects by the presence of "en" | "so" | "ar" keys,
     * even if the field name is not in localizedFieldNames.
     */
    autoDetectLocalizedObjects?: boolean;
};

const DEFAULT_OPTIONS: Required<TranslatorOptions> = {
    localizedFieldNames: ["title", "description", "text", "subtitle", "body", "content"],
    categoryFieldNames: ["category"],
    autoDetectLocalizedObjects: true,
};

/**
 * Type guard to detect if an unknown value looks like a localized object { en?: string; so?: string; ar?: string }.
 */
function isLocalizedObject(val: unknown): val is Record<string, unknown> {
    if (!val || typeof val !== "object") return false;
    const o = val as Record<string, unknown>;
    return (
        ("en" in o && typeof o.en === "string") ||
        ("so" in o && typeof o.so === "string") ||
        ("ar" in o && typeof o.ar === "string")
    );
}

/**
 * Translate any value:
 * - If it's a detected localized object, pick the locale with fallback
 * - Otherwise return as-is (machine translation handled separately in /lib/dynamic-translator.ts)
 */
function translateValue(val: unknown, locale: Locale, opts: Required<TranslatorOptions>): unknown {
    if (opts.autoDetectLocalizedObjects && isLocalizedObject(val)) {
        return pickLocale(val, locale);
    }
    return val;
}

/**
 * Recursively translate any data shape (objects/arrays/primitives).
 * - Localizes known text fields (by name) if their value is localized.
 * - Translates category fields (by name) using trCategory.
 * - Leaves everything else as-is (so dynamic-translator can handle plain text later).
 */
export function translateData<T>(data: T, locale: Locale, options?: TranslatorOptions): T {
    const opts = { ...DEFAULT_OPTIONS, ...(options || {}) };

    const walk = (node: unknown): unknown => {
        if (Array.isArray(node)) {
            return node.map((child) => walk(child));
        }

        if (node && typeof node === "object") {
            const src = node as Record<string, unknown>;
            const out: Record<string, unknown> = {};

            for (const [key, value] of Object.entries(src)) {
                // 1) Category keys → localized labels
                if (opts.categoryFieldNames.includes(key) && typeof value === "string") {
                    out[key] = trCategory(locale, value);
                    continue;
                }

                // 2) Named localized fields → pick locale if value is localized
                if (opts.localizedFieldNames.includes(key)) {
                    out[key] = translateValue(value, locale, opts);
                    continue;
                }

                // 3) Recurse or keep
                if (typeof value === "object" && value !== null) {
                    if (opts.autoDetectLocalizedObjects && isLocalizedObject(value)) {
                        out[key] = pickLocale(value, locale);
                    } else {
                        out[key] = walk(value);
                    }
                } else {
                    out[key] = value;
                }
            }

            return out;
        }

        // Primitive
        return node;
    };

    return walk(data) as T;
}

/**
 * Convenience alias
 */
export const translator = translateData;
