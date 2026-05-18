import { useState } from "react";
import { Link } from "wouter";
import { useRecords } from "../hooks/useRecords";
import type { Record } from "../types";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

interface DayPanelProps {
  dateStr: string;
  records: Record[];
  onClose: () => void;
}

function DayPanel({ dateStr, records, onClose }: DayPanelProps) {
  const label = new Date(dateStr + "T00:00:00").toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-lg leading-none"
          aria-label="닫기"
        >
          ×
        </button>
      </div>

      {records.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          이 날짜에 기록이 없습니다.
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {records.map((r) => (
            <Link key={r.id} href={`/detail/${r.id}`}>
              <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <span
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    r.member === "A" ? "bg-blue-400" : "bg-green-400"
                  }`}
                >
                  {r.member}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                    {(r.threeLineSummary ?? "").split("\n")[0]}
                  </p>
                </div>
                <span className="ml-auto text-gray-300 text-sm flex-shrink-0">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="px-4 py-3 border-t border-gray-50">
        <Link
          href="/form"
          className="block w-full text-center text-xs font-semibold text-gray-500 hover:text-black transition-colors"
        >
          + 이 날짜로 새 기록 이동
        </Link>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { records } = useRecords();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function recordsForDate(dateStr: string) {
    return records.filter((r) => r.date === dateStr);
  }

  function monthRecords() {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return records.filter((r) => r.date.startsWith(prefix));
  }

  function prevMonth() {
    setSelectedDate(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    setSelectedDate(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  const monthName = new Date(year, month).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const thisMonthRecords = monthRecords();

  function isCountable(r: ReturnType<typeof monthRecords>[number]) {
    return r.completed !== false && r.editedAfter !== true;
  }

  const datesA = new Set(
    thisMonthRecords.filter((r) => r.member === "A" && isCountable(r)).map((r) => r.date)
  );
  const datesB = new Set(
    thisMonthRecords.filter((r) => r.member === "B" && isCountable(r)).map((r) => r.date)
  );

  const countA = datesA.size;
  const countB = datesB.size;
  const countAll = [...datesA].filter((d) => datesB.has(d)).length;

  const rateA = daysInMonth > 0 ? Math.round((countA / daysInMonth) * 100) : 0;
  const rateB = daysInMonth > 0 ? Math.round((countB / daysInMonth) * 100) : 0;
  const rateAll = daysInMonth > 0 ? Math.round((countAll / daysInMonth) * 100) : 0;

  const selectedRecords = selectedDate ? recordsForDate(selectedDate) : [];

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">달력</h1>

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-lg"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-800">{monthName}</span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-500 text-lg"
        >
          ›
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">월간 완료율</span>
          <span className="text-xs text-gray-400">{daysInMonth}일 기준</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> 멤버 A
            </span>
            <span className="text-gray-500">{daysInMonth}일 중 {countA}일</span>
            <span className="font-bold text-blue-600 w-10 text-right">{rateA}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${rateA}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 멤버 B
            </span>
            <span className="text-gray-500">{daysInMonth}일 중 {countB}일</span>
            <span className="font-bold text-green-600 w-10 text-right">{rateB}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${rateB}%` }}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-gray-600">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> 전체 (A+B 모두)
            </span>
            <span className="text-gray-500">{daysInMonth}일 중 {countAll}일</span>
            <span className="font-bold text-gray-700 w-10 text-right">{rateAll}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full transition-all duration-500"
              style={{ width: `${rateAll}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dateStr = toDateStr(year, month, day);
          const dayRecords = recordsForDate(dateStr);
          const hasA = dayRecords.some((r) => r.member === "A");
          const hasB = dayRecords.some((r) => r.member === "B");
          const bothComplete = datesA.has(dateStr) && datesB.has(dateStr);
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const isSelected = selectedDate === dateStr;
          const isSunday = (firstDay + day - 1) % 7 === 0;
          const isSaturday = (firstDay + day - 1) % 7 === 6;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(dateStr)}
              className={`relative rounded-xl p-1 text-center min-h-[52px] flex flex-col items-center transition-all ${
                isSelected
                  ? "bg-gray-800 text-white ring-2 ring-gray-800"
                  : isToday
                  ? "bg-black text-white"
                  : bothComplete
                  ? "bg-indigo-50 hover:bg-indigo-100"
                  : dayRecords.length > 0
                  ? "bg-gray-100 hover:bg-gray-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`text-xs font-semibold mt-1 ${
                  isSelected || isToday
                    ? "text-white"
                    : isSunday
                    ? "text-red-400"
                    : isSaturday
                    ? "text-blue-400"
                    : "text-gray-700"
                }`}
              >
                {day}
              </span>
              <div className="flex gap-0.5 justify-center mt-1">
                {hasA && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? "bg-blue-300" : "bg-blue-400"
                    }`}
                  />
                )}
                {hasB && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected ? "bg-green-300" : "bg-green-400"
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <DayPanel
          dateStr={selectedDate}
          records={selectedRecords}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
