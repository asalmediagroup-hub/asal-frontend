"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/components/language-provider"

interface TranslatedContent {
    [key: string]: string
}

/**
 * Hook to translate dynamic content from database
 * @param content - Object with keys to translate
 * @returns Translated content object
 */
export function useTranslatedContent<T extends Record<string, any>>(content: T | null | undefined): T | null {
    const { language, translateText } = useLanguage()
    const [translated, setTranslated] = useState<T | null>(null)
    const [isTranslating, setIsTranslating] = useState(false)

    useEffect(() => {
        if (!content) {
            setTranslated(null)
            return
        }

        // If English, return original content
        if (language === "eng") {
            setTranslated(content)
            return
        }

        // Translate all string fields
        const translateContent = async () => {
            setIsTranslating(true)
            const result: any = { ...content }

            const promises = Object.entries(content).map(async ([key, value]) => {
                if (typeof value === "string" && value.trim()) {
                    result[key] = await translateText(value)
                } else if (Array.isArray(value)) {
                    // Handle arrays of strings (like features)
                    result[key] = await Promise.all(
                        value.map((item) => (typeof item === "string" && item.trim() ? translateText(item) : item)),
                    )
                }
            })

            await Promise.all(promises)
            setTranslated(result as T)
            setIsTranslating(false)
        }

        translateContent()
    }, [content, language, translateText])

    return translated
}

/**
 * Hook to translate a single text value
 * @param text - Text to translate
 * @returns Translated text
 */
export function useTranslatedText(text: string | null | undefined): string {
    const { language, translateText } = useLanguage()
    const [translated, setTranslated] = useState<string>("")

    useEffect(() => {
        if (!text || !text.trim()) {
            setTranslated("")
            return
        }

        // If English, return original
        if (language === "eng") {
            setTranslated(text)
            return
        }

        // Translate
        translateText(text).then(setTranslated)
    }, [text, language, translateText])

    return translated || text || ""
}
