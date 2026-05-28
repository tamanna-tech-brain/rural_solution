import dotenv from 'dotenv';

dotenv.config();

const LANGUAGE_CODE_MAP = {
  en: 'en',
  hi: 'hi',
  bn: 'bn',
  gu: 'gu',
  kn: 'kn',
  ml: 'ml',
  mr: 'mr',
  pa: 'pa',
  ta: 'ta',
  te: 'te',
  ur: 'ur',
  or: 'or',
  as: 'as',
  sd: 'sd',
  ne: 'ne',
};

const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const GOOGLE_TRANSLATE_API = 'https://translate.googleapis.com/translate_a/single';

function isPlaceholderTranslation(candidate, sourceText) {
  if (typeof candidate !== 'string') return true;

  const normalized = candidate.trim();
  if (!normalized) return true;

  const lower = normalized.toLowerCase();
  if (/^(test|demo|sample|example|dummy)(\s|\d|$)/.test(lower)) return true;
  if (/^test\d*$/i.test(normalized)) return true;
  if (normalized === sourceText.trim()) return true;

  return false;
}

function pickBestTranslation(data, sourceText) {
  const directTranslation = data?.responseData?.translatedText;

  if (!isPlaceholderTranslation(directTranslation, sourceText)) {
    return directTranslation;
  }

  const matches = Array.isArray(data?.matches) ? data.matches : [];
  for (const match of matches) {
    const translated = typeof match?.translation === 'string' ? match.translation.trim() : '';
    if (!translated || isPlaceholderTranslation(translated, sourceText)) continue;

    if (translated !== sourceText.trim()) {
      return translated;
    }
  }

  return sourceText;
}

async function translateWithGoogle(text, sourceLang, targetLang) {
  if (sourceLang === targetLang || !text?.trim()) {
    return text;
  }

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang,
      tl: targetLang,
      dt: 't',
      q: text.substring(0, 500),
    });

    const response = await fetch(`${GOOGLE_TRANSLATE_API}?${params.toString()}`);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return null;
    }

    const translatedParts = data[0];
    if (!Array.isArray(translatedParts)) {
      return null;
    }

    const translatedText = translatedParts
      .map((part) => Array.isArray(part) ? part[0] : '')
      .filter(Boolean)
      .join('')
      .trim();

    if (translatedText && !isPlaceholderTranslation(translatedText, text)) {
      return translatedText;
    }

    return null;
  } catch (error) {
    console.warn(`Google translation failed for "${text}":`, error.message);
    return null;
  }
}

async function translateWithMyMemory(text, sourceLang, targetLang) {
  if (sourceLang === targetLang || !text?.trim()) {
    return text;
  }

  try {
    const params = new URLSearchParams({
      q: text.substring(0, 500),
      langpair: `${sourceLang}|${targetLang}`,
    });

    const response = await fetch(`${MYMEMORY_API}?${params.toString()}`);
    const data = await response.json();

    if (data?.responseStatus === 200) {
      const translatedText = pickBestTranslation(data, text);
      if (translatedText && translatedText !== text) {
        return translatedText;
      }
    }

    return text;
  } catch (error) {
    console.warn(`MyMemory translation failed for "${text}":`, error.message);
    return text;
  }
}

export async function translateTexts(req, res) {
  const { texts, targetLang = 'hi', sourceLang } = req.body;

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'texts must be a non-empty array.' });
  }

  const resolvedSourceLang = sourceLang || 'en';
  const sourceCode = LANGUAGE_CODE_MAP[resolvedSourceLang] || LANGUAGE_CODE_MAP.en;
  const targetCode = LANGUAGE_CODE_MAP[targetLang];

  if (!targetCode) {
    return res.status(400).json({ error: `Unsupported target language: ${targetLang}` });
  }

  try {
    const translations = await Promise.all(
      texts.map(async (text) => {
        const translated = await translateWithGoogle(text, sourceCode, targetCode);
        if (translated && translated !== text) {
          return translated;
        }

        return translateWithMyMemory(text, sourceCode, targetCode);
      })
    );

    return res.json({ translations });
  } catch (error) {
    console.error('Translation proxy error:', error);
    return res.status(500).json({ error: error.message || 'Translation proxy failed.' });
  }
}
