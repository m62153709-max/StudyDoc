// src/types/library.ts
import type { AIPaperSummary } from "../lib/ai";

export type LibraryPaper = {
  id: string;
  title: string;
  authors?: string[] | string;
  category?: string;
  readTime?: string;
  aiSummary?: AIPaperSummary;

  sourceType: "upload" | "url" | "arxiv" | "other";
  sourceId?: string;
  createdAt: string;
  lastOpenedAt?: string;
  favorite?: boolean;

  fullText?: string;

  // NEW: vector representing this paper for semantic search
  embedding?: number[];
};
