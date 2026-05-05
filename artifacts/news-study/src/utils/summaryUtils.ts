const STOP_WORDS = new Set([
  "이", "가", "을", "를", "의", "에", "에서", "으로", "로", "와", "과",
  "하고", "이고", "이며", "또한", "하지만", "그러나", "따라서", "그리고",
  "있다", "없다", "하다", "되다", "이다", "아니다", "있는", "없는", "하는",
  "되는", "이런", "저런", "그런", "이번", "지난", "올해", "최근", "현재",
  "위해", "때문", "통해", "대한", "관한", "따른", "의한", "부터", "까지",
  "것으로", "것이", "것을", "수도", "수가", "수는", "수에", "국내", "국외",
  "한편", "반면", "특히", "이에", "이를", "이와", "해당", "관련",
]);

const STOP_ENDINGS = [
  "했다", "한다", "됩니다", "입니다", "습니다", "합니다",
  "하며", "되며", "이며", "지며", "것으로", "으며", "이나", "거나",
  "라고", "라며", "으로", "면서", "있어", "없어", "한다고", "된다고",
];

function isStopWord(token: string): boolean {
  if (STOP_WORDS.has(token)) return true;
  if (token.length <= 1) return true;
  if (STOP_ENDINGS.some((e) => token.endsWith(e))) return true;
  return false;
}

function isEnglishOrMixed(token: string): boolean {
  return /[A-Za-z]/.test(token);
}

function extractCandidates(text: string): string[] {
  const cleaned = text
    .replace(/["""''「」『』【】]/g, "")
    .replace(/[,，、。.!?…·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const tokens = cleaned.split(/\s+/);
  const candidates: string[] = [];
  const seen = new Set<string>();

  for (const raw of tokens) {
    const token = raw
      .replace(/[은는이가을를에의으로와과,.:;!?'"]+$/g, "")
      .replace(/^[은는이가을를에의으로와과,.:;!?'"]+/g, "");
    if (!token || token.length < 2) continue;
    if (seen.has(token)) continue;
    seen.add(token);

    if (isEnglishOrMixed(token)) {
      candidates.push(token);
      continue;
    }
    if (isStopWord(token)) continue;
    if (token.length >= 2 && token.length <= 6) {
      candidates.push(token);
    }
  }

  return candidates;
}

function pickKeywords(candidates: string[]): string[] {
  if (candidates.length === 0) return [];

  const english = candidates.filter(isEnglishOrMixed);
  const korean = candidates.filter((c) => !isEnglishOrMixed(c));

  const picked: string[] = [];
  if (english.length > 0) picked.push(english[0]);
  if (korean.length > 0) picked.push(korean[0]);
  if (picked.length < 2 && korean.length > 1) picked.push(korean[1]);
  if (picked.length === 0 && candidates.length > 0) picked.push(candidates[0]);

  return picked.slice(0, 2);
}

export function generateStructuredSummary(text: string): string {
  if (!text.trim()) return "";

  const matches = [
    ...text.matchAll(/\((\d+)\)\s*([\s\S]*?)(?=\(\d+\)|$)/g),
  ];

  if (matches.length === 0) {
    const candidates = extractCandidates(text);
    const keywords = pickKeywords(candidates);
    return keywords.length > 0 ? `(1) ${keywords.join(", ")}` : "";
  }

  return matches
    .map((match) => {
      const num = match[1];
      const body = match[2].trim();
      const keywords = pickKeywords(extractCandidates(body));
      return `(${num}) ${keywords.length > 0 ? keywords.join(", ") : "키워드 없음"}`;
    })
    .join("\n");
}

export function extractThreeLineSummary(text: string): string {
  return generateStructuredSummary(text);
}
