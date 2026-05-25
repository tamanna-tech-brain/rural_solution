const API_KEY = import.meta.env.VITE_HF_API_KEY;
const TRANSLATE_URL = "https://api-inference.huggingface.co/models/ai4bharat/indictrans2";
const BLOCKED_TAGS = new Set(["SCRIPT", "STYLE", "TEXTAREA", "CODE", "PRE", "IFRAME", "INPUT", "OPTION", "SELECT", "NOSCRIPT"]);

const LANGUAGE_CODE_MAP = {
  en: "eng",
  hi: "hin",
  bn: "ben",
  gu: "guj",
  kn: "kan",
  ml: "mal",
  mr: "mar",
  pa: "pan",
  ta: "tam",
  te: "tel",
  ur: "urd",
  or: "ori",
  as: "asm",
  sd: "snd",
  ne: "nep",
};

const originals = new WeakMap();

function isTranslatableTextNode(node) {
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;
  const text = node.nodeValue?.trim();
  if (!text) return false;

  const parent = node.parentElement;
  if (!parent || BLOCKED_TAGS.has(parent.tagName)) return false;
  if (parent.closest(".notranslate")) return false;

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

function normalizeHfResponse(responseJson) {
  if (Array.isArray(responseJson)) {
    return responseJson.map((item) => {
      if (typeof item === "string") return item;
      if (item?.generated_text) return item.generated_text;
      if (item?.translation_text) return item.translation_text;
      return "";
    });
  }
  if (typeof responseJson === "object" && responseJson !== null) {
    if (responseJson.generated_text) return [responseJson.generated_text];
    if (responseJson.translation_text) return [responseJson.translation_text];
  }
  return [];
}

async function translateTextBlocks(texts, targetLang) {
  const hfTarget = LANGUAGE_CODE_MAP[targetLang];
  const hfSource = LANGUAGE_CODE_MAP.en;

  if (!hfTarget) {
    throw new Error(`Unsupported target language: ${targetLang}`);
  }

  const payload = {
    inputs: texts,
    parameters: {
      task: "translation",
      source_language: hfSource,
      target_language: hfTarget,
    },
  };

  const response = await fetch(TRANSLATE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    const errorText = typeof json === "string" ? json : JSON.stringify(json);
    throw new Error(`IndicTrans2 API error: ${response.status} ${errorText}`);
  }

  return normalizeHfResponse(json);
}

const CHUNK_SIZE = 25;

export async function translatePage(targetLang = "hi") {
  if (typeof window === "undefined") return;

  if (targetLang === "en") {
    const nodes = collectTextNodes();
    nodes.forEach(restoreOriginalText);
    return;
  }

  if (!API_KEY) {
    console.warn("Missing VITE_HF_API_KEY environment variable.");
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

  for (const group of nodeGroups) {
    const texts = group.map((node) => node.nodeValue.trim());
    const translated = await translateTextBlocks(texts, targetLang);
    translated.forEach((value, index) => {
      if (typeof value === "string") {
        group[index].nodeValue = value;
      }
    });
  }
}
