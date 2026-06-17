// src/hooks/usePaperLibrary.ts
import { useEffect, useState, useCallback } from "react";
import type { LibraryPaper } from "../types/library";
import { supabase } from "../lib/supabaseClient";

function toLibraryPaper(row: any): LibraryPaper {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors ?? undefined,
    category: row.category ?? undefined,
    readTime: row.read_time ?? undefined,
    aiSummary: row.ai_summary ?? undefined,
    sourceType: row.source_type,
    sourceId: row.source_id ?? undefined,
    fullText: row.full_text ?? undefined,
    embedding: row.embedding ?? undefined,
    favorite: row.favorite ?? false,
    lastOpenedAt: row.last_opened_at ?? undefined,
    createdAt: row.created_at,
  };
}

export function usePaperLibrary(userId: string | null) {
  const [papers, setPapers] = useState<LibraryPaper[]>([]);

  const loadPapers = useCallback(async () => {
    if (!userId) { setPapers([]); return; }
    const { data, error } = await supabase
      .from("papers")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) { console.error("Failed to load papers", error); return; }
    setPapers((data ?? []).map(toLibraryPaper));
  }, [userId]);

  useEffect(() => { loadPapers(); }, [loadPapers]);

  const addPaper = useCallback(async (
    paper: Omit<LibraryPaper, "id" | "createdAt"> & { id?: string }
  ): Promise<string> => {
    if (!userId) return "";
    const { data, error } = await supabase
      .from("papers")
      .insert({
        user_id: userId,
        title: paper.title,
        authors: paper.authors ?? null,
        category: paper.category ?? null,
        read_time: paper.readTime ?? null,
        ai_summary: paper.aiSummary ?? null,
        source_type: paper.sourceType,
        source_id: paper.sourceId ?? null,
        full_text: paper.fullText ?? null,
        embedding: paper.embedding ?? null,
        favorite: paper.favorite ?? false,
        last_opened_at: paper.lastOpenedAt ?? null,
      })
      .select("id")
      .single();
    if (error) { console.error("Failed to add paper", error); return ""; }
    await loadPapers();
    return data.id;
  }, [userId, loadPapers]);

  const updatePaper = useCallback(async (id: string, patch: Partial<LibraryPaper>) => {
    const update: any = {};
    if (patch.title !== undefined) update.title = patch.title;
    if (patch.authors !== undefined) update.authors = patch.authors;
    if (patch.category !== undefined) update.category = patch.category;
    if (patch.readTime !== undefined) update.read_time = patch.readTime;
    if (patch.aiSummary !== undefined) update.ai_summary = patch.aiSummary;
    if (patch.sourceType !== undefined) update.source_type = patch.sourceType;
    if (patch.sourceId !== undefined) update.source_id = patch.sourceId;
    if (patch.fullText !== undefined) update.full_text = patch.fullText;
    if (patch.embedding !== undefined) update.embedding = patch.embedding;
    if (patch.favorite !== undefined) update.favorite = patch.favorite;
    if (patch.lastOpenedAt !== undefined) update.last_opened_at = patch.lastOpenedAt;

    const { error } = await supabase.from("papers").update(update).eq("id", id);
    if (error) { console.error("Failed to update paper", error); return; }
    setPapers((prev) => prev.map((p) => p.id === id ? { ...p, ...patch } : p));
  }, []);

  const removePaper = useCallback(async (id: string) => {
    const { error } = await supabase.from("papers").delete().eq("id", id);
    if (error) { console.error("Failed to delete paper", error); return; }
    setPapers((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const touchPaper = useCallback(async (id: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase.from("papers").update({ last_opened_at: now }).eq("id", id);
    if (error) { console.error("Failed to touch paper", error); return; }
    setPapers((prev) => prev.map((p) => p.id === id ? { ...p, lastOpenedAt: now } : p));
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    const paper = papers.find((p) => p.id === id);
    if (!paper) return;
    const next = !paper.favorite;
    const { error } = await supabase.from("papers").update({ favorite: next }).eq("id", id);
    if (error) { console.error("Failed to toggle favorite", error); return; }
    setPapers((prev) => prev.map((p) => p.id === id ? { ...p, favorite: next } : p));
  }, [papers]);

  return { papers, addPaper, updatePaper, removePaper, touchPaper, toggleFavorite };
}
