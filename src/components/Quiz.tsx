import { useState } from "react";
import { RotateCcw, CheckCircle, XCircle } from "lucide-react";

export interface QuizQuestion {
  // main question text
  question: string;
  // answer choices
  options: string[];
  // index of the correct option in `options`
  answerIndex: number;
  // optional explanation to show after answering
  explanation?: string;
}

interface QuizProps {
  questions: QuizQuestion[];
}

const Quiz = ({ questions }: QuizProps) => {
  // answers[questionIndex] = selectedOptionIndex
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIdx: number, optIdx: number) => {
    // don't allow changing answers after submitting
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const score = Object.keys(answers).reduce((acc, key) => {
    const qIdx = Number(key);
    return acc + (answers[qIdx] === questions[qIdx].answerIndex ? 1 : 0);
  }, 0);

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-serif text-xl font-bold text-stone-800">
          Knowledge Check
        </h3>
        {showResults && (
          <span className="bg-stone-800 text-stone-50 px-3 py-1 rounded text-sm font-medium">
            Score: {score}/{questions.length}
          </span>
        )}
      </div>

      {questions.map((q, idx) => {
        const selected = answers[idx];
        const hasAnswered = selected !== undefined;
        const isCorrect = hasAnswered && selected === q.answerIndex;

        return (
          <div
            key={idx}
            className="bg-white p-6 rounded-lg border border-stone-200 shadow-sm"
          >
            <p className="font-serif font-medium text-lg mb-4 text-stone-900">
              {idx + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => {
                const isSelected = selected === optIdx;
                const isRightAnswer = optIdx === q.answerIndex;

                const baseClasses =
                  "w-full text-left p-3 rounded border transition-all";

                let stateClasses = "";

                if (!showResults) {
                  // before submitting: just show selection
                  stateClasses = isSelected
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700";
                } else {
                  // after submitting: show correct / incorrect styling
                  if (isRightAnswer) {
                    stateClasses =
                      "bg-green-50 border-green-500 text-green-800";
                  } else if (isSelected && !isRightAnswer) {
                    stateClasses = "bg-red-50 border-red-500 text-red-800";
                  } else {
                    stateClasses = "border-stone-100 opacity-50";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelect(idx, optIdx)}
                    disabled={showResults}
                    className={`${baseClasses} ${stateClasses}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{opt}</span>
                      {showResults && isRightAnswer && (
                        <CheckCircle size={16} />
                      )}
                      {showResults &&
                        isSelected &&
                        !isRightAnswer && <XCircle size={16} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation only after results */}
            {showResults && q.explanation && (
              <p className="mt-3 text-xs text-stone-700 bg-stone-50 border border-stone-200 rounded px-3 py-2">
                <span className="font-semibold">Explanation: </span>
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      <div className="pt-4 flex justify-end">
        {!showResults ? (
          <button
            onClick={() => setShowResults(true)}
            disabled={!allAnswered}
            className="bg-stone-800 text-white px-6 py-2 rounded shadow hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed font-serif"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => {
              setAnswers({});
              setShowResults(false);
            }}
            className="flex items-center gap-2 text-stone-600 hover:text-stone-900 font-medium"
          >
            <RotateCcw size={16} /> Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
