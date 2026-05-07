import { useQueryClient } from "@tanstack/react-query";
import {
  useListRecords,
  useCreateRecord,
  useUpdateRecord,
  useDeleteRecord,
  getListRecordsQueryKey,
} from "@workspace/api-client-react";
import { isPast } from "../utils/dateUtils";
import type { Member, Record } from "../types";
import type { StudyRecord } from "@workspace/api-client-react";

function toRecord(r: StudyRecord): Record {
  return {
    id: r.id,
    member: r.member as Member,
    date: r.date,
    title: r.title,
    originalSummary: r.originalSummary,
    threeLineSummary: r.threeLineSummary,
    insight: r.insight,
    createdAt: r.createdAt,
    completed: r.completed,
    editedAfter: r.editedAfter,
  };
}

export function useRecords() {
  const queryClient = useQueryClient();
  const { data = [], isLoading, isError } = useListRecords();
  const records: Record[] = data.map(toRecord);

  const createMutation = useCreateRecord();
  const updateMutation = useUpdateRecord();
  const deleteMutation = useDeleteRecord();

  const queryKey = getListRecordsQueryKey();

  async function addRecord(record: Record): Promise<void> {
    const next: Record = {
      ...record,
      completed: !isPast(record.date),
      editedAfter: false,
    };
    await createMutation.mutateAsync({ data: next });
    await queryClient.invalidateQueries({ queryKey });
  }

  async function updateRecord(updated: Record): Promise<void> {
    const editedAfterFlag = isPast(updated.date) ? true : updated.editedAfter;
    const patched: Record = { ...updated, editedAfter: editedAfterFlag };
    await updateMutation.mutateAsync({ id: patched.id, data: patched });
    await queryClient.invalidateQueries({ queryKey });
  }

  async function deleteRecord(id: string): Promise<void> {
    await deleteMutation.mutateAsync({ id });
    await queryClient.invalidateQueries({ queryKey });
  }

  function getRecord(id: string): Record | undefined {
    return records.find((r) => r.id === id);
  }

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return {
    records,
    isLoading,
    isError,
    isMutating,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecord,
  };
}
