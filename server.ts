import dotenv from 'dotenv';
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(process.cwd(), '.env.local'), override: false });
dotenv.config({ path: path.join(process.cwd(), '.env'), override: false });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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

  app.post('/api/translate', async (req, res) => {
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
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "DayOneDay API is running" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
