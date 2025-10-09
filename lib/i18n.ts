// /lib/i18n.ts
export type Locale = "en" | "so" | "ar";

/**
 * Returns the value for the chosen locale or falls back to English, then empty string.
 * Accepts either a plain string or a localized object { en?: string; so?: string; ar?: string }.
 */
export function pickLocale(val: unknown, locale: Locale): string {
    if (val && typeof val === "object") {
        const o = val as Record<string, unknown>;
        return (o[locale] as string) || (o["en"] as string) || "";
    }
    return (val as string) ?? "";
}

/**
 * Category translations for all languages.
 * Keep your API/category values as stable KEYS (e.g., "documentary"), not labels.
 */
const CATEGORY_LABELS: Record<Locale, Record<string, string>> = {
    en: {
        "documentary": "Documentary",
        "digital-content": "Digital Content",
        "commercial": "Commercial",
        "streaming": "Streaming Content",
        "life-event": "Life Event",
        "web-series": "Web Series",
    },
    so: {
        "documentary": "Dukumentari",
        "digital-content": "Nuxur Dijitaal",
        "commercial": "Xayeysiin",
        "streaming": "Nuxur Streaming",
        "life-event": "Dhacdo Nololeed",
        "web-series": "Taxane Web",
    },
    ar: {
        "documentary": "الوثائقي",
        "digital-content": "المحتوى الرقمي",
        "commercial": "إعلان",
        "streaming": "محتوى البث",
        "life-event": "حدث الحياة",
        "web-series": "سلسلة الويب",
    },
};

/**
 * Translate a category KEY (e.g., "documentary") to a localized label.
 * Falls back to English if the specific locale label is missing; finally falls back to the original key.
 */
export function trCategory(locale: Locale, cat?: string): string {
    if (!cat) return "";
    return CATEGORY_LABELS[locale][cat] || CATEGORY_LABELS["en"][cat] || cat;
}
