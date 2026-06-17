// src/components/LandingPage.tsx
import {
  Upload,
  Search,
  Activity,
  ChevronLeft,
  BookOpen,
  Brain,
  FileText,
  MessageCircle,
  ListChecks,
  GitCompare,
} from "lucide-react";
import { PAPERS } from "../data/papers";

interface LandingPageProps {
  onSelectPaper: (paper: typeof PAPERS[0]) => void;
  onUpload: () => void;
  onBrowseLibrary?: () => void;
  onGoPremium?: () => void;
}

const FAQS = [
  {
    q: "What types of PDFs does StudyDoc support?",
    a: "StudyDoc supports any academic PDF — journal articles, preprints, conference papers, lecture notes, and textbook chapters. It also supports scanned PDFs using built-in OCR technology, so even image-based documents can be analyzed.",
  },
  {
    q: "How does StudyDoc explain academic papers?",
    a: "StudyDoc uses AI to generate three levels of explanation for every paper: Beginner (plain language for non-experts), Intermediate (for undergraduates in the field), and Expert (graduate-level depth). It also produces section-by-section summaries, key takeaways, and a structured breakdown of research question, methodology, data, results, and limitations.",
  },
  {
    q: "Is StudyDoc free to use?",
    a: "Yes. StudyDoc's free plan includes 3 AI-powered PDF uploads per day, a saved paper library, multi-level explanations, quizzes, concept diagrams, and citation generation. The Pro plan at $8/month adds higher upload limits, full Tutor Mode, and semantic search across your entire library.",
  },
  {
    q: "Can StudyDoc generate citations?",
    a: "Yes. StudyDoc automatically extracts publication metadata — title, authors, year, journal, DOI, volume, and page numbers — and formats citations in APA, MLA, Chicago, IEEE, and BibTeX styles with one click.",
  },
  {
    q: "What is Tutor Mode?",
    a: "Tutor Mode lets you ask any question about a paper and receive a detailed answer grounded exclusively in that paper's content. Answers are adapted to your chosen expertise level. It works like a one-on-one tutor who has read the entire paper.",
  },
  {
    q: "Can I compare two research papers?",
    a: "Yes. StudyDoc's Compare feature lets you select any two papers from your library and generates a structured side-by-side analysis covering research questions, methodology, findings, scope, agreements, disagreements, and a reading recommendation.",
  },
  {
    q: "Who is StudyDoc built for?",
    a: "StudyDoc is built for undergraduate and graduate students, researchers doing literature reviews, pre-med and STEM students, social science scholars, and anyone who regularly reads academic papers and wants to understand them faster and more deeply.",
  },
];

const FEATURES = [
  { icon: <Brain size={18} />, label: "Multi-level AI Explanations", desc: "Beginner, Intermediate, and Expert summaries for every paper." },
  { icon: <FileText size={18} />, label: "Section-by-Section Summaries", desc: "Introduction through Conclusion — broken down clearly." },
  { icon: <MessageCircle size={18} />, label: "Tutor Mode Q&A", desc: "Ask anything about the paper. Answers grounded in the text." },
  { icon: <ListChecks size={18} />, label: "Auto-Generated Quizzes", desc: "Test your comprehension with AI-written multiple choice questions." },
  { icon: <BookOpen size={18} />, label: "Citation Generator", desc: "APA, MLA, Chicago, IEEE, and BibTeX — auto-extracted from the PDF." },
  { icon: <GitCompare size={18} />, label: "Compare Two Papers", desc: "Side-by-side AI analysis of methodology, findings, and scope." },
];

const LandingPage = ({ onSelectPaper, onUpload, onBrowseLibrary }: LandingPageProps) => {
  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <section className="text-center py-16 px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 mb-4">
          AI-Powered Academic Paper Reader
        </p>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4 tracking-tight leading-tight">
          Understand Any Research Paper<br className="hidden md:block" />
          <span className="italic text-stone-600"> in Minutes, Not Hours.</span>
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-3 leading-relaxed">
          Upload any academic PDF — journal articles, preprints, lecture notes, even scanned documents.
          StudyDoc's AI instantly generates layered explanations, concept diagrams, tutor-style Q&amp;A,
          quizzes, and formatted citations.
        </p>
        <p className="text-sm text-stone-500 max-w-xl mx-auto mb-8">
          Used by students, graduate researchers, and professionals across STEM, social sciences, medicine, and humanities.
        </p>

        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={onUpload}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-stone-800 transition-all"
          >
            <Upload size={20} />
            Upload a Paper — It's Free
            <span className="text-xs text-stone-300 ml-1">~10 seconds</span>
          </button>
          <button
            onClick={onBrowseLibrary}
            className="flex items-center gap-2 bg-white text-stone-900 border border-stone-300 px-6 py-3 rounded-lg shadow-sm hover:bg-stone-50 transition-all"
          >
            <Search size={20} />
            Browse My Library
          </button>
        </div>

        <p className="mt-5 text-xs text-stone-400">
          No credit card required · 3 free AI-powered uploads per day · Works on any academic PDF
        </p>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 text-center">
          Everything you need to read research faster
        </h2>
        <p className="text-sm text-stone-500 text-center mb-8 max-w-xl mx-auto">
          StudyDoc is an AI research tool built specifically for academic papers — not a generic AI chatbot.
          Every feature is designed around how students and researchers actually read.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.label} className="rounded-xl border border-stone-200 bg-white p-4">
              <div className="flex items-center gap-2 mb-2 text-stone-800 font-semibold text-sm">
                <span className="text-stone-600">{f.icon}</span>
                {f.label}
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-5xl mx-auto px-6 pb-14">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
          How StudyDoc works
        </h2>
        <p className="text-sm text-stone-600 mb-6 max-w-xl">
          No complicated setup. Drop in a PDF and explore it from multiple angles — in a single focused interface.
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: "1",
              title: "Upload any academic PDF",
              body: "Journal articles, preprints, lecture notes, textbook chapters — if it's a PDF, StudyDoc can read it. Scanned documents are supported via built-in OCR.",
            },
            {
              n: "2",
              title: "Explore at your level",
              body: "Switch between Beginner, Intermediate, and Expert explanations. Use the Details tab for methods and results, Tutor Mode for targeted questions, or Quiz for self-testing.",
            },
            {
              n: "3",
              title: "Save, cite, and compare",
              body: "Save papers to your personal library, generate citations in any format, write notes, and compare two papers side-by-side to spot agreements and contradictions.",
            },
          ].map((step) => (
            <div key={step.n} className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
              <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-white">
                {step.n}
              </div>
              <h3 className="text-sm font-semibold text-stone-900 mb-1">{step.title}</h3>
              <p className="text-sm text-stone-600">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TRENDING RESEARCH */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
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
                  <span className="text-stone-400 text-sm">{paper.readTime}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-2 leading-tight group-hover:text-red-800 transition-colors">
                  {paper.title}
                </h3>
                <p className="text-sm text-stone-500 italic mb-4">by {paper.author}</p>
                <p className="text-stone-600 text-sm line-clamp-3 leading-relaxed">{paper.abstract}</p>
              </div>
              <div className="bg-stone-50 px-6 py-4 border-t border-stone-100 flex items-center justify-between text-sm font-medium text-stone-600">
                <span className="flex items-center gap-1"><Activity size={16} /> Interactive</span>
                <span className="flex items-center gap-1 text-red-700 group-hover:translate-x-1 transition-transform">
                  Read Now <ChevronLeft className="rotate-180" size={16} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2 text-center">
          Frequently asked questions
        </h2>
        <p className="text-sm text-stone-500 text-center mb-8">
          Everything you need to know about StudyDoc's AI research paper reader.
        </p>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-stone-200 bg-white"
            >
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-semibold text-stone-900 list-none">
                {faq.q}
                <span className="ml-4 text-stone-400 group-open:rotate-180 transition-transform text-lg leading-none">↓</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-stone-600 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
