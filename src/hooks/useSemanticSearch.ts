// src/hooks/useSemanticSearch.ts
import { useState } from "react";
import type { LibraryPaper } from "../types/library";
import { embedTextForSearch } from "../lib/ai";
import { supabase } from "../lib/supabaseClient";

export type SemanticResult = {
  paper: LibraryPaper;
  score: number;
};

export function useSemanticSearch() {
  const [results, setResults] = useState<SemanticResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, userId: string) => {
    const q = query.trim();
    if (!q || !userId) { setResults([]); return; }

    try {
      setIsSearching(true);
      setError(null);

      const queryEmbedding = await embedTextForSearch(q);

      const { data, error: rpcError } = await supabase.rpc("match_papers", {
        query_embedding: queryEmbedding,
        match_user_id: userId,
        match_threshold: 0.3,
        match_count: 10,
      });

      if (rpcError) throw rpcError;

      const scored: SemanticResult[] = (data ?? []).map((row: any) => ({
        score: row.similarity,
        paper: {
          id: row.id,
          title: row.title,
          authors: row.authors ?? undefined,
          category: row.category ?? undefined,
          readTime: row.read_time ?? undefined,
          aiSummary: row.ai_summary ?? undefined,
          sourceType: row.source_type,
          sourceId: row.source_id ?? undefined,
          fullText: row.full_text ?? undefined,
          favorite: row.favorite ?? false,
          lastOpenedAt: row.last_opened_at ?? undefined,
          createdAt: row.created_at,
        } as LibraryPaper,
      }));

      setResults(scored);
    } catch (err) {
      console.error(err);
      setError("Semantic search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clear = () => setResults([]);

  return { results, isSearching, error, search, clear };
}
