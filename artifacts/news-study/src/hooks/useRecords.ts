import { useState, useEffect, useRef } from "react";
import type { Record } from "../types";
import { isPast } from "../utils/dateUtils";

const STORAGE_KEY = "records";
const OLD_KEY = "news-study-records";

function migrate(raw: Record[]): Record[] {
  return raw.map((r) => ({
    completed: true,
    editedAfter: false,
    insight: "",
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
    const stored =
      localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(OLD_KEY);
    if (!stored) return [];
    const parsed = migrate(JSON.parse(stored));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    localStorage.removeItem(OLD_KEY);
    return parsed;
  } catch {
    return [];
  }
}

export function useRecords() {
  const [records, setRecords] = useState<Record[]>(loadFromStorage);
  const recordsRef = useRef<Record[]>(records);

  useEffect(() => {
    recordsRef.current = records;
    saveToStorage(records);
  }, [records]);

  function addRecord(record: Record) {
    const next_record: Record = {
      ...record,
      completed: !isPast(record.date),
      editedAfter: false,
    };
    const next = [next_record, ...recordsRef.current];
    recordsRef.current = next;
    saveToStorage(next);
    setRecords(next);
  }

  function updateRecord(updated: Record) {
    const editedAfterFlag = isPast(updated.date) ? true : updated.editedAfter;
    const patched: Record = { ...updated, editedAfter: editedAfterFlag };
    const next = recordsRef.current.map((r) =>
      r.id === patched.id ? patched : r
    );
    recordsRef.current = next;
    saveToStorage(next);
    setRecords(next);
  }

  function deleteRecord(id: string) {
    const next = recordsRef.current.filter((r) => r.id !== id);
    recordsRef.current = next;
    saveToStorage(next);
    setRecords(next);
  }

  function getRecord(id: string): Record | undefined {
    return recordsRef.current.find((r) => r.id === id);
  }

  return { records, addRecord, updateRecord, deleteRecord, getRecord };
}
