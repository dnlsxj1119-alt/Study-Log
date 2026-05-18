import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useRecords } from "../hooks/useRecords";

export default function Detail() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getRecord, deleteRecord, isMutating } = useRecords();
  const [deleteError, setDeleteError] = useState("");

  const record = getRecord(params.id);

  if (!record) {
    return (
      <div className="p-6 max-w-lg mx-auto text-center py-20 text-gray-400">
        <p className="text-3xl mb-2">🔍</p>
        <p className="text-sm">기록을 찾을 수 없습니다.</p>
        <Link href="/records" className="mt-4 inline-block text-sm text-black underline">
          목록으로
        </Link>
      </div>
    );
  }

  async function handleDelete() {
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;
    setDeleteError("");
    try {
      await deleteRecord(record!.id);
      navigate("/records");
    } catch {
      setDeleteError("삭제 실패: 서버에 연결할 수 없습니다.");
    }
  }

  const summaryLines = record.threeLineSummary
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => navigate("/records")}
          className="text-gray-500 hover:text-black text-sm"
        >
          ← 목록
        </button>
      </div>

      {record.title && (
        <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
          {record.title}
        </h1>
      )}

      <div className="flex items-center gap-2 mb-5">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            record.member === "A"
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          멤버 {record.member}
        </span>
        <span className="text-xs text-gray-400">{record.date}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">
          {new Date(record.createdAt).toLocaleString("ko-KR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>

      <div className="space-y-3">
        <section className="bg-gray-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            원문 정리
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
            {record.originalSummary}
          </p>
        </section>

        <section className="bg-indigo-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-3">
            핵심 요약
          </h2>
          {summaryLines.length > 0 ? (
            <ul className="space-y-2">
              {summaryLines.map((line, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-gray-800 leading-relaxed">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-400 text-white text-[10px] font-bold flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{line.replace(/^\(\d+\)\s*/, "")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">핵심 요약이 없습니다.</p>
          )}
        </section>

        {record.insight && (
          <section className="bg-amber-50 rounded-xl p-4">
            <h2 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
              한줄 인사이트
            </h2>
            <p className="text-sm text-gray-800 leading-relaxed font-medium">
              💡 {record.insight}
            </p>
          </section>
        )}
      </div>

      {deleteError && (
        <p className="mt-4 text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2.5">
          ⚠ {deleteError}
        </p>
      )}

      <div className="flex gap-3 mt-6">
        <Link
          href={`/form/${record.id}`}
          className="flex-1 text-center bg-gray-100 text-gray-800 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          수정
        </Link>
        <button
          onClick={handleDelete}
          disabled={isMutating}
          className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {isMutating ? "삭제 중..." : "삭제"}
        </button>
      </div>
    </div>
  );
}
