// src/hooks/useSemanticSearch.ts
import { useState } from "react";
import type { LibraryPaper } from "../types/library";
import { embedTextForSearch } from "../lib/ai";

export type SemanticResult = {
  paper: LibraryPaper;
  score: number;
};

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export function useSemanticSearch(papers: LibraryPaper[]) {
  const [results, setResults] = useState<SemanticResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      const queryEmbedding = await embedTextForSearch(q);

      const scored: SemanticResult[] = papers
        .filter((p) => p.embedding && p.embedding.length > 0)
        .map((paper) => ({
          paper,
          score: cosineSimilarity(queryEmbedding, paper.embedding!),
        }))
        .sort((a, b) => b.score - a.score);

      setResults(scored);
    } catch (err) {
      console.error(err);
      setError("Semantic search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return { results, isSearching, error, search };
}
