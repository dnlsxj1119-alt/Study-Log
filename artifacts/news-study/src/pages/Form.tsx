import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useRecords } from "../hooks/useRecords";
import { getTodayString, isPast } from "../utils/dateUtils";
import type { Member, Record } from "../types";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function Form() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { getRecord, addRecord, updateRecord, isMutating } = useRecords();

  const isEdit = !!params.id;
  const existing = params.id ? getRecord(params.id) : undefined;

  const [member, setMember] = useState<Member>(existing?.member ?? "A");
  const [date, setDate] = useState(existing?.date ?? getTodayString());
  const [title, setTitle] = useState(existing?.title ?? "");
  const [originalSummary, setOriginalSummary] = useState(existing?.originalSummary ?? "");
  const [threeLineSummary, setThreeLineSummary] = useState(existing?.threeLineSummary ?? "");
  const [insight, setInsight] = useState(existing?.insight ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setMember(existing.member);
      setDate(existing.date);
      setTitle(existing.title);
      setOriginalSummary(existing.originalSummary);
      setThreeLineSummary(existing.threeLineSummary);
      setInsight(existing.insight ?? "");
    }
  }, [params.id]);

  const isDatePast = !isEdit && isPast(date);
  const isDateFuture = !isEdit && date > getTodayString();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isDateFuture) { setError("미래 날짜에는 기록을 추가할 수 없습니다."); return; }
    if (!originalSummary.trim()) { setError("원문 정리를 입력해주세요."); return; }
    if (!threeLineSummary.trim()) { setError("핵심 요약을 입력해주세요."); return; }

    setError("");

    try {
      if (isEdit && existing) {
        const updated: Record = {
          ...existing,
          member,
          date,
          title,
          originalSummary,
          threeLineSummary,
          insight,
        };
        await updateRecord(updated);
        navigate(`/detail/${existing.id}`);
      } else {
        const record: Record = {
          id: generateId(),
          member,
          date,
          title,
          originalSummary,
          threeLineSummary,
          insight,
          createdAt: new Date().toISOString(),
          completed: true,
          editedAfter: false,
        };
        await addRecord(record);
        navigate("/records");
      }
    } catch {
      setError("저장 실패: 서버에 연결할 수 없습니다. VITE_API_BASE_URL 환경변수를 확인하세요.");
    }
  }

  const isSubmitDisabled = isDateFuture || isMutating;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button
          type="button"
          onClick={() => navigate(isEdit && existing ? `/detail/${existing.id}` : "/records")}
          className="text-gray-500 hover:text-black text-sm"
        >
          ← 돌아가기
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-5">{isEdit ? "기록 수정" : "새 기록 작성"}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">멤버</label>
          <div className="flex gap-2">
            {(["A", "B"] as Member[]).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMember(m)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
                  member === m
                    ? m === "A"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-green-500 text-white border-green-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                멤버 {m}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">날짜</label>
          <input
            type="date"
            value={date}
            max={!isEdit ? getTodayString() : undefined}
            onChange={(e) => { setDate(e.target.value); setError(""); }}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />
          {!isEdit && isDatePast && (
            <p className="mt-1.5 text-xs text-amber-600 flex items-center gap-1">
              <span>ℹ</span> 과거 날짜 기록은 저장되지만 완료율에는 반영되지 않습니다.
            </p>
          )}
          {!isEdit && !isDatePast && !isDateFuture && (
            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
              <span>✓</span> 오늘 날짜입니다. 완료율에 반영됩니다.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">기사 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            placeholder="예: 삼성전자, AI 반도체 투자 확대 발표"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">원문 정리</label>
          <textarea
            value={originalSummary}
            onChange={(e) => {
              setOriginalSummary(e.target.value);
              setError("");
            }}
            placeholder={"(1) 첫 번째 기사 내용...\n(2) 두 번째 기사 내용...\n(3) 세 번째 기사 내용..."}
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">핵심 요약</label>
          <textarea
            value={threeLineSummary}
            onChange={(e) => {
              setThreeLineSummary(e.target.value);
              setError("");
            }}
            placeholder={"(1) 핵심 포인트 첫 번째\n(2) 핵심 포인트 두 번째\n(3) 핵심 포인트 세 번째"}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            한줄 인사이트 <span className="font-normal text-gray-400">(선택)</span>
          </label>
          <input
            type="text"
            value={insight}
            onChange={(e) => setInsight(e.target.value)}
            placeholder="예: 노후 불안이 투자 리스크를 키우는 구조"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-300"
          />
          <p className="mt-1 text-xs text-gray-400">기사를 읽고 얻은 핵심 인사이트를 한 문장으로 적어보세요.</p>
        </div>

        {error && (
          <p className="text-red-500 text-xs flex items-start gap-1 bg-red-50 rounded-xl px-3 py-2.5 leading-relaxed">
            <span className="mt-0.5">⚠</span> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors mt-2 ${
            isSubmitDisabled
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isMutating ? "저장 중..." : isEdit ? "수정 완료" : "기록 저장"}
        </button>
      </form>
    </div>
  );
}
