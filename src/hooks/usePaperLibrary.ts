// src/hooks/usePaperLibrary.ts
import { useEffect, useState, useCallback } from "react";
import type { LibraryPaper } from "../types/library";

const STORAGE_KEY = "research-paper-ai:library:v1";

function loadFromStorage(): LibraryPaper[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LibraryPaper[];
  } catch (e) {
    console.error("Failed to parse library from localStorage", e);
    return [];
  }
}

function saveToStorage(papers: LibraryPaper[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  } catch (e) {
    console.error("Failed to save library to localStorage", e);
  }
}

export function usePaperLibrary() {
  const [papers, setPapers] = useState<LibraryPaper[]>([]);

  // load once on mount
  useEffect(() => {
    setPapers(loadFromStorage());
  }, []);

  // helper so state + storage stay synced
  const update = useCallback((updater: (old: LibraryPaper[]) => LibraryPaper[]) => {
    setPapers((prev) => {
      const next = updater(prev);
      saveToStorage(next);
      return next;
    });
  }, []);

  const addPaper = useCallback(
    (paper: Omit<LibraryPaper, "id" | "createdAt"> & { id?: string }) => {
      const id = paper.id ?? crypto.randomUUID();
      const createdAt = new Date().toISOString();

      update((old) => {
        const existingIndex = old.findIndex(
          (p) => p.id === id || (paper.sourceId && p.sourceId === paper.sourceId)
        );
        const base: LibraryPaper = { ...paper, id, createdAt };

        if (existingIndex === -1) {
          return [base, ...old];
        } else {
          const copy = [...old];
          copy[existingIndex] = { ...copy[existingIndex], ...base };
          return copy;
        }
      });

      return id;
    },
    [update]
  );

  const updatePaper = useCallback(
    (id: string, patch: Partial<LibraryPaper>) => {
      update((old) =>
        old.map((p) => (p.id === id ? { ...p, ...patch } : p))
      );
    },
    [update]
  );

  const removePaper = useCallback(
    (id: string) => {
      update((old) => old.filter((p) => p.id !== id));
    },
    [update]
  );

  const touchPaper = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      update((old) =>
        old.map((p) => (p.id === id ? { ...p, lastOpenedAt: now } : p))
      );
    },
    [update]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      update((old) =>
        old.map((p) =>
          p.id === id ? { ...p, favorite: !p.favorite } : p
        )
      );
    },
    [update]
  );

  return {
    papers,
    addPaper,
    updatePaper,
    removePaper,
    touchPaper,
    toggleFavorite,
  };
}
