import { pgTable, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vacationPeriodsTable = pgTable("vacation_periods", {
  id: text("id").primaryKey(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  memo: text("memo").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const insertVacationPeriodSchema = createInsertSchema(vacationPeriodsTable);
export const updateVacationPeriodSchema = insertVacationPeriodSchema.partial().omit({ id: true });

export type InsertVacationPeriod = z.infer<typeof insertVacationPeriodSchema>;
export type VacationPeriod = typeof vacationPeriodsTable.$inferSelect;
