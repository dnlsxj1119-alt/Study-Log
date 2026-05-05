import { useState, useEffect } from "react";
import type { Record } from "../types";

const STORAGE_KEY = "news-study-records";

function saveToStorage(records: Record[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
  }
}

function loadFromStorage(): Record[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
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
    setRecords((prev) => {
      const next = [record, ...prev];
      saveToStorage(next);
      return next;
    });
  }

  function updateRecord(updated: Record) {
    setRecords((prev) => {
      const next = prev.map((r) => (r.id === updated.id ? updated : r));
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
