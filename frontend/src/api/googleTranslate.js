const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TRANSLATE_URL = `${API_BASE_URL}/translate`;
const BLOCKED_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "IFRAME", "INPUT", "OPTION", "SELECT", "NOSCRIPT"]);

const LANGUAGE_CODE_MAP = {
  en: "en",
  hi: "hi",
  bn: "bn",
  gu: "gu",
  kn: "kn",
  ml: "ml",
  mr: "mr",
  pa: "pa",
  ta: "ta",
  te: "te",
  ur: "ur",
  or: "or",
  as: "as",
  sd: "sd",
  ne: "ne",
};

const originals = new WeakMap();
const NON_LATIN_SCRIPT = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF\u0E00-\u0E7F\u0F00-\u0FFF\u1000-\u109F\u1100-\u11FF\u1E00-\u1EFF]/;
const RTL_LANGUAGES = new Set(["ur", "sd", "ar", "fa", "he", "iw"]);

function isTranslatableTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const text = node.nodeValue?.trim();
  if (!text) return false;

  const parent = node.parentElement;
  if (!parent || BLOCKED_TAGS.has(parent.tagName)) return false;
  if (parent.closest(".notranslate")) return false;

  // Preserve translated nodes so a user can switch languages again
  // and restore back to English.
  if (originals.has(node)) {
    return true;
  }

  // Skip nodes that already contain non-English scripts until they have
  // been saved as originals. This avoids mangling names and mixed-language content.
  const englishLike = /^[\x00-\x7F\s.,!?\-–—'"()0-9]+$/;
  if (!englishLike.test(text) && NON_LATIN_SCRIPT.test(text)) {
    return false;
  }

  return true;
}

function collectTextNodes(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isTranslatableTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    },
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }
  return nodes;
}

function saveOriginalText(node) {
  if (!originals.has(node)) {
    originals.set(node, node.nodeValue);
  }
}

function restoreOriginalText(node) {
  if (originals.has(node)) {
    node.nodeValue = originals.get(node);
  }
}

async function translateTextBlocks(texts, sourceLang, targetLang) {
  const targetCode = LANGUAGE_CODE_MAP[targetLang];

  if (!targetCode) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const payload = {
    texts,
    sourceLang,
    targetLang,
  };

  try {
    const response = await fetch(TRANSLATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json().catch((error) => {
      throw new Error(`Translation API response parsing failed: ${error.message}`);
    });

    if (!response.ok) {
      const errorText = typeof json === "string" ? json : json?.error || JSON.stringify(json);
      throw new Error(`Translation API error: ${response.status} ${errorText}`);
    }

    if (!Array.isArray(json.translations) || json.translations.length === 0) {
      throw new Error(`Translation API returned invalid response: ${JSON.stringify(json)}`);
    }

    return json.translations;
  } catch (error) {
    console.warn('Translation API failed, keeping original text:', error.message);
    return texts;
  }
}

const CHUNK_SIZE = 25;

export async function translatePage(targetLang = "hi") {
  if (typeof window === "undefined") return;

  const previousLang = document.documentElement.lang || localStorage.getItem("lang") || "en";
  const direction = RTL_LANGUAGES.has(targetLang) ? "rtl" : "ltr";

  if (targetLang === "en") {
    document.documentElement.lang = "en";
    document.documentElement.dir = direction;
    const nodes = collectTextNodes();
    nodes.forEach(restoreOriginalText);
    return;
  }

  const nodes = collectTextNodes();
  if (nodes.length === 0) return;

  const nodeGroups = [];
  let currentGroup = [];

  nodes.forEach((node) => {
    saveOriginalText(node);
    currentGroup.push(node);
    if (currentGroup.length >= CHUNK_SIZE) {
      nodeGroups.push(currentGroup);
      currentGroup = [];
    }
  });
  if (currentGroup.length) nodeGroups.push(currentGroup);

  try {
    for (const group of nodeGroups) {
      const texts = group.map((node) => node.nodeValue.trim());
      const translated = await translateTextBlocks(texts, previousLang, targetLang);
      translated.forEach((value, index) => {
        if (typeof value === "string") {
          group[index].nodeValue = value;
        }
      });
    }

    document.documentElement.lang = targetLang;
    document.documentElement.dir = direction;
  } catch (error) {
    nodes.forEach(restoreOriginalText);
    throw error;
  }
}
