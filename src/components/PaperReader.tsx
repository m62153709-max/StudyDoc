// src/components/PaperReader.tsx
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  HelpCircle,
  ListChecks,
  MessageCircle,
  Workflow,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
} from "lucide-react";
import type {
  AIPaperSummary,
  TutorLevel,
  AIDiagram,
  ResearchDetails,
} from "../lib/ai";
import { answerQuestionAboutPaper, generateDiagramForPaper } from "../lib/ai";
import Quiz from "./Quiz";
import type { LibraryPaper } from "../types/library";

type PaperWithAI = {
  title: string;
  authors?: string[] | string;
  category?: string;
  readTime?: string;
  aiSummary?: AIPaperSummary;
  fullText?: string; // used by Tutor Mode & Diagram
};

interface PaperReaderProps {
  paper: PaperWithAI;
  onBack: () => void;
  // Optional: related papers from the library (computed in App)
  relatedPapers?: LibraryPaper[];
  onOpenRelatedPaper?: (paper: LibraryPaper) => void;
}

type ModuleTab =
  | "explanation"
  | "details"
  | "diagram"
  | "tutor"
  | "quiz"
  | "citations";
type CitationStyle = "apa" | "mla" | "chicago" | "ieee" | "bibtex";

function PaperReader({
  paper,
  onBack,
  relatedPapers,
  onOpenRelatedPaper,
}: PaperReaderProps) {
  const [level, setLevel] = useState<"beginner" | "intermediate" | "expert">(
    "intermediate"
  );
  const [activeTab, setActiveTab] = useState<ModuleTab>("explanation");

  const ai = paper.aiSummary;

  const authorLine = Array.isArray(paper.authors)
    ? paper.authors.join(", ")
    : paper.authors || "Unknown authors";

  const abstractText =
    ai?.abstract?.[level] ||
    "No AI-generated explanation available for this paper yet.";

  // Tutor mode state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  const [qaError, setQaError] = useState<string | null>(null);

  // Diagram state
  const [diagram, setDiagram] = useState<AIDiagram | null>(null);
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  const [diagramError, setDiagramError] = useState<string | null>(null);

  // Citations state
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("apa");
  const [citationCopied, setCitationCopied] = useState(false);

  // Section expansion state (for structured summary)
  const [openSectionIndex, setOpenSectionIndex] = useState<number | null>(0);

  const citationTitle = ai?.title || paper.title;

  // --- CITATION GENERATION ---
  function getCitation(style: CitationStyle): string {
    const authors = authorLine;
    const title = citationTitle;
    const year = "n.d."; // placeholder until we have real year metadata

    switch (style) {
      case "apa":
        return `${authors} (${year}). ${title}.`;
      case "mla":
        return `${authors}. "${title}."`;
      case "chicago":
        return `${authors}. "${title}."`;
      case "ieee":
        return `${authors}, "${title}," ${year}.`;
      case "bibtex":
        return `@article{forcite_${title
          .toLowerCase()
          .slice(0, 20)
          .replace(/[^a-z0-9]+/g, "_")},
  title = {${title}},
  author = {${authors}},
  year = {${year}},
}`;
      default:
        return `${authors} (${year}). ${title}.`;
    }
  }

  const currentCitation = getCitation(citationStyle);

  const handleCopyCitation = async () => {
    try {
      await navigator.clipboard.writeText(currentCitation);
      setCitationCopied(true);
      setTimeout(() => setCitationCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy citation", err);
    }
  };

  // --- TUTOR MODE ---
  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    if (!paper.fullText) {
      setQaError(
        "Tutor mode is not available for this paper (no full text loaded)."
      );
      return;
    }

    try {
      setIsAsking(true);
      setQaError(null);
      setAnswer(null);

      const tutorLevel: TutorLevel = level;
      const response = await answerQuestionAboutPaper(
        paper.fullText,
        trimmed,
        tutorLevel
      );

      setAnswer(response);
    } catch (err) {
      console.error(err);
      setQaError(
        "Something went wrong answering your question. Please try again."
      );
    } finally {
      setIsAsking(false);
    }
  };

  // --- DIAGRAM ---
  const handleGenerateDiagram = async () => {
    const sourceText = paper.fullText || abstractText;
    if (!sourceText || sourceText.includes("No AI-generated explanation")) {
      setDiagramError("No suitable text available to build a diagram.");
      return;
    }

    try {
      setIsGeneratingDiagram(true);
      setDiagramError(null);

      const tutorLevel: TutorLevel = level;
      const result = await generateDiagramForPaper(sourceText, tutorLevel);

      setDiagram(result);
    } catch (err) {
      console.error(err);
      setDiagramError(
        "Something went wrong creating the diagram. Please try again."
      );
    } finally {
      setIsGeneratingDiagram(false);
    }
  };

  const modules: { id: ModuleTab; label: string }[] = [
    { id: "explanation", label: "Explanation" },
    { id: "details", label: "Details" },
    { id: "diagram", label: "Concept Diagram" },
    { id: "tutor", label: "Tutor Mode" },
    { id: "quiz", label: "Quiz" },
    { id: "citations", label: "Citations" },
  ];

  // --- DETAILS TAB HELPERS ---

  const details: ResearchDetails | undefined = ai?.research_details;

  const detailsAsMarkdown = details
    ? `### ${ai?.title || paper.title}

**Research question**  
${details.research_question}

**Domain**  
${details.domain}

**Methodology**  
${details.methodology}

**Data / participants**  
${details.data}

**Key results**  
${details.key_results}

**Limitations**  
${details.limitations}

**Future work**  
${details.future_work}
`
    : "";

  const handleCopyDetailsMarkdown = async () => {
    if (!detailsAsMarkdown) return;
    try {
      await navigator.clipboard.writeText(detailsAsMarkdown);
      // we reuse citationCopied state? better to keep separate; but for now:
      setCitationCopied(true);
      setTimeout(() => setCitationCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy details markdown", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      {/* Top nav / back link */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          <span>Back to Library</span>
        </button>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start gap-3 mb-3">
            <div className="bg-stone-900 text-white p-2 rounded">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight">
                {ai?.title || paper.title}
              </h1>
              <p className="mt-2 text-stone-500 text-sm">
                Original Authors: {authorLine}
              </p>
              <p className="mt-1 text-stone-400 text-xs">
                {paper.category || "Custom Upload"}
                {paper.readTime ? ` · ${paper.readTime}` : null}
              </p>
            </div>
          </div>

          {/* Level selector */}
          <div className="inline-flex rounded-full border border-stone-200 bg-white text-xs font-medium overflow-hidden">
            {(["beginner", "intermediate", "expert"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`px-4 py-1 capitalize ${
                  level === lvl
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </header>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 pb-16 grid grid-cols-1 md:grid-cols-[260px_minmax(0,1fr)] gap-8">
        {/* Sidebar modules + related */}
        <aside className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-stone-500 tracking-wide mb-2">
              MODULES
            </p>
            <div className="mt-3 space-y-2 text-sm">
              {modules.map((mod) => {
                const isActive = activeTab === mod.id;
                const icon =
                  mod.id === "explanation" ? (
                    <BookOpen size={16} />
                  ) : mod.id === "details" ? (
                    <HelpCircle size={16} />
                  ) : mod.id === "diagram" ? (
                    <Workflow size={16} />
                  ) : mod.id === "tutor" ? (
                    <MessageCircle size={16} />
                  ) : mod.id === "quiz" ? (
                    <ListChecks size={16} />
                  ) : (
                    <HelpCircle size={16} />
                  );

                return (
                  <button
                    key={mod.id}
                    onClick={() => setActiveTab(mod.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left ${
                      isActive
                        ? "bg-stone-900 text-white"
                        : "text-stone-700 border border-stone-200 hover:bg-stone-50"
                    } text-xs`}
                  >
                    <span className="flex items-center gap-2">
                      {icon}
                      {mod.label}
                    </span>
                    {isActive && (
                      <span className="text-[10px] uppercase tracking-wide opacity-70">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-4 text-xs text-stone-500 space-y-2">
            <p className="font-semibold text-stone-700">How to use this page</p>
            <p>
              Switch between Beginner, Intermediate, and Expert to view layered
              explanations. Use Details for methods/results/limitations,
              Diagram for concept flow, Tutor Mode for questions, Quiz for
              self-test, and Citations when writing.
            </p>
          </div>

          {/* Related in my library */}
          {relatedPapers && relatedPapers.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-4 text-xs">
              <p className="font-semibold text-stone-700 mb-2">
                Related in My Library
              </p>
              <ul className="space-y-2">
                {relatedPapers.map((p) => (
                  <li key={p.id}>
                    <button
                      disabled={!onOpenRelatedPaper}
                      onClick={() =>
                        onOpenRelatedPaper && onOpenRelatedPaper(p)
                      }
                      className="text-left w-full group"
                    >
                      <p className="text-[11px] font-medium text-stone-900 group-hover:underline line-clamp-2">
                        {p.title}
                      </p>
                      <p className="text-[10px] text-stone-500 line-clamp-1">
                        {typeof p.authors === "string"
                          ? p.authors
                          : p.authors?.join(", ")}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[10px] text-stone-400">
                Based on semantic similarity of full-text embeddings.
              </p>
            </div>
          )}
        </aside>

        {/* Tabbed content */}
        <section className="space-y-8">
          {/* Explanation */}
          {activeTab === "explanation" && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 space-y-6">
              {/* Overall abstract / overview */}
              <div>
                <h2 className="font-serif text-xl font-bold mb-2">
                  Paper Overview
                </h2>
                <p className="text-sm leading-relaxed text-stone-800 whitespace-pre-line">
                  {abstractText}
                </p>
              </div>

              {/* Structured section summaries */}
              <div>
                <h3 className="font-serif text-lg font-semibold mb-2">
                  Section-by-Section Summary
                </h3>
                {ai?.sections && ai.sections.length > 0 ? (
                  <div className="space-y-2">
                    {ai.sections.map((section, idx) => {
                      const isOpen = openSectionIndex === idx;
                      const sectionText =
                        level === "beginner"
                          ? section.beginner
                          : level === "intermediate"
                          ? section.intermediate
                          : section.expert;

                      return (
                        <div
                          key={idx}
                          className="border border-stone-200 rounded-lg bg-stone-50"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setOpenSectionIndex(isOpen ? null : idx)
                            }
                            className="w-full flex items-center justify-between px-3 py-2 text-left"
                          >
                            <span className="text-sm font-medium text-stone-900">
                              {section.label}
                            </span>
                            {isOpen ? (
                              <ChevronDown className="w-4 h-4 text-stone-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-stone-500" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-3 pb-3 text-xs text-stone-800 whitespace-pre-line">
                              {sectionText}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">
                    No structured section summaries available for this paper yet.
                  </p>
                )}
              </div>

              {/* Key Takeaways */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-stone-900 mb-2">
                  <span className="w-5 h-5 rounded-full border border-stone-300 flex items-center justify-center text-[11px]">
                    ★
                  </span>
                  Key Takeaways
                </h3>
                {ai?.key_takeaways && ai.key_takeaways.length > 0 ? (
                  <ul className="bg-stone-50 border border-stone-100 rounded-lg p-4 space-y-2 text-sm text-stone-700">
                    {ai.key_takeaways.map((point, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="mt-1 text-[10px]">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400">
                    No AI-generated takeaways available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Details tab */}
          {activeTab === "details" && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-xl font-bold">
                  Research Details
                </h2>
                <button
                  type="button"
                  onClick={handleCopyDetailsMarkdown}
                  disabled={!details}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                >
                  <ClipboardCopy className="w-3 h-3" />
                  Copy as Markdown
                </button>
              </div>
              <p className="text-xs text-stone-500 mb-2">
                A structured snapshot of this study&apos;s question, methods,
                data, results, and limitations – ready to paste into a lit
                review or notes.
              </p>

              {details ? (
                <div className="grid gap-4 md:grid-cols-2 text-sm">
                  <DetailsField
                    label="Research question"
                    text={details.research_question}
                  />
                  <DetailsField label="Domain" text={details.domain} />
                  <DetailsField
                    label="Methodology"
                    text={details.methodology}
                  />
                  <DetailsField label="Data / participants" text={details.data} />
                  <DetailsField
                    label="Key results"
                    text={details.key_results}
                  />
                  <DetailsField
                    label="Limitations"
                    text={details.limitations}
                  />
                  <DetailsField
                    label="Future work"
                    text={details.future_work}
                  />
                </div>
              ) : (
                <p className="text-xs text-stone-400">
                  No structured research details available for this paper yet.
                </p>
              )}
            </div>
          )}

          {/* Concept Diagram */}
          {activeTab === "diagram" && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Workflow size={18} className="text-stone-700" />
                <h2 className="font-serif text-xl font-bold">Concept Diagram</h2>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Generate a step-by-step visual of how the main ideas in this
                paper connect, tailored to the current level (
                <span className="capitalize">{level}</span>).
              </p>

              <div className="flex items-center justify-between gap-3 mb-4">
                {diagramError && (
                  <p className="text-xs text-red-600">{diagramError}</p>
                )}
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={handleGenerateDiagram}
                  disabled={isGeneratingDiagram}
                  className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                >
                  {isGeneratingDiagram ? "Generating..." : "Generate Diagram"}
                </button>
              </div>

              {diagram && (
                <div className="mt-2">
                  <h3 className="font-serif font-semibold text-sm mb-1">
                    {diagram.title}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    {diagram.description}
                  </p>

                  <div className="relative pl-4 md:pl-6">
                    <div className="absolute left-1 md:left-2 top-0 bottom-0 w-px bg-stone-200" />
                    <div className="space-y-4">
                      {diagram.steps.map((step, idx) => (
                        <div key={idx} className="relative flex gap-3">
                          <div className="absolute -left-1.5 md:-left-2 top-1">
                            <div className="w-5 h-5 rounded-full bg-stone-900 text-white text-[11px] flex items-center justify-center">
                              {idx + 1}
                            </div>
                          </div>
                          <div className="ml-4 md:ml-2 bg-stone-50 border border-stone-100 rounded-lg px-3 py-2">
                            <p className="text-sm font-medium text-stone-900">
                              {step.label}
                            </p>
                            <p className="text-xs text-stone-700 mt-1 whitespace-pre-line">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tutor Mode */}
          {activeTab === "tutor" && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={18} className="text-stone-700" />
                <h2 className="font-serif text-xl font-bold">Tutor Mode</h2>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Ask any question about this paper. Answers use only the paper
                content and are tailored to the current level (
                <span className="capitalize">{level}</span>).
              </p>

              <form onSubmit={handleAsk} className="space-y-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What part of this paper is confusing? Ask about methods, results, assumptions, or anything else."
                  className="w-full min-h-[80px] text-sm rounded-lg border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 resize-y"
                />
                <div className="flex items-center justify-between gap-3">
                  {qaError && (
                    <p className="text-xs text-red-600">{qaError}</p>
                  )}
                  <div className="flex-1" />
                  <button
                    type="submit"
                    disabled={isAsking || !question.trim()}
                    className="inline-flex items-center gap-2 bg-stone-900 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-800 transition-colors"
                  >
                    {isAsking ? "Thinking..." : "Ask Tutor"}
                  </button>
                </div>
              </form>

              {answer && (
                <div className="mt-4 bg-stone-50 border border-stone-100 rounded-lg p-4 text-sm text-stone-800 whitespace-pre-line">
                  {answer}
                </div>
              )}
            </div>
          )}

          {/* Quiz */}
          {activeTab === "quiz" && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <ListChecks size={18} className="text-stone-700" />
                <h2 className="font-serif text-xl font-bold">Quick Quiz</h2>
              </div>

              {ai?.quiz && ai.quiz.length > 0 ? (
                <Quiz
                  questions={ai.quiz.map((q) => ({
                    question: q.question,
                    options: q.options,
                    answerIndex: q.answer_index,
                    explanation: q.explanation,
                  }))}
                />
              ) : (
                <p className="text-xs text-stone-400">
                  No AI-generated quiz questions available for this paper yet.
                </p>
              )}
            </div>
          )}

          {/* Citations */}
          {activeTab === "citations" && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle size={18} className="text-stone-700" />
                <h2 className="font-serif text-xl font-bold">Citations</h2>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Choose a style and copy a ready-made citation for this paper. We
                can later plug in full metadata like year, journal, and DOI.
              </p>

              {/* Style selector */}
              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                {(
                  [
                    ["apa", "APA"],
                    ["mla", "MLA"],
                    ["chicago", "Chicago"],
                    ["ieee", "IEEE"],
                    ["bibtex", "BibTeX"],
                  ] as [CitationStyle, string][]
                ).map(([style, label]) => (
                  <button
                    key={style}
                    onClick={() => setCitationStyle(style)}
                    className={`px-3 py-1 rounded-full border text-xs ${
                      citationStyle === style
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Citation text */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-stone-700 mb-1">
                    {citationStyle.toUpperCase()} citation
                  </p>
                  <div className="bg-stone-50 border border-stone-100 rounded-md px-3 py-2 text-xs text-stone-800 whitespace-pre-wrap">
                    {currentCitation}
                  </div>
                </div>

                <button
                  onClick={handleCopyCitation}
                  className="inline-flex items-center gap-2 bg-stone-900 text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-stone-800 transition-colors"
                >
                  {citationCopied ? "Copied!" : "Copy citation"}
                </button>

                <p className="text-[11px] text-stone-400">
                  Future idea: pull structured metadata (year, journal, DOI)
                  from the PDF or external APIs and generate fully correct
                  references, plus export to .bib / .ris.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function DetailsField({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-stone-50 border border-stone-100 rounded-lg p-3">
      <p className="text-[11px] font-semibold text-stone-600 mb-1">
        {label}
      </p>
      <p className="text-xs text-stone-800 whitespace-pre-line">{text}</p>
    </div>
  );
}

export default PaperReader;
