import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, vacationPeriodsTable } from "@workspace/db";
import {
  CreateVacationBody,
  UpdateVacationBody,
  UpdateVacationParams,
  DeleteVacationParams,
  ListVacationsResponse,
  UpdateVacationResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/vacations", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(vacationPeriodsTable)
    .orderBy(vacationPeriodsTable.startDate);
  res.json(ListVacationsResponse.parse(rows));
});

router.post("/vacations", async (req, res): Promise<void> => {
  const parsed = CreateVacationBody.safeParse(req.body);
  if (!parsed.success) {
    console.warn("Invalid create vacation body", { errors: parsed.error.message });
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(vacationPeriodsTable)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: vacationPeriodsTable.id,
      set: parsed.data,
    })
    .returning();

  res.status(201).json(UpdateVacationResponse.parse(row));
});

router.put("/vacations/:id", async (req, res): Promise<void> => {
  const params = UpdateVacationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateVacationBody.safeParse(req.body);
  if (!parsed.success) {
    console.warn("Invalid update vacation body", { errors: parsed.error.message });
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(vacationPeriodsTable)
    .set(parsed.data)
    .where(eq(vacationPeriodsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Vacation period not found" });
    return;
  }

  res.json(UpdateVacationResponse.parse(row));
});

router.delete("/vacations/:id", async (req, res): Promise<void> => {
  const params = DeleteVacationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(vacationPeriodsTable)
    .where(eq(vacationPeriodsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Vacation period not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
