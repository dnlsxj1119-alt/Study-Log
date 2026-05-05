export type Member = "A" | "B";

export interface Record {
  id: string;
  member: Member;
  date: string;
  title: string;
  originalSummary: string;
  threeLineSummary: string;
  createdAt: string;
  completed: boolean;
  editedAfter: boolean;
}
