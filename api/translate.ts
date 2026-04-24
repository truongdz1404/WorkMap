import type { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

dotenv.config({ override: false });

const translateTexts = async (texts: string[], sourceLanguage: string, targetLanguage: string) => {
    const apiKey = process.env.AZURE_TRANSLATOR_KEY || process.env.VITE_AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION || process.env.VITE_AZURE_TRANSLATOR_REGION;

    if (!apiKey || !region) {
        throw new Error('AZURE_TRANSLATOR_KEY and AZURE_TRANSLATOR_REGION are not configured');
    }

    if (sourceLanguage !== 'auto' && sourceLanguage === targetLanguage) {
        return texts;
    }

    const body = texts.map(text => ({ Text: text }));
    const fromParam = sourceLanguage && sourceLanguage !== 'auto' ? `&from=${sourceLanguage}` : '';
    const url = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${targetLanguage}${fromParam}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Ocp-Apim-Subscription-Region': region,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw new Error(`Azure Translator failed with status ${response.status}`);
    }

    const data = await response.json();
    const translations = data.map((item: { translations?: Array<{ text?: string }> }) =>
        item.translations?.[0]?.text || ''
    );
    return texts.map((text, index) => translations[index] || text);
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { texts, sourceLanguage = 'auto', targetLanguage } = req.body ?? {};

        if (!Array.isArray(texts) || texts.some((text) => typeof text !== 'string')) {
            return res.status(400).json({ error: 'texts must be an array of strings' });
        }

        if (targetLanguage !== 'vi' && targetLanguage !== 'en') {
            return res.status(400).json({ error: 'targetLanguage must be vi or en' });
        }

        const translations = await translateTexts(texts, sourceLanguage, targetLanguage);
        return res.json({ translations });
    } catch (error) {
        console.error('Translation error:', error);
        return res.status(500).json({ error: 'Failed to translate text' });
    }
}
