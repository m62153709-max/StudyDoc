// src/components/LandingPage.tsx
import {
  Upload,
  Search,
  Activity,
  ChevronLeft,
  Award,
  Lock,
} from "lucide-react";
import { PAPERS } from "../data/papers";

interface LandingPageProps {
  onSelectPaper: (paper: typeof PAPERS[0]) => void;
  onUpload: () => void;
  onBrowseLibrary?: () => void;
  onGoPremium?: () => void;
}


const LandingPage = ({ onSelectPaper, onUpload, onBrowseLibrary, onGoPremium }: LandingPageProps) => (

  <div className="animate-fade-in">
    {/* HERO */}
    <div className="text-center py-16 px-4">
      <div className="inline-flex items-center justify-center p-3 bg-stone-200 rounded-full mb-6">
        <svg
          className="w-8 h-8 text-stone-700"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
      </div>

      <h1 className="text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight">
        Complex Papers,
        <span className="italic text-stone-600"> Simplified.</span>
      </h1>

      <p className="text-lg text-stone-600 max-w-2xl mx-auto font-serif mb-8 leading-relaxed">
        Upload any academic PDF. StudyDoc rebuilds it into layered explanations,
        research details, concept diagrams, tutor-style Q&amp;A, and quizzes—so
        you spend your time learning, not decoding.
      </p>

      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onUpload}
          className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-stone-800 transition-all"
        >
          <Upload size={20} />
          Upload Paper
          <span className="text-xs text-stone-300 ml-1">Takes ~10 seconds</span>
        </button>

        <button
          onClick={onBrowseLibrary}
          className="flex items-center gap-2 bg-white text-stone-900 border border-stone-300 px-6 py-3 rounded-lg shadow-sm hover:bg-stone-50 transition-all"
        >
          <Search size={20} />
          Browse Library
        </button>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-stone-500">
        <span>Built for students, researchers, and lifelong learners.</span>
        <span className="hidden md:inline">•</span>
        <span>Explanation · Details · Diagrams · Tutor Mode · Quiz · Citations</span>
      </div>
    </div>

    {/* HOW IT WORKS */}
    <div className="max-w-5xl mx-auto px-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-800">
            How StudyDoc fits into your workflow
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-xl">
            No new tools or complicated setup. Drop in a PDF and explore it
            from multiple angles in a single, focused interface.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
            1
          </div>
          <h3 className="text-sm font-semibold text-stone-900 mb-1">
            Upload any academic PDF
          </h3>
          <p className="text-sm text-stone-600">
            Journal articles, preprints, lecture notes, textbook chapters—if
            it&apos;s a PDF, StudyDoc can read it.
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
            2
          </div>
          <h3 className="text-sm font-semibold text-stone-900 mb-1">
            Switch between learning modes
          </h3>
          <p className="text-sm text-stone-600">
            Use Explanation for the big picture, Details for methods and
            results, Diagrams for concept flow, and Tutor Mode for targeted
            questions.
          </p>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
          <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
            3
          </div>
          <h3 className="text-sm font-semibold text-stone-900 mb-1">
            Capture what matters
          </h3>
          <p className="text-sm text-stone-600">
            Save papers to your library, copy key sections as Markdown, and
            grab citations when you&apos;re ready to write or present.
          </p>
        </div>
      </div>
    </div>

    {/* TRENDING RESEARCH */}
    <div className="max-w-6xl mx-auto px-6 pb-20">
      <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 border-b border-stone-200 pb-2">
        Trending Research
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PAPERS.map((paper) => (
          <div
            key={paper.id}
            onClick={() => onSelectPaper(paper)}
            className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded">
                  {paper.field}
                </span>
                <span className="text-stone-400 text-sm">
                  {paper.readTime}
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2 leading-tight group-hover:text-red-800 transition-colors">
                {paper.title}
              </h3>
              <p className="text-sm text-stone-500 italic mb-4">
                by {paper.author}
              </p>
              <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">
                {paper.abstract}
              </p>
            </div>
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex items-center justify-between text-sm font-medium text-stone-600">
              <span className="flex items-center gap-1">
                <Activity size={16} /> Interactive
              </span>
              <span className="flex items-center gap-1 text-red-700 group-hover:translate-x-1 transition-transform">
                Read Now <ChevronLeft className="rotate-180" size={16} />
              </span>
            </div>
          </div>
        ))}

        

      </div>
    </div>
  </div>
);

export default LandingPage;
