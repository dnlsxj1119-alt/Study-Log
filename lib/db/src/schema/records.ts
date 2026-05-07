import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const studyRecordsTable = pgTable("study_records", {
  id: text("id").primaryKey(),
  member: text("member").notNull(),
  date: text("date").notNull(),
  title: text("title").notNull().default(""),
  originalSummary: text("original_summary").notNull(),
  threeLineSummary: text("three_line_summary").notNull(),
  insight: text("insight").notNull().default(""),
  createdAt: text("created_at").notNull(),
  completed: boolean("completed").notNull().default(true),
  editedAfter: boolean("edited_after").notNull().default(false),
});

export const insertStudyRecordSchema = createInsertSchema(studyRecordsTable);
export const updateStudyRecordSchema = insertStudyRecordSchema.partial().omit({ id: true });

export type InsertStudyRecord = z.infer<typeof insertStudyRecordSchema>;
export type StudyRecord = typeof studyRecordsTable.$inferSelect;
