import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useRecords } from "../hooks/useRecords";
import { useVacations } from "../hooks/useVacations";
import type { VacationPeriod } from "../hooks/useVacations";
import type { Record } from "../types";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getWeekdaysInMonth(year: number, month: number) {
  const total = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= total; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function getVacationWeekdaysInMonth(
  year: number,
  month: number,
  vacations: VacationPeriod[]
): number {
  if (!vacations.length) return 0;
  const total = getDaysInMonth(year, month);
  let count = 0;
  for (let d = 1; d <= total; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) continue;
    const dateStr = toDateStr(year, month, d);
    if (vacations.some((v) => dateStr >= v.startDate && dateStr <= v.endDate)) {
      count++;
    }
  }
  return count;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getVacationForDate(
  dateStr: string,
  vacations: VacationPeriod[]
): VacationPeriod | null {
  return vacations.find((v) => dateStr >= v.startDate && dateStr <= v.endDate) ?? null;
}

interface DayPanelProps {
  dateStr: string;
  records: Record[];
  vacation: VacationPeriod | null;
  onClose: () => void;
  onEditVacation: (v: VacationPeriod) => void;
}

function DayPanel({ dateStr, records, vacation, onClose, onEditVacation }: DayPanelProps) {
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

      {vacation && (
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex-shrink-0 text-xs font-semibold text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
              휴식기간
            </span>
            <span className="text-xs text-gray-500 truncate">
              {vacation.startDate} ~ {vacation.endDate}
              {vacation.memo ? ` · ${vacation.memo}` : ""}
            </span>
          </div>
          <button
            onClick={() => onEditVacation(vacation)}
            className="flex-shrink-0 text-xs text-gray-500 hover:text-black underline underline-offset-2"
          >
            수정
          </button>
        </div>
      )}

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
          href={`/form?date=${dateStr}`}
          className="block w-full text-center text-xs font-semibold text-gray-500 hover:text-black transition-colors"
          onClick={() => console.log("[Calendar] 날짜 이동:", dateStr)}
        >
          + 이 날짜로 새 기록 이동
        </Link>
      </div>
    </div>
  );
}

interface VacationFormPanelProps {
  form: { id: string; startDate: string; endDate: string; memo: string; isNew: boolean };
  isMutating: boolean;
  onSave: (data: { startDate: string; endDate: string; memo: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
}

function VacationFormPanel({ form, isMutating, onSave, onDelete, onClose }: VacationFormPanelProps) {
  const [startDate, setStartDate] = useState(form.startDate);
  const [endDate, setEndDate] = useState(form.endDate);
  const [memo, setMemo] = useState(form.memo);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!startDate || !endDate) {
      setError("시작일과 종료일을 모두 입력해주세요.");
      return;
    }
    if (startDate > endDate) {
      setError("종료일은 시작일 이후여야 합니다.");
      return;
    }
    setError("");
    try {
      await onSave({ startDate, endDate, memo });
    } catch {
      setError("저장에 실패했습니다.");
    }
  }

  async function handleDelete() {
    if (!window.confirm("이 휴식기간을 삭제할까요?")) return;
    try {
      await onDelete();
    } catch {
      setError("삭제에 실패했습니다.");
    }
  }

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-800">
          {form.isNew ? "휴식기간 추가" : "휴식기간 수정"}
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-700 text-lg leading-none"
        >
          ×
        </button>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setError(""); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
          <span className="text-gray-400 mt-5">~</span>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">종료일</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => { setEndDate(e.target.value); setError(""); }}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">메모 (선택)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="예: 여름 방학, 해외 출장"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2 pt-1">
          {!form.isNew && (
            <button
              onClick={handleDelete}
              disabled={isMutating}
              className="px-3 py-2 rounded-xl text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-40"
            >
              삭제
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isMutating}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
          >
            {isMutating ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const { records } = useRecords();
  const { vacations, isMutating, addVacation, updateVacation, deleteVacation } = useVacations();
  const today = new Date();
  const search = useSearch();
  const returnDate = new URLSearchParams(search).get("date") ?? "";
  const returnDateObj = returnDate.match(/^\d{4}-\d{2}-\d{2}$/)
    ? new Date(returnDate + "T00:00:00")
    : null;

  const [year, setYear] = useState(returnDateObj ? returnDateObj.getFullYear() : today.getFullYear());
  const [month, setMonth] = useState(returnDateObj ? returnDateObj.getMonth() : today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(returnDate || null);
  const [vacationForm, setVacationForm] = useState<{
    id: string;
    startDate: string;
    endDate: string;
    memo: string;
    isNew: boolean;
  } | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const weekdaysInMonth = getWeekdaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const vacationWeekdays = getVacationWeekdaysInMonth(year, month, vacations);
  const effectiveWeekdays = Math.max(0, weekdaysInMonth - vacationWeekdays);

  function recordsForDate(dateStr: string) {
    return records.filter((r) => r.date === dateStr);
  }

  function monthRecords() {
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return records.filter((r) => r.date.startsWith(prefix));
  }

  function prevMonth() {
    setSelectedDate(null);
    setVacationForm(null);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    setSelectedDate(null);
    setVacationForm(null);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function handleDayClick(dateStr: string) {
    setVacationForm(null);
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  }

  function openAddVacation() {
    setSelectedDate(null);
    const todayStr = today.toISOString().slice(0, 10);
    setVacationForm({ id: "", startDate: todayStr, endDate: todayStr, memo: "", isNew: true });
  }

  function openEditVacation(v: VacationPeriod) {
    setVacationForm({ id: v.id, startDate: v.startDate, endDate: v.endDate, memo: v.memo, isNew: false });
  }

  async function handleVacationSave(data: { startDate: string; endDate: string; memo: string }) {
    if (vacationForm?.isNew) {
      await addVacation(data);
    } else if (vacationForm) {
      const existing = vacations.find((v) => v.id === vacationForm.id);
      if (existing) {
        await updateVacation({ ...existing, ...data });
      }
    }
    setVacationForm(null);
  }

  async function handleVacationDelete() {
    if (vacationForm && !vacationForm.isNew) {
      await deleteVacation(vacationForm.id);
    }
    setVacationForm(null);
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

  const rateA = effectiveWeekdays > 0 ? Math.round((countA / effectiveWeekdays) * 100) : 0;
  const rateB = effectiveWeekdays > 0 ? Math.round((countB / effectiveWeekdays) * 100) : 0;
  const rateAll = effectiveWeekdays > 0 ? Math.round((countAll / effectiveWeekdays) * 100) : 0;

  const selectedRecords = selectedDate ? recordsForDate(selectedDate) : [];
  const selectedVacation = selectedDate ? getVacationForDate(selectedDate, vacations) : null;

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

      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-3 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">월간 완료율</span>
          <span className="text-xs text-gray-400">
            평일 {effectiveWeekdays}일 기준
            {vacationWeekdays > 0 && (
              <span className="text-gray-300"> (휴식 {vacationWeekdays}일 제외)</span>
            )}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> 멤버 A
            </span>
            <span className="text-gray-500">평일 {effectiveWeekdays}일 중 {countA}일</span>
            <span className="font-bold text-blue-600 w-10 text-right">{rateA}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full transition-all duration-500" style={{ width: `${rateA}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-green-600">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 멤버 B
            </span>
            <span className="text-gray-500">평일 {effectiveWeekdays}일 중 {countB}일</span>
            <span className="font-bold text-green-600 w-10 text-right">{rateB}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${rateB}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-gray-600">
              <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> 전체 (A+B 모두)
            </span>
            <span className="text-gray-500">평일 {effectiveWeekdays}일 중 {countAll}일</span>
            <span className="font-bold text-gray-700 w-10 text-right">{rateAll}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-400 rounded-full transition-all duration-500" style={{ width: `${rateAll}%` }} />
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-3">
        <button
          onClick={openAddVacation}
          className="text-xs font-medium text-gray-500 border border-gray-200 rounded-xl px-3 py-1.5 hover:border-gray-400 hover:text-black transition-colors flex items-center gap-1"
        >
          <span className="text-gray-400">—</span> 휴식기간 추가
        </button>
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
          const dayOfWeek = (firstDay + day - 1) % 7;
          const dayRecords = recordsForDate(dateStr);
          const hasA = dayRecords.some((r) => r.member === "A");
          const hasB = dayRecords.some((r) => r.member === "B");
          const bothComplete = datesA.has(dateStr) && datesB.has(dateStr);
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          const isSelected = selectedDate === dateStr;
          const isSunday = dayOfWeek === 0;
          const isSaturday = dayOfWeek === 6;

          const vacation = getVacationForDate(dateStr, vacations);
          const isVacStart = vacation?.startDate === dateStr;
          const isVacEnd = vacation?.endDate === dateStr;
          const barLeftRound = isVacStart || dayOfWeek === 0;
          const barRightRound = isVacEnd || dayOfWeek === 6;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(dateStr)}
              className={`relative rounded-xl p-1 text-center min-h-[52px] flex flex-col items-center transition-all overflow-hidden ${
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
              <div className="flex gap-0.5 justify-center mt-0.5">
                {hasA && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-blue-300" : "bg-blue-400"}`} />
                )}
                {hasB && (
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-green-300" : "bg-green-400"}`} />
                )}
              </div>
              {vacation && (
                <>
                  <span
                    className={`text-[8px] leading-none font-medium mt-0.5 ${
                      isSelected || isToday ? "text-gray-300" : "text-gray-400"
                    }`}
                  >
                    휴식
                  </span>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-[5px] ${
                      isSelected ? "bg-gray-600" : isToday ? "bg-gray-600" : "bg-gray-300"
                    } ${barLeftRound ? "rounded-l-full" : ""} ${barRightRound ? "rounded-r-full" : ""}`}
                  />
                </>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <DayPanel
          dateStr={selectedDate}
          records={selectedRecords}
          vacation={selectedVacation}
          onClose={() => setSelectedDate(null)}
          onEditVacation={openEditVacation}
        />
      )}

      {vacationForm && (
        <VacationFormPanel
          form={vacationForm}
          isMutating={isMutating}
          onSave={handleVacationSave}
          onDelete={handleVacationDelete}
          onClose={() => setVacationForm(null)}
        />
      )}
    </div>
  );
}
