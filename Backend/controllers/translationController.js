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

    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return text;
  } catch (error) {
    console.warn(`MyMemory translation failed for "${text}":`, error.message);
    return text;
  }
}

export async function translateTexts(req, res) {
  const { texts, targetLang = 'hi' } = req.body;

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: 'texts must be a non-empty array.' });
  }

  const sourceCode = LANGUAGE_CODE_MAP.en;
  const targetCode = LANGUAGE_CODE_MAP[targetLang];

  if (!targetCode) {
    return res.status(400).json({ error: `Unsupported target language: ${targetLang}` });
  }

  try {
    const translations = await Promise.all(
      texts.map((text) => translateWithMyMemory(text, sourceCode, targetCode))
    );

    return res.json({ translations });
  } catch (error) {
    console.error('Translation proxy error:', error);
    return res.status(500).json({ error: error.message || 'Translation proxy failed.' });
  }
}
