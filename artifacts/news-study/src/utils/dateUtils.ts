export function getTodayString(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isToday(dateStr: string): boolean {
  return dateStr === getTodayString();
}

export function isPast(dateStr: string): boolean {
  return dateStr < getTodayString();
}

export function isFuture(dateStr: string): boolean {
  return dateStr > getTodayString();
}

export function getDateBlockReason(dateStr: string): string | null {
  if (isPast(dateStr)) return "과거 날짜에는 새 기록을 추가할 수 없습니다.";
  if (isFuture(dateStr)) return "미래 날짜에는 기록을 추가할 수 없습니다.";
  return null;
}
