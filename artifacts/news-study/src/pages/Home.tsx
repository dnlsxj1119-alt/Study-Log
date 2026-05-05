import { Link } from "wouter";
import { useRecords } from "../hooks/useRecords";

export default function Home() {
  const { records } = useRecords();

  const recentRecords = records.slice(0, 3);
  const countA = records.filter((r) => r.member === "A").length;
  const countB = records.filter((r) => r.member === "B").length;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-1">신문 스터디</h1>
      <p className="text-gray-500 text-sm mb-6">2인 뉴스 스터디 기록 앱</p>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{countA}</div>
          <div className="text-sm text-gray-600 mt-1">멤버 A</div>
        </div>
        <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{countB}</div>
          <div className="text-sm text-gray-600 mt-1">멤버 B</div>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-gray-700">{records.length}</div>
          <div className="text-sm text-gray-600 mt-1">전체</div>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <Link href="/form" className="flex-1 bg-black text-white text-center py-3 rounded-xl font-medium text-sm">
          + 새 기록 작성
        </Link>
        <Link href="/records" className="flex-1 bg-gray-100 text-gray-800 text-center py-3 rounded-xl font-medium text-sm">
          전체 기록 보기
        </Link>
      </div>

      {recentRecords.length > 0 && (
        <>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">최근 기록</h2>
          <div className="space-y-2">
            {recentRecords.map((r) => (
              <Link key={r.id} href={`/detail/${r.id}`}>
                <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-400 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.member === "A" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      멤버 {r.member}
                    </span>
                    <span className="text-xs text-gray-400">{r.date}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">{r.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {records.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📰</p>
          <p className="text-sm">아직 기록이 없습니다.</p>
          <p className="text-xs mt-1">첫 기록을 작성해보세요!</p>
        </div>
      )}
    </div>
  );
}
