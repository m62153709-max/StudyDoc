// src/components/LibraryPage.tsx
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Filter,
  Search,
  SortAsc,
  Star,
  Trash2,
  Sparkles,
} from "lucide-react";
import type { LibraryPaper } from "../types/library";
import { useSemanticSearch } from "../hooks/useSemanticSearch";

type SortOption = "recent" | "title" | "category";
type SearchMode = "keyword" | "semantic";

interface LibraryPageProps {
  papers: LibraryPaper[];
  onBack: () => void;
  onOpenPaper: (paper: LibraryPaper) => void;
  onDeletePaper: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

function normalizeCategory(cat?: string) {
  return cat?.trim() || "Uncategorized";
}

export default function LibraryPage({
  papers,
  onBack,
  onOpenPaper,
  onDeletePaper,
  onToggleFavorite,
}: LibraryPageProps) {
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<SearchMode>("keyword");

  const { results: semanticResults, isSearching, error, search } =
    useSemanticSearch(papers);

  const categories = useMemo(() => {
    const set = new Set<string>();
    papers.forEach((p) => set.add(normalizeCategory(p.category)));
    return Array.from(set).sort();
  }, [papers]);

  // Keyword-based filtering (title/authors/text)
  const keywordFilteredSorted = useMemo(() => {
    let result = [...papers];

    // filter by category
    if (categoryFilter !== "All") {
      result = result.filter(
        (p) => normalizeCategory(p.category) === categoryFilter
      );
    }

    // keyword search
    const q = searchQuery.toLowerCase().trim();
    if (q && searchMode === "keyword") {
      result = result.filter((p) => {
        const title = p.title.toLowerCase();
        const authors =
          typeof p.authors === "string"
            ? p.authors.toLowerCase()
            : (p.authors ?? []).join(", ").toLowerCase();
        const text = p.fullText?.toLowerCase() ?? "";
        return title.includes(q) || authors.includes(q) || text.includes(q);
      });
    }

    // sort
    result.sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "category") {
        return normalizeCategory(a.category).localeCompare(
          normalizeCategory(b.category)
        );
      }
      // recent: use lastOpenedAt, fallback to createdAt
      const da = new Date(a.lastOpenedAt ?? a.createdAt).getTime();
      const db = new Date(b.lastOpenedAt ?? b.createdAt).getTime();
      return db - da; // newest first
    });

    // favorites first
    result.sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite));

    return result;
  }, [papers, sortBy, categoryFilter, searchQuery, searchMode]);

  // What we actually display
  const listToShow =
    searchMode === "semantic" && searchQuery.trim() && semanticResults.length
      ? semanticResults.map((r) => r.paper)
      : keywordFilteredSorted;

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === "semantic") {
      await search(searchQuery);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 mt-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          My Library
        </h1>
        <div className="w-24" />
      </div>

      {/* Controls */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex flex-col md:flex-row md:items-center gap-3 mb-6"
      >
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              searchMode === "semantic"
                ? 'Semantic search: "neural diffusion stability"...'
                : "Keyword search by title, author, or content..."
            }
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>

        <div className="flex gap-3 items-center">
          {/* Search mode toggle */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Sparkles className="w-4 h-4" />
            <div className="inline-flex rounded-full border border-stone-200 bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => setSearchMode("keyword")}
                className={`px-3 py-1 text-xs ${
                  searchMode === "keyword"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                Keyword
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode("semantic");
                  // don't auto-run; user hits Enter or Search
                }}
                className={`px-3 py-1 text-xs ${
                  searchMode === "semantic"
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                Semantic
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <SortAsc className="w-4 h-4" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-stone-200 rounded-md text-xs px-2 py-1 bg-white focus:outline-none"
            >
              <option value="recent">Most recent</option>
              <option value="title">Title A–Z</option>
              <option value="category">Category</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Filter className="w-4 h-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-stone-200 rounded-md text-xs px-2 py-1 bg-white focus:outline-none"
            >
              <option value="All">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {searchMode === "semantic" && (
            <button
              type="submit"
              className="text-xs px-3 py-1 rounded-lg bg-stone-900 text-white hover:bg-stone-800"
              disabled={isSearching || !searchQuery.trim()}
            >
              {isSearching ? "Searching..." : "Search"}
            </button>
          )}
        </div>
      </form>

      {searchMode === "semantic" && (
        <p className="text-[11px] text-stone-500 mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Semantic search ranks papers by meaning, not just keywords. Only
          papers with embeddings will appear.
        </p>
      )}

      {error && (
        <p className="text-xs text-red-600 mb-2">
          {error}
        </p>
      )}

      {/* Content */}
      {listToShow.length === 0 ? (
        <p className="text-sm text-stone-500 mt-6">
          No papers match your current search or filters.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {listToShow.map((paper) => (
            <div
              key={paper.id}
              className="rounded-xl border border-stone-200 bg-white px-4 py-3 flex flex-col gap-2 hover:shadow-sm transition"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onOpenPaper(paper)}
                >
                  <h3 className="font-medium text-sm mb-0.5 line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {typeof paper.authors === "string"
                      ? paper.authors
                      : paper.authors?.join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => onToggleFavorite(paper.id)}
                  className="p-1 rounded hover:bg-stone-100"
                  title={paper.favorite ? "Unfavorite" : "Favorite"}
                >
                  <Star
                    className="w-4 h-4"
                    fill={paper.favorite ? "#fbbf24" : "none"}
                    stroke={paper.favorite ? "#f59e0b" : "#78716c"}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>
                  {normalizeCategory(paper.category)} ·{" "}
                  {paper.readTime ?? "—"}
                </span>
                <div className="flex items-center gap-2">
                  <span>
                    Added{" "}
                    {new Date(paper.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove "${paper.title}" from your library?`
                        )
                      ) {
                        onDeletePaper(paper.id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-50"
                    title="Delete from library"
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
