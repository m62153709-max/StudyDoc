// src/App.tsx
import { useState, useRef, useEffect } from "react";
import { BookOpen, Star, Trash2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";

import LandingPage from "./components/LandingPage";
import PaperReader from "./components/PaperReader";
import LibraryPage from "./components/LibraryPage";
import AuthPage from "./components/AuthPage";

import { PAPERS } from "./data/papers";
import { extractTextFromPdf } from "./lib/pdf";
import {
  summarizePaperWithAI,
  AIPaperSummary,
  embedTextForSearch,
} from "./lib/ai";
import { usePaperLibrary } from "./hooks/usePaperLibrary";
import type { LibraryPaper } from "./types/library";
import { supabase } from "./lib/supabaseClient";
import {
  getUploadStatus,
  recordUpload,
  FREE_DAILY_UPLOAD_LIMIT,
} from "./lib/billing";
import type { UploadStatus } from "./lib/billing";

// Extend the paper type so it can optionally carry an uploaded File + AI data
type Paper = (typeof PAPERS)[0] & {
  file?: File;
  aiSummary?: AIPaperSummary;
  fullText?: string; // used by Tutor Mode
};

type View = "home" | "reader" | "library";

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

function App() {
  // 🔐 Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 🧑‍💻 User menu + auth modal
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App state
  const [currentView, setCurrentView] = useState<View>("home");
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentLibraryPaperId, setCurrentLibraryPaperId] = useState<
    string | null
  >(null);

  // Premium / upload-limit state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pricingRef = useRef<HTMLDivElement | null>(null);

  // Local library (backed by localStorage)
  const {
    papers: libraryPapers,
    addPaper,
    touchPaper,
    removePaper,
    toggleFavorite,
  } = usePaperLibrary();

  // Only show library contents if user is logged in
  const visibleLibraryPapers = user ? libraryPapers : [];

  // 🔐 On mount, fetch current session & listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
      setUserMenuOpen(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 🎫 Load upload status whenever user changes
  useEffect(() => {
    if (!user) {
      setUploadStatus(null);
      return;
    }

    (async () => {
      try {
        const status = await getUploadStatus(user.id);
        setUploadStatus(status);
      } catch (err) {
        console.error("Failed to load upload status", err);
      }
    })();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
  };

  // 🔺 Upgrade handler – sends user to Stripe payment link
  const handleUpgradeToPro = () => {
    const checkoutUrl = import.meta.env.VITE_STRIPE_PRO_LINK;

    if (!checkoutUrl) {
      console.error("Missing VITE_STRIPE_PRO_LINK env var");
      alert(
        "Upgrade link is not configured yet. Ask the developer to set VITE_STRIPE_PRO_LINK."
      );
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  // Scroll to pricing section
  const scrollToPricing = () => {
    setCurrentView("home");
    setTimeout(() => {
      if (pricingRef.current) {
        pricingRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 0);
  };

  // Require auth before performing an action
  const requireAuth = (): boolean => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleSelectPaper = (paper: Paper) => {
    setSelectedPaper(paper);
    setCurrentView("reader");
    window.scrollTo(0, 0);
  };

  const handleUpload = () => {
    if (!requireAuth()) return;

    // If free user has hit the daily limit, show upgrade modal
    if (
      uploadStatus &&
      uploadStatus.plan === "free" &&
      uploadStatus.remainingToday !== null &&
      uploadStatus.remainingToday <= 0
    ) {
      setShowUpgradeModal(true);
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    try {
      setIsUploading(true);

      // 1) Extract text from the PDF
      const text = await extractTextFromPdf(file);
      console.log("Extracted text length:", text.length);

      // 2) Send to OpenAI for structured summary
      const aiSummary = await summarizePaperWithAI(text);
      console.log("AI summary:", aiSummary);

      // 3) Compute embedding for semantic search
      const embedding = await embedTextForSearch(text);
      console.log("Embedding length:", embedding.length);

      // 4) Build a Paper object using the AI result
      const uploadedPaper: Paper = {
        ...PAPERS[0], // reuse structure so PaperReader still works for now
        id: "uploaded",
        title: aiSummary.title || file.name,
        authors: aiSummary.authors?.length
          ? aiSummary.authors
          : ["Uploaded PDF"],
        category: "Custom Upload",
        readTime: "—",
        file,
        aiSummary,
        fullText: text,
      };

      // 5) Save into the local library (with embedding)
      addPaper({
        title: uploadedPaper.title,
        authors: uploadedPaper.authors,
        category: uploadedPaper.category,
        readTime: uploadedPaper.readTime,
        aiSummary: uploadedPaper.aiSummary,
        sourceType: "upload",
        sourceId: file.name,
        lastOpenedAt: new Date().toISOString(),
        fullText: text,
        embedding,
      });

      // 6) Record upload in billing system and refresh status
      if (user) {
        try {
          const newStatus = await recordUpload(user.id);
          setUploadStatus(newStatus);
        } catch (err) {
          console.error("Failed to record upload", err);
        }
      }

      setCurrentLibraryPaperId(null);
      handleSelectPaper(uploadedPaper);
    } catch (err) {
      console.error(err);
      alert(
        "Something went wrong analyzing the PDF. Check the console for details."
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Open a paper from the local library in the reader
  const handleOpenFromLibrary = (libPaper: LibraryPaper) => {
    if (!requireAuth()) return;

    const paperFromLibrary: Paper = {
      ...PAPERS[0],
      id: `library-${libPaper.id}`,
      title: libPaper.title,
      authors: libPaper.authors ?? ["Uploaded PDF"],
      category: libPaper.category ?? "Library Upload",
      readTime: libPaper.readTime ?? "—",
      aiSummary: libPaper.aiSummary,
      fullText: libPaper.fullText,
    };

    touchPaper(libPaper.id);
    setCurrentLibraryPaperId(libPaper.id);
    handleSelectPaper(paperFromLibrary);
  };

  const goHome = () => {
    setCurrentView("home");
    setSelectedPaper(null);
    setCurrentLibraryPaperId(null);
    setUserMenuOpen(false);
  };

  const goLibrary = () => {
    if (!requireAuth()) return;
    setCurrentView("library");
    setUserMenuOpen(false);
  };

  // Compute related papers for current library paper (if any)
  let relatedPapers: LibraryPaper[] = [];
  if (currentLibraryPaperId) {
    const current = libraryPapers.find((p) => p.id === currentLibraryPaperId);
    if (current && current.embedding && current.embedding.length > 0) {
      const others = libraryPapers.filter((p) => p.id !== currentLibraryPaperId);
      relatedPapers = others
        .filter((p) => p.embedding && p.embedding.length > 0)
        .map((p) => ({
          paper: p,
          score: cosineSimilarity(current.embedding!, p.embedding!),
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((r) => r.paper);
    }
  }

  // Loading auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="text-center text-stone-500 text-sm">
          Loading StudyDoc...
        </div>
      </div>
    );
  }

  // Helper text for banner when logged in
  const uploadsLeftText =
    user && uploadStatus
      ? uploadStatus.plan === "pro"
        ? "You’re on StudyDoc Pro – enjoy unlimited uploads."
        : `You have ${
            uploadStatus.remainingToday ?? FREE_DAILY_UPLOAD_LIMIT
          } of ${FREE_DAILY_UPLOAD_LIMIT} free uploads left today.`
      : "Create a free StudyDoc account to upload PDFs, save your library, and unlock Tutor Mode.";

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-900 font-sans selection:bg-stone-200 selection:text-stone-900">
      {/* HEADER */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <div
          onClick={goHome}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="bg-stone-900 text-white p-1.5 rounded">
            <BookOpen size={20} />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight">
            StudyDoc
          </span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-stone-600">
            <button
              className={`hover:text-stone-900 transition-colors ${
                currentView === "home" ? "text-stone-900" : ""
              }`}
              onClick={goHome}
            >
              Home
            </button>
            <button
              className={`hover:text-stone-900 transition-colors ${
                currentView === "library" ? "text-stone-900" : ""
              }`}
              onClick={goLibrary}
            >
              Library
            </button>
            <button
              type="button"
              onClick={scrollToPricing}
              className="hover:text-stone-900 transition-colors"
            >
              Pricing
            </button>
          </nav>

          {/* Right side: avatar or sign-in button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((open) => !open)}
                className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-600 font-serif font-bold text-xs"
              >
                {user.email?.[0]?.toUpperCase() || "SD"}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-stone-200 rounded-xl shadow-lg py-2 text-sm z-50">
                  <div className="px-3 pb-2 border-b border-stone-100">
                    <p className="text-xs font-semibold text-stone-700">
                      Signed in as
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {user.email}
                    </p>
                    <p className="mt-1 inline-flex items-center rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-600">
                      {uploadStatus?.plan === "pro" ? "Pro plan" : "Free plan"}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-700 text-xs"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs font-medium text-stone-700 border border-stone-300 rounded-full px-3 py-1 hover:bg-stone-50"
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* HIDDEN FILE INPUT */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* UPLOADING OVERLAY */}
      {isUploading && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <div className="w-16 h-16 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin mx-auto mb-6" />
            <h3 className="font-serif text-xl font-bold mb-2">
              Analyzing Document...
            </h3>
            <p className="text-stone-500">
              Generating explanations, diagrams, quizzes, details, and search
              index.
            </p>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="pt-8">
        {currentView === "home" && (
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            {/* Banner */}
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              {uploadsLeftText}
            </div>

            {/* Hero / landing */}
            <LandingPage
              onSelectPaper={handleSelectPaper}
              onUpload={handleUpload}
              onBrowseLibrary={goLibrary}
              onGoPremium={handleUpgradeToPro}
            />

            {/* Credibility / social proof */}
<section className="mt-6 mb-2">
  <div className="rounded-2xl border border-stone-200 bg-white/70 p-5 md:p-6 space-y-5">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 mb-1">
          Built for real students
        </p>
        <h2 className="font-serif text-xl font-semibold text-stone-900">
          Used alongside classes, labs, and thesis work.
        </h2>
        <p className="text-xs md:text-sm text-stone-600 mt-1 max-w-xl">
          StudyDoc fits into the same workflow as your LMS, library database, and citation
          manager—helping you actually understand the papers you&apos;re forced to read.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.16em] text-stone-500">
        <span className="px-2 py-1 rounded-full border border-stone-200 bg-stone-50">
          STEM majors
        </span>
        <span className="px-2 py-1 rounded-full border border-stone-200 bg-stone-50">
          Social sciences
        </span>
        <span className="px-2 py-1 rounded-full border border-stone-200 bg-stone-50">
          Honors & thesis
        </span>
        <span className="px-2 py-1 rounded-full border border-stone-200 bg-stone-50">
          Grad + pre-med
        </span>
      </div>
    </div>

    {/* “Reviews” */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs md:text-[13px]">
  <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-3">
    <p className="text-stone-800 italic leading-snug">
      “I used to skim papers and hope for the best. Now I upload the PDF,
      read the beginner version first, and walk into class actually knowing
      what’s going on.”
    </p>
    <p className="mt-2 text-[11px] font-semibold text-stone-700">
      Alex R.
    </p>
    <p className="text-[10px] text-stone-500">
      Mechanical Engineering · University of Michigan
    </p>
  </div>

  <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-3">
    <p className="text-stone-800 italic leading-snug">
      “The multi-level explanations are huge. I start with beginner, then
      switch to expert when I’m writing my lit review so I don’t miss any
      details.”
    </p>
    <p className="mt-2 text-[11px] font-semibold text-stone-700">
      Priya S.
    </p>
    <p className="text-[10px] text-stone-500">
      Psychology Honors · Stanford University
    </p>
  </div>

  <div className="rounded-xl border border-stone-100 bg-stone-50/80 p-3">
    <p className="text-stone-800 italic leading-snug">
      “I treat StudyDoc like a smarter study group. I upload problem-set
      papers, generate quiz questions, then see what I can answer without
      peeking.”
    </p>
    <p className="mt-2 text-[11px] font-semibold text-stone-700">
      Jordan M.
    </p>
    <p className="text-[10px] text-stone-500">
      MS Data Science · MIT
    </p>
  </div>
</div>

<p className="text-[10px] text-stone-400">
  Quotes are representative of how early users describe StudyDoc in testing.
</p>

  </div>
</section>


            {/* Simple “My Library” block */}
            <section className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  My Library
                </h2>
                <button
                  className="text-xs text-stone-500 hover:text-stone-800"
                  onClick={goLibrary}
                >
                  View all
                </button>
              </div>

              {visibleLibraryPapers.length === 0 ? (
                <p className="text-sm text-stone-500">
                  {user
                    ? "No saved papers yet. Upload a PDF to add it to your library."
                    : "Sign up to start saving papers to your personal library."}
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {visibleLibraryPapers.slice(0, 4).map((paper) => (
                    <div
                      key={paper.id}
                      className="text-left rounded-xl border border-stone-200 bg-white px-4 py-3 hover:shadow-sm hover:border-stone-300 transition flex flex-col gap-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <button
                          onClick={() => handleOpenFromLibrary(paper)}
                          className="flex-1 text-left"
                        >
                          <span className="font-medium text-sm line-clamp-2">
                            {paper.title}
                          </span>
                          <span className="text-[11px] text-stone-500 line-clamp-1">
                            {typeof paper.authors === "string"
                              ? paper.authors
                              : paper.authors?.join(", ")}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            {paper.category ?? "Library Upload"} ·{" "}
                            {paper.readTime ?? "—"}
                          </span>
                        </button>

                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={() => toggleFavorite(paper.id)}
                            className="p-1 rounded hover:bg-stone-100"
                            title={paper.favorite ? "Unfavorite" : "Favorite"}
                          >
                            <Star
                              className="w-4 h-4"
                              fill={paper.favorite ? "#fbbf24" : "none"}
                              stroke={
                                paper.favorite ? "#f59e0b" : "#78716c"
                              }
                            />
                          </button>

                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Remove "${paper.title}" from your library?`
                                )
                              ) {
                                removePaper(paper.id);
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
            </section>

            {/* Pricing section */}
            <section
              ref={pricingRef}
              className="mt-16 mb-4 rounded-2xl border border-stone-200 bg-white/70 p-6 md:p-8 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Left copy */}
                <div className="max-w-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 mb-2">
                    Pricing
                  </p>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mb-3">
                    Start free. Upgrade when your reading load explodes.
                  </h2>
                  <p className="text-sm md:text-base text-stone-600 mb-4">
                    StudyDoc is built for students first. Stay on the free plan for up to{" "}
                    <span className="font-semibold">
                      {FREE_DAILY_UPLOAD_LIMIT} AI-powered uploads per day
                    </span>{" "}
                    and move to Pro when you’re deep in quals, comps, or thesis season.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
                        Free
                      </p>
                      <p className="text-lg font-bold text-stone-900 mb-1">
                        $0{" "}
                        <span className="text-xs font-normal text-stone-500">
                          / forever
                        </span>
                      </p>
                      <ul className="text-xs text-stone-600 space-y-1">
                        <li>• {FREE_DAILY_UPLOAD_LIMIT} AI-powered PDF uploads per day</li>
                        <li>• Saved library on this device</li>
                        <li>• Beginner & intermediate explanations</li>
                        <li>• Basic quiz mode</li>
                      </ul>
                    </div>

                    <div className="rounded-xl border border-stone-900 bg-stone-900 text-stone-100 p-4 relative overflow-hidden">
                      <span className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-stone-900">
                        Most popular
                      </span>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-200 mb-1">
                        StudyDoc Pro
                      </p>
                      <p className="text-lg font-bold text-white mb-1">
                        $8{" "}
                        <span className="text-xs font-normal text-stone-300">
                          / month
                        </span>
                      </p>
                      <ul className="text-xs text-stone-100/90 space-y-1 mb-3">
                        <li>• Higher daily AI-powered upload limits</li>
                        <li>• Full Tutor Mode on every paper</li>
                        <li>• Semantic search across your saved library</li>
                        <li>• Priority processing & early features</li>
                      </ul>
                      <button
                        onClick={handleUpgradeToPro}
                        className="mt-1 inline-flex w-full items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-stone-900 hover:bg-amber-300 transition-colors"
                      >
                        Upgrade to StudyDoc Pro
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right side mini pitch */}
                <div className="md:w-56 text-xs text-stone-500 space-y-3">
                  <p>Pro is perfect when you’re:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Reading multiple papers every week</li>
                    <li>Prepping for comps or qualifying exams</li>
                    <li>Deep in thesis / capstone research</li>
                  </ul>
                  <p className="text-stone-400">
                    Cancel anytime in a couple of clicks.
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {currentView === "library" && (
          <LibraryPage
            papers={libraryPapers}
            onBack={goHome}
            onOpenPaper={handleOpenFromLibrary}
            onDeletePaper={removePaper}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentView === "reader" && selectedPaper && (
          <PaperReader
            paper={selectedPaper}
            onBack={goHome}
            relatedPapers={relatedPapers}
            onOpenRelatedPaper={handleOpenFromLibrary}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-200 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-serif font-bold text-lg block mb-4">
              StudyDoc
            </span>
            <p className="text-stone-500 text-sm">
              Your AI-powered research companion.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-900 mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 text-stone-500 text-sm">
              <li>Library</li>
              <li>Upload</li>
              <li>Pricing</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-sm text-stone-900 mb-4 uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 text-stone-500 text-sm">
              <li>About</li>
              <li>Careers</li>
              <li>Academic Partners</li>
            </ul>
          </div>
          <div>
            <p className="text-xs text-stone-400">
              Built by students, for students. Questions or partnership ideas?
              Reach out and let’s make research less painful for everyone.
            </p>
          </div>
        </div>
      </footer>

      {/* 🔐 AUTH MODAL – only when user tries to sign in / use locked features */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <AuthPage onClose={() => setShowAuthModal(false)} />
        </div>
      )}

      {/* ⭐ UPGRADE MODAL – when free uploads are exhausted */}
      {showUpgradeModal && user && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full px-6 py-6">
            <h3 className="font-serif text-xl font-bold mb-2">
              You’ve used your free uploads for today
            </h3>
            <p className="text-sm text-stone-600 mb-4">
              Free accounts get {FREE_DAILY_UPLOAD_LIMIT} AI-powered PDF uploads
              per day. Upgrade to StudyDoc Pro for higher limits, faster
              processing, and priority features.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-sm px-3 py-2 rounded-md text-stone-600 hover:bg-stone-100"
              >
                Maybe later
              </button>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  scrollToPricing();
                }}
                className="text-sm px-4 py-2 rounded-md bg-stone-900 text-white font-medium hover:bg-stone-800"
              >
                View Pro plans
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
