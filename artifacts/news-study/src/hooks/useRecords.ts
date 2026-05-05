import { useState, useEffect } from "react";
import type { Record } from "../types";

const STORAGE_KEY = "news-study-records";

export function useRecords() {
  const [records, setRecords] = useState<Record[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  function addRecord(record: Record) {
    setRecords((prev) => [record, ...prev]);
  }

  function updateRecord(updated: Record) {
    setRecords((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  function deleteRecord(id: string) {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }

  function getRecord(id: string): Record | undefined {
    return records.find((r) => r.id === id);
  }

  return { records, addRecord, updateRecord, deleteRecord, getRecord };
}
