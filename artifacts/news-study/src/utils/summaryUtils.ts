export function extractThreeLineSummary(text: string): string {
  if (!text.trim()) return "";

  const sentences = text
    .replace(/([.!?。！？])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return sentences.slice(0, 3).join("\n");
}
