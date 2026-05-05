const CAUSE_KEYWORDS = [
  "원인", "배경", "때문", "영향", "고환율", "고유가", "FOMO",
  "기반", "으로 인해", "에 따라", "여파", "촉발", "이유", "결과",
  "상승", "하락", "증가", "감소", "정책", "규제", "발표",
];

const RISK_KEYWORDS = [
  "우려", "리스크", "불안", "갈등", "위기", "비용", "견제",
  "문제", "부담", "취약", "경고", "폭락", "위험", "손실",
  "심화", "악화", "둔화", "침체", "충격", "압박", "불확실",
];

function splitSentences(text: string): string[] {
  return text
    .replace(/([.!?。！？])\s+/g, "$1\n")
    .split(/\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 4);
}

function scoreKeywords(sentence: string, keywords: string[]): number {
  return keywords.filter((kw) => sentence.includes(kw)).length;
}

export function generateStructuredSummary(text: string): string {
  if (!text.trim()) return "";

  const sentences = splitSentences(text);

  if (sentences.length === 0) return "";

  if (sentences.length === 1) {
    return [
      `핵심: ${sentences[0]}`,
      "배경: (원문에 배경 정보를 추가하면 자동 분석됩니다)",
      "시사점: (원문에 시사점 관련 내용을 추가하면 자동 분석됩니다)",
    ].join("\n");
  }

  const used = new Set<number>();

  const causeScores = sentences.map((s) => scoreKeywords(s, CAUSE_KEYWORDS));
  const riskScores = sentences.map((s) => scoreKeywords(s, RISK_KEYWORDS));

  const bestCauseIdx = causeScores.reduce(
    (best, score, i) => (score > causeScores[best] ? i : best),
    0
  );
  const bestRiskIdx = riskScores.reduce(
    (best, score, i) => (score > riskScores[best] ? i : best),
    0
  );

  const hasCause = causeScores[bestCauseIdx] > 0;
  const hasRisk = riskScores[bestRiskIdx] > 0;

  let line2Idx = hasCause ? bestCauseIdx : -1;
  let line3Idx =
    hasRisk && bestRiskIdx !== line2Idx ? bestRiskIdx : -1;

  const line1Idx = sentences.findIndex(
    (_, i) => i !== line2Idx && i !== line3Idx
  );
  used.add(line1Idx >= 0 ? line1Idx : 0);

  if (line2Idx === -1 || line2Idx === (line1Idx >= 0 ? line1Idx : 0)) {
    line2Idx = sentences.findIndex((_, i) => !used.has(i));
  }
  used.add(line2Idx >= 0 ? line2Idx : 0);

  if (line3Idx === -1 || used.has(line3Idx)) {
    line3Idx = sentences.findIndex((_, i) => !used.has(i));
    if (line3Idx === -1) line3Idx = sentences.length - 1;
  }

  const l1 = sentences[line1Idx >= 0 ? line1Idx : 0];
  const l2 = sentences[line2Idx >= 0 ? line2Idx : 0];
  const l3 = sentences[line3Idx];

  return [`핵심: ${l1}`, `배경: ${l2}`, `시사점: ${l3}`].join("\n");
}

export function extractThreeLineSummary(text: string): string {
  return generateStructuredSummary(text);
}
