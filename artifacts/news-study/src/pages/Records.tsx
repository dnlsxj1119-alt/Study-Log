import { useState } from "react";
import { Link } from "wouter";
import { useRecords } from "../hooks/useRecords";
import type { Member } from "../types";

export default function Records() {
  const { records } = useRecords();
  const [filterMember, setFilterMember] = useState<Member | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = records.filter((r) => {
    const memberMatch = filterMember === "ALL" || r.member === filterMember;
    const searchMatch = r.title.toLowerCase().includes(search.toLowerCase());
    return memberMatch && searchMatch;
  });

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">기록 목록</h1>
        <Link href="/form" className="text-sm bg-black text-white px-3 py-1.5 rounded-lg">
          + 작성
        </Link>
      </div>

      <input
        type="text"
        placeholder="제목으로 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm mb-3 outline-none focus:border-gray-400"
      />

      <div className="flex gap-2 mb-4">
        {(["ALL", "A", "B"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setFilterMember(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterMember === m ? "bg-black text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {m === "ALL" ? "전체" : `멤버 ${m}`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-sm">기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((r) => (
            <Link key={r.id} href={`/detail/${r.id}`}>
              <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.member === "A" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                    멤버 {r.member}
                  </span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{r.threeLineSummary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
