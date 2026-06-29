// src/components/OnboardingChecklist.tsx
import { useState } from "react";
import { CheckCircle2, Circle, X, ChevronDown, ChevronUp } from "lucide-react";

export type ChecklistKey =
  | "uploaded"
  | "tutor"
  | "quiz"
  | "citation"
  | "compare";

interface OnboardingChecklistProps {
  completed: Record<ChecklistKey, boolean>;
  onDismiss: () => void;
  onGoTutor: () => void;
  onGoQuiz: () => void;
  onGoCitation: () => void;
  onGoCompare: () => void;
}

const STEPS: { key: ChecklistKey; label: string; cta: string }[] = [
  { key: "uploaded", label: "Upload your first paper", cta: "" },
  { key: "tutor", label: "Ask Tutor Mode a question", cta: "Try it →" },
  { key: "quiz", label: "Take a comprehension quiz", cta: "Quiz me →" },
  { key: "citation", label: "Generate a citation", cta: "Get citation →" },
  { key: "compare", label: "Compare two papers", cta: "Compare →" },
];

const STORAGE_KEY = "studydoc_checklist_dismissed";

export function useChecklistDismissed() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === "true"
  );
  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };
  return { dismissed, dismiss };
}

const OnboardingChecklist = ({
  completed,
  onDismiss,
  onGoTutor,
  onGoQuiz,
  onGoCitation,
  onGoCompare,
}: OnboardingChecklistProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const doneCount = Object.values(completed).filter(Boolean).length;
  const total = STEPS.length;
  const allDone = doneCount === total;

  const ctaHandlers: Record<ChecklistKey, (() => void) | undefined> = {
    uploaded: undefined,
    tutor: onGoTutor,
    quiz: onGoQuiz,
    citation: onGoCitation,
    compare: onGoCompare,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-900 text-white">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {allDone ? "🎉 All done!" : "Get started"}
          </span>
          <span className="text-xs text-stone-400">
            {doneCount}/{total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-stone-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          <button
            onClick={onDismiss}
            className="text-stone-400 hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-stone-100">
        <div
          className="h-1 bg-stone-800 transition-all duration-500"
          style={{ width: `${(doneCount / total) * 100}%` }}
        />
      </div>

      {/* Steps */}
      {!collapsed && (
        <ul className="px-4 py-3 space-y-2">
          {STEPS.map((step) => {
            const done = completed[step.key];
            const handler = ctaHandlers[step.key];
            return (
              <li key={step.key} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {done ? (
                    <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  ) : (
                    <Circle size={16} className="text-stone-300 shrink-0" />
                  )}
                  <span
                    className={`text-xs ${
                      done ? "line-through text-stone-400" : "text-stone-700"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {!done && handler && (
                  <button
                    onClick={handler}
                    className="text-[11px] font-medium text-red-700 hover:text-red-800 whitespace-nowrap shrink-0"
                  >
                    {step.cta}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default OnboardingChecklist;
