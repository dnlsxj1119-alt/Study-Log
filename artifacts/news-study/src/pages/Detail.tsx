import { useParams, useLocation, Link } from "wouter";
import { useRecords } from "../hooks/useRecords";

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

  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => navigate("/records")} className="text-gray-500 hover:text-black text-sm">
          ← 목록
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${record.member === "A" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
          멤버 {record.member}
        </span>
        <span className="text-xs text-gray-400">{record.date}</span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 mb-5">{record.title}</h1>

      <div className="space-y-4">
        <section className="bg-gray-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">원문 요약</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{record.originalSummary}</p>
        </section>

        <section className="bg-blue-50 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">세 줄 요약</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{record.threeLineSummary}</p>
        </section>
      </div>

      <div className="text-xs text-gray-300 mt-4">
        작성: {new Date(record.createdAt).toLocaleString("ko-KR")}
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
