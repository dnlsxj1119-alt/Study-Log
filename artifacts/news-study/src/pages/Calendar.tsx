import { useState } from "react";
import { Link } from "wouter";
import { useRecords } from "../hooks/useRecords";

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const { records } = useRecords();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  function recordsForDate(dateStr: string) {
    return records.filter((r) => r.date === dateStr);
  }

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  const monthName = new Date(year, month).toLocaleDateString("ko-KR", { year: "numeric", month: "long" });

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">달력</h1>

      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
        <span className="font-semibold text-gray-800">{monthName}</span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">›</button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["일","월","화","수","목","금","토"].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayRecords = recordsForDate(dateStr);
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

          return (
            <div key={day} className={`relative rounded-lg p-1 text-center min-h-[48px] ${isToday ? "bg-black text-white" : "bg-gray-50 hover:bg-gray-100"}`}>
              <span className="text-xs font-medium">{day}</span>
              <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                {dayRecords.map((r) => (
                  <Link key={r.id} href={`/detail/${r.id}`}>
                    <span className={`block w-2 h-2 rounded-full ${r.member === "A" ? "bg-blue-400" : "bg-green-400"}`} title={r.title} />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> 멤버 A</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> 멤버 B</span>
      </div>
    </div>
  );
}
