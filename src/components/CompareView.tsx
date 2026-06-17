// src/components/CompareView.tsx
import { useEffect, useState } from "react";
import { ArrowLeft, GitCompare } from "lucide-react";
import type { LibraryPaper } from "../types/library";
import { comparePapers, type PaperComparison } from "../lib/ai";

interface CompareViewProps {
  paper1: LibraryPaper;
  paper2: LibraryPaper;
  onBack: () => void;
}

type DimKey = "research_question" | "methodology" | "findings" | "scope";

const DIMENSIONS: { key: DimKey; label: string }[] = [
  { key: "research_question", label: "Research Question" },
  { key: "methodology", label: "Methodology" },
  { key: "findings", label: "Findings" },
  { key: "scope", label: "Scope" },
];

export default function CompareView({ paper1, paper2, onBack }: CompareViewProps) {
  const [comparison, setComparison] = useState<PaperComparison | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      try {
        const text1 = paper1.fullText || paper1.aiSummary?.abstract?.expert || "";
        const text2 = paper2.fullText || paper2.aiSummary?.abstract?.expert || "";
        if (!text1 || !text2) throw new Error("One or both papers have no text to compare.");
        const result = await comparePapers(text1, text2);
        setComparison(result);
      } catch (err: any) {
        setError(err.message || "Comparison failed.");
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [paper1, paper2]);

  const title1 = paper1.title;
  const title2 = paper2.title;

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-16">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 mb-6"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="bg-stone-900 text-white p-2 rounded">
            <GitCompare size={20} />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold">Paper Comparison</h1>
            <p className="text-xs text-stone-500 mt-0.5">AI-generated side-by-side analysis</p>
          </div>
        </div>

        {/* Paper labels */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[{ paper: paper1, label: "Paper 1" }, { paper: paper2, label: "Paper 2" }].map(({ paper, label }) => (
            <div key={label} className="bg-white border border-stone-200 rounded-xl p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">{label}</p>
              <p className="font-serif font-semibold text-sm leading-snug">{paper.title}</p>
              <p className="text-xs text-stone-500 mt-1">
                {Array.isArray(paper.authors) ? paper.authors.join(", ") : paper.authors}
              </p>
            </div>
          ))}
        </div>

        {loading && (
          <div className="bg-white border border-stone-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-stone-500">Comparing papers — this takes about 15 seconds...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-sm text-red-700">{error}</div>
        )}

        {comparison && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="font-serif text-lg font-bold mb-2">Overview</h2>
              <p className="text-sm text-stone-700 leading-relaxed">{comparison.summary}</p>
            </div>

            {/* Dimension grid */}
            {DIMENSIONS.map(({ key, label }) => (
              <div key={key} className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="font-serif text-lg font-bold mb-4">{label}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {(["paper1", "paper2"] as const).map((pk, i) => (
                    <div key={pk} className="bg-stone-50 border border-stone-100 rounded-lg p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 mb-1">
                        Paper {i + 1} — {i === 0 ? title1 : title2}
                      </p>
                      <p className="text-sm text-stone-800">{comparison[key][pk]}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-stone-900 text-white rounded-lg px-4 py-3 text-xs">
                  <span className="font-semibold uppercase tracking-wide text-stone-300 mr-2">Verdict</span>
                  {comparison[key].verdict}
                </div>
              </div>
            ))}

            {/* Agreements & Disagreements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="font-serif text-lg font-bold mb-3 text-green-800">Where They Agree</h2>
                <ul className="space-y-2">
                  {comparison.agreements.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-stone-700">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="font-serif text-lg font-bold mb-3 text-amber-800">Where They Differ</h2>
                <ul className="space-y-2">
                  {comparison.disagreements.map((point, i) => (
                    <li key={i} className="flex gap-2 text-sm text-stone-700">
                      <span className="text-amber-600 mt-0.5">≠</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-stone-900 text-white rounded-xl p-6">
              <h2 className="font-serif text-lg font-bold mb-2">Recommendation</h2>
              <p className="text-sm text-stone-300 leading-relaxed">{comparison.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
