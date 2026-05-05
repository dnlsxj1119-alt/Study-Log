import { useState, useEffect } from "react";
import type { Record } from "../types";
import { isPast } from "../utils/dateUtils";

const STORAGE_KEY = "news-study-records";

function migrate(raw: Record[]): Record[] {
  return raw.map((r) => ({
    completed: true,
    editedAfter: false,
    ...r,
  }));
}

function saveToStorage(records: Record[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
  }
}

function loadFromStorage(): Record[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? migrate(JSON.parse(stored)) : [];
  } catch {
    return [];
  }
}

export function useRecords() {
  const [records, setRecords] = useState<Record[]>(loadFromStorage);

  useEffect(() => {
    saveToStorage(records);
  }, [records]);

  function addRecord(record: Record) {
    const next_record: Record = {
      ...record,
      completed: !isPast(record.date),
      editedAfter: false,
    };
    setRecords((prev) => {
      const next = [next_record, ...prev];
      saveToStorage(next);
      return next;
    });
  }

  function updateRecord(updated: Record) {
    const editedAfterFlag = isPast(updated.date) ? true : updated.editedAfter;
    const patched: Record = { ...updated, editedAfter: editedAfterFlag };
    setRecords((prev) => {
      const next = prev.map((r) => (r.id === patched.id ? patched : r));
      saveToStorage(next);
      return next;
    });
  }

  function deleteRecord(id: string) {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      saveToStorage(next);
      return next;
    });
  }

  function getRecord(id: string): Record | undefined {
    return records.find((r) => r.id === id);
  }

  return { records, addRecord, updateRecord, deleteRecord, getRecord };
}
