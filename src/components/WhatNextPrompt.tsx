// src/components/WhatNextPrompt.tsx
import { MessageCircle, ListChecks, GitCompare, X } from "lucide-react";

interface WhatNextPromptProps {
  onTutor: () => void;
  onQuiz: () => void;
  onCompare: () => void;
  onDismiss: () => void;
}

const WhatNextPrompt = ({ onTutor, onQuiz, onCompare, onDismiss }: WhatNextPromptProps) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-in">
    <div className="bg-stone-900 text-white rounded-2xl shadow-2xl px-6 py-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-serif font-bold text-base">What do you want to do next?</p>
          <p className="text-stone-400 text-xs mt-0.5">You've read the summary — go deeper.</p>
        </div>
        <button onClick={onDismiss} className="text-stone-500 hover:text-stone-300 transition-colors mt-0.5">
          <X size={16} />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={onTutor}
          className="flex flex-col items-center gap-2 bg-stone-800 hover:bg-stone-700 rounded-xl px-3 py-4 transition-colors text-center"
        >
          <MessageCircle size={20} className="text-stone-300" />
          <span className="text-xs font-medium leading-tight">Ask Tutor<br/>a question</span>
        </button>
        <button
          onClick={onQuiz}
          className="flex flex-col items-center gap-2 bg-stone-800 hover:bg-stone-700 rounded-xl px-3 py-4 transition-colors text-center"
        >
          <ListChecks size={20} className="text-stone-300" />
          <span className="text-xs font-medium leading-tight">Test your<br/>understanding</span>
        </button>
        <button
          onClick={onCompare}
          className="flex flex-col items-center gap-2 bg-stone-800 hover:bg-stone-700 rounded-xl px-3 py-4 transition-colors text-center"
        >
          <GitCompare size={20} className="text-stone-300" />
          <span className="text-xs font-medium leading-tight">Compare<br/>two papers</span>
        </button>
      </div>
    </div>
  </div>
);

export default WhatNextPrompt;
