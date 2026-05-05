import { useParams, useLocation, Link } from "wouter";
import { useRecords } from "../hooks/useRecords";

const LABEL_MAP: Record<string, string> = {
  "핵심:": "핵심 사건",
  "배경:": "원인·배경",
  "시사점:": "의미·시사점",
};

function parseSummaryLines(raw: string) {
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((line) => {
      const prefix = Object.keys(LABEL_MAP).find((k) => line.startsWith(k));
      if (prefix) {
        return { label: LABEL_MAP[prefix], text: line.slice(prefix.length).trim() };
      }
      return { label: null, text: line };
    });
}

const BADGE_COLORS = ["bg-indigo-500", "bg-blue-400", "bg-sky-400"];

export default function Detail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getRecord, deleteRecord } = useRecords();

  const record = getRecord(params.id);

  if (!record) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20 text-gray-400">
        <p className="text-3xl mb-2">🔍</p>
        <p className="text-sm">기록을 찾을 수 없습니다.</p>
        <Link href="/records" className="mt-4 inline-block text-sm text-black underline">목록으로</Link>
      </div>
    );
  }

  function handleDelete() {
    if (confirm("이 기록을 삭제하시겠습니까?")) {
      deleteRecord(record!.id);
      navigate("/records");
    }
  }

  const summaryLines = parseSummaryLines(record.threeLineSummary);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate("/records")} className="text-gray-500 hover:text-black text-sm">
          ← 목록
        </button>
      </div>

      {record.title && (
        <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{record.title}</h1>
      )}

      <div className="flex items-center gap-2 mb-5">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${record.member === "A" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
          멤버 {record.member}
        </span>
        <span className="text-xs text-gray-400">{record.date}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">
          {new Date(record.createdAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      <div className="space-y-3">
        <section className="bg-gray-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">원문 정리</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{record.originalSummary}</p>
        </section>

        <section className="bg-indigo-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">핵심 요약</h2>
          {summaryLines.length > 0 ? (
            <ol className="space-y-3">
              {summaryLines.map((item, idx) => (
                <li key={idx} className="flex gap-3 text-sm leading-relaxed">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white mt-0.5 ${BADGE_COLORS[idx] ?? "bg-gray-400"}`}>
                    {idx + 1}
                  </span>
                  <div>
                    {item.label && (
                      <span className="text-xs font-semibold text-indigo-400 mr-1">[{item.label}]</span>
                    )}
                    <span className="text-gray-800">{item.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-400">핵심 요약이 없습니다.</p>
          )}
        </section>

        {record.insight && (
          <section className="bg-amber-50 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">한줄 인사이트</h2>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">💡 {record.insight}</p>
          </section>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <Link href={`/form/${record.id}`} className="flex-1 text-center bg-gray-100 text-gray-800 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
          수정
        </Link>
        <button onClick={handleDelete} className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
          삭제
        </button>
      </div>
    </div>
  );
}
