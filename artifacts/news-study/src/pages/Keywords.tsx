import { useState } from "react";

const STOP_WORDS = new Set([
  "이", "가", "을", "를", "의", "에", "에서", "으로", "로", "와", "과",
  "하고", "이고", "이며", "또한", "하지만", "그러나", "따라서", "그리고",
  "있다", "없다", "하다", "되다", "이다", "아니다", "있는", "없는", "하는",
  "되는", "이런", "저런", "그런", "이번", "지난", "올해", "최근", "현재",
  "위해", "때문", "통해", "대한", "관한", "따른", "의한", "부터", "까지",
  "것으로", "것이", "것을", "수도", "수가", "수는", "수에", "국내", "국외",
  "한편", "반면", "특히", "이에", "이를", "이와", "해당", "관련",
]);

const STOP_ENDINGS = ["했다", "한다", "됩니다", "입니다", "습니다", "합니다",
  "하며", "되며", "이며", "지며", "것으로", "으며", "이나", "거나", "라고",
  "라며", "으로", "면서", "으며", "있어", "없어", "한다고", "된다고"];

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
    const token = raw.replace(/[은는이가을를에의으로와과,.:;!?'"]+$/g, "")
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
  if (candidates.length === 0) return ["(키워드 없음)"];

  const english = candidates.filter(isEnglishOrMixed);
  const korean = candidates.filter((c) => !isEnglishOrMixed(c));

  const picked: string[] = [];

  if (english.length > 0) picked.push(english[0]);
  if (korean.length > 0) picked.push(korean[0]);
  if (picked.length < 2 && korean.length > 1) picked.push(korean[1]);
  if (picked.length === 0 && candidates.length > 0) picked.push(candidates[0]);

  return picked.slice(0, 2);
}

interface Item {
  num: number;
  text: string;
  keywords: string[];
}

function parseItems(input: string): Item[] {
  const pattern = /\((\d+)\)\s*/g;
  const items: Item[] = [];
  const matches = [...input.matchAll(/\((\d+)\)\s*([\s\S]*?)(?=\(\d+\)|$)/g)];

  for (const match of matches) {
    const num = parseInt(match[1], 10);
    const text = match[2].trim();
    if (!text) continue;
    items.push({ num, text, keywords: pickKeywords(extractCandidates(text)) });
  }

  return items;
}

function formatOutput(items: Item[]): string {
  return items.map((item) => `(${item.num}) ${item.keywords.join(", ")}`).join("\n");
}

export default function Keywords() {
  const [input, setInput] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [copied, setCopied] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  function handleExtract() {
    const parsed = parseItems(input);
    setItems(parsed);
    setCopied(false);
    setEditingIdx(null);
  }

  function handleCopy() {
    if (items.length === 0) return;
    navigator.clipboard.writeText(formatOutput(items)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function startEdit(idx: number) {
    setEditingIdx(idx);
    setEditValue(items[idx].keywords.join(", "));
  }

  function commitEdit(idx: number) {
    const newKeywords = editValue
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
      .slice(0, 2);
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, keywords: newKeywords } : item))
    );
    setEditingIdx(null);
  }

  const output = formatOutput(items);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">키워드 추출</h1>
      <p className="text-sm text-gray-400 mb-5">(1) (2) (3) 형식으로 입력하면 항목별 핵심 키워드를 추출합니다.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">뉴스 요약 입력</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={"(1) 빚투가 늘어나고 있다. 고령층 투자자 비중 증가...\n(2) 지방선거 대진표 확정...\n(3) LCC 비용 증가로 수익성 악화..."}
            rows={7}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 resize-none font-mono"
          />
        </div>

        <button
          onClick={handleExtract}
          disabled={!input.trim()}
          className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors ${
            input.trim()
              ? "bg-black text-white hover:bg-gray-800"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          ✦ 키워드 추출
        </button>

        {items.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500">추출 결과 <span className="font-normal text-gray-400">(클릭하여 수정)</span></label>
              <button
                onClick={handleCopy}
                className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {copied ? "✓ 복사됨" : "복사"}
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              {items.map((item, idx) => (
                <div key={item.num} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs font-bold text-gray-400 flex-shrink-0 w-6">({item.num})</span>
                  {editingIdx === idx ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => commitEdit(idx)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEdit(idx);
                        if (e.key === "Escape") setEditingIdx(null);
                      }}
                      className="flex-1 text-sm border-b border-gray-400 outline-none bg-transparent py-0.5"
                      placeholder="키워드1, 키워드2"
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(idx)}
                      className="flex-1 text-left text-sm text-gray-800 hover:text-black"
                    >
                      {item.keywords.map((kw, ki) => (
                        <span key={ki}>
                          <span className="font-semibold">{kw}</span>
                          {ki < item.keywords.length - 1 && <span className="text-gray-400">, </span>}
                        </span>
                      ))}
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 mb-1.5">복사용 텍스트</p>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{output}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
