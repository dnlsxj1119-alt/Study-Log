import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useRecords } from "../hooks/useRecords";
import { getTodayString, getDateBlockReason } from "../utils/dateUtils";
import type { Member, Record } from "../types";

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function Form() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { getRecord, addRecord, updateRecord } = useRecords();

  const isEdit = !!params.id;
  const existing = params.id ? getRecord(params.id) : undefined;
  const today = getTodayString();

  const [member, setMember] = useState<Member>(existing?.member ?? "A");
  const [date, setDate] = useState(existing?.date ?? today);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [originalSummary, setOriginalSummary] = useState(existing?.originalSummary ?? "");
  const [threeLineSummary, setThreeLineSummary] = useState(existing?.threeLineSummary ?? "");
  const [error, setError] = useState("");

  useEffect(() => {
    if (existing) {
      setMember(existing.member);
      setDate(existing.date);
      setTitle(existing.title);
      setOriginalSummary(existing.originalSummary);
      setThreeLineSummary(existing.threeLineSummary);
    }
  }, [params.id]);

  const dateBlockReason = !isEdit ? getDateBlockReason(date) : null;
  const isSubmitBlocked = !isEdit && dateBlockReason !== null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitBlocked) {
      setError(dateBlockReason!);
      return;
    }
    if (!title.trim()) { setError("제목을 입력해주세요."); return; }
    if (!originalSummary.trim()) { setError("원문 요약을 입력해주세요."); return; }
    if (!threeLineSummary.trim()) { setError("세 줄 요약을 입력해주세요."); return; }

    setError("");

    if (isEdit && existing) {
      const updated: Record = { ...existing, member, date, title, originalSummary, threeLineSummary };
      updateRecord(updated);
      navigate(`/detail/${existing.id}`);
    } else {
      const record: Record = {
        id: generateId(),
        member,
        date,
        title,
        originalSummary,
        threeLineSummary,
        createdAt: new Date().toISOString(),
      };
      addRecord(record);
      navigate("/records");
    }
  }

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
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">
            날짜
            {!isEdit && (
              <span className="ml-1.5 font-normal text-gray-400">(오늘 날짜만 새 기록 추가 가능)</span>
            )}
          </label>
          <input
            type="date"
            value={date}
            max={!isEdit ? today : undefined}
            onChange={(e) => {
              setDate(e.target.value);
              setError("");
            }}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
              !isEdit && dateBlockReason
                ? "border-red-300 bg-red-50 focus:border-red-400"
                : "border-gray-200 focus:border-gray-400"
            }`}
          />
          {!isEdit && dateBlockReason && (
            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {dateBlockReason}
            </p>
          )}
          {!isEdit && !dateBlockReason && (
            <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
              <span>✓</span> 오늘 날짜입니다. 기록을 추가할 수 있습니다.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">기사 제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            placeholder="기사 제목을 입력하세요"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">원문 요약</label>
          <textarea
            value={originalSummary}
            onChange={(e) => { setOriginalSummary(e.target.value); setError(""); }}
            placeholder="기사 내용을 요약해주세요"
            rows={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">세 줄 요약</label>
          <textarea
            value={threeLineSummary}
            onChange={(e) => { setThreeLineSummary(e.target.value); setError(""); }}
            placeholder="핵심 내용을 세 줄로 요약해주세요"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 resize-none"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitBlocked}
          className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-colors mt-2 ${
            isSubmitBlocked
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isEdit ? "수정 완료" : isSubmitBlocked ? "추가 불가 (날짜 확인 필요)" : "기록 저장"}
        </button>
      </form>
    </div>
  );
}
