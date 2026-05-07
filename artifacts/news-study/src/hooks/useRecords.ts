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
  const { data = [], isLoading } = useListRecords();
  const records: Record[] = data.map(toRecord);

  const createMutation = useCreateRecord();
  const updateMutation = useUpdateRecord();
  const deleteMutation = useDeleteRecord();

  const queryKey = getListRecordsQueryKey();

  function addRecord(record: Record) {
    const next: Record = {
      ...record,
      completed: !isPast(record.date),
      editedAfter: false,
    };
    queryClient.setQueryData(queryKey, (old: StudyRecord[] = []) => [next, ...old]);
    createMutation.mutate(
      { data: next },
      { onError: () => queryClient.invalidateQueries({ queryKey }) },
    );
  }

  function updateRecord(updated: Record) {
    const editedAfterFlag = isPast(updated.date) ? true : updated.editedAfter;
    const patched: Record = { ...updated, editedAfter: editedAfterFlag };
    queryClient.setQueryData(queryKey, (old: StudyRecord[] = []) =>
      old.map((r) => (r.id === patched.id ? patched : r)),
    );
    updateMutation.mutate(
      { id: patched.id, data: patched },
      { onError: () => queryClient.invalidateQueries({ queryKey }) },
    );
  }

  function deleteRecord(id: string) {
    queryClient.setQueryData(queryKey, (old: StudyRecord[] = []) =>
      old.filter((r) => r.id !== id),
    );
    deleteMutation.mutate(
      { id },
      { onError: () => queryClient.invalidateQueries({ queryKey }) },
    );
  }

  function getRecord(id: string): Record | undefined {
    return records.find((r) => r.id === id);
  }

  return { records, isLoading, addRecord, updateRecord, deleteRecord, getRecord };
}
