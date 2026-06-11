import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, studyRecordsTable } from "@workspace/db";
import {
  CreateRecordBody,
  UpdateRecordBody,
  UpdateRecordParams,
  DeleteRecordParams,
  ListRecordsResponse,
  UpdateRecordResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/records", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(studyRecordsTable)
    .orderBy(studyRecordsTable.createdAt);
  res.json(ListRecordsResponse.parse(rows));
});

router.post("/records", async (req, res): Promise<void> => {
  const parsed = CreateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    console.warn("Invalid create body", { errors: parsed.error.message });
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(studyRecordsTable)
    .values(parsed.data)
    .onConflictDoUpdate({
      target: studyRecordsTable.id,
      set: parsed.data,
    })
    .returning();

  res.status(201).json(UpdateRecordResponse.parse(row));
});

router.put("/records/:id", async (req, res): Promise<void> => {
  const params = UpdateRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRecordBody.safeParse(req.body);
  if (!parsed.success) {
    console.warn("Invalid update body", { errors: parsed.error.message });
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(studyRecordsTable)
    .set(parsed.data)
    .where(eq(studyRecordsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.json(UpdateRecordResponse.parse(row));
});

router.delete("/records/:id", async (req, res): Promise<void> => {
  const params = DeleteRecordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(studyRecordsTable)
    .where(eq(studyRecordsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Record not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
