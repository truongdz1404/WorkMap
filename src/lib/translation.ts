import type { Language, LocalizedText } from '../types';

const TRANSLATE_ENDPOINT = '/api/translate';

const translationCache = new Map<string, string>();
const pendingTranslations = new Map<string, Promise<string>>();

export function detectLanguage(text: string): Language {
    const normalizedText = text.toLowerCase();
    const vietnameseMarks = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
    if (vietnameseMarks.test(normalizedText)) {
        return 'vi';
    }

    const vietnameseWords = /\b(chào|không|được|mình|rất|cảm ơn|xin|là|và|nhưng|nếu|với|đang|đã)\b/i;
    return vietnameseWords.test(normalizedText) ? 'vi' : 'en';
}

const getCacheKey = (text: string, sourceLanguage: Language | 'auto', targetLanguage: Language) => {
    return `${sourceLanguage}->${targetLanguage}:${text}`;
};

const normalizeTranslations = (value: unknown, expectedLength: number) => {
    if (Array.isArray(value)) {
        return value.map((item) => (typeof item === 'string' ? item : '')).slice(0, expectedLength);
    }

    if (value && typeof value === 'object' && 'translations' in value) {
        const translations = (value as { translations?: unknown }).translations;
        if (Array.isArray(translations)) {
            return translations.map((item) => (typeof item === 'string' ? item : '')).slice(0, expectedLength);
        }
    }

    return [] as string[];
};

async function requestTranslations(
    texts: string[],
    sourceLanguage: Language | 'auto',
    targetLanguage: Language,
): Promise<string[]> {
    const response = await fetch(TRANSLATE_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ texts, sourceLanguage, targetLanguage }),
    });

    if (!response.ok) {
        throw new Error(`Translation request failed with status ${response.status}`);
    }

    const data = await response.json();
    const translations = normalizeTranslations(data, texts.length);
    return texts.map((text, index) => translations[index] ?? text);
}

export async function translateText(
    text: string,
    options: { targetLanguage: Language; sourceLanguage?: Language },
): Promise<string> {
    const trimmedText = text.trim();
    if (!trimmedText) {
        return text;
    }

    const sourceLanguage = options.sourceLanguage ?? detectLanguage(text);
    if (sourceLanguage === options.targetLanguage) {
        return text;
    }

    const cacheKey = getCacheKey(text, sourceLanguage, options.targetLanguage);
    const cachedValue = translationCache.get(cacheKey);
    if (cachedValue) {
        return cachedValue;
    }

    const pendingValue = pendingTranslations.get(cacheKey);
    if (pendingValue) {
        return pendingValue;
    }

    const request = requestTranslations([text], sourceLanguage, options.targetLanguage)
        .then(([translation]) => {
            translationCache.set(cacheKey, translation);
            pendingTranslations.delete(cacheKey);
            return translation;
        })
        .catch((error) => {
            pendingTranslations.delete(cacheKey);
            throw error;
        });

    pendingTranslations.set(cacheKey, request);
    return request;
}

export async function translateTexts(
    texts: string[],
    options: { targetLanguage: Language; sourceLanguage?: Language },
): Promise<string[]> {
    if (texts.length === 0) {
        return [];
    }

    const sourceLanguage = options.sourceLanguage ?? 'auto';
    if (sourceLanguage !== 'auto' && sourceLanguage === options.targetLanguage) {
        return texts;
    }

    const translations = await requestTranslations(texts, sourceLanguage, options.targetLanguage);
    texts.forEach((text, index) => {
        const cacheKey = getCacheKey(text, sourceLanguage, options.targetLanguage);
        translationCache.set(cacheKey, translations[index] ?? text);
    });

    return translations;
}

export function getLocalizedText(
    text: string,
    translations: LocalizedText | undefined,
    language: Language,
): string {
    return translations?.[language] ?? text;
}
