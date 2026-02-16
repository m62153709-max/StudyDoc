// src/components/AuthPage.tsx
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface AuthPageProps {
  onClose: () => void;
}

function AuthPage({ onClose }: AuthPageProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSignIn = mode === "signin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignIn) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 shadow-xl">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-3 top-3 text-stone-400 hover:text-stone-700 text-lg leading-none"
      >
        ×
      </button>

      <div className="flex items-center gap-2 mb-6">
        <div className="bg-stone-900 text-white p-1.5 rounded">
          <span className="font-serif text-sm font-bold">SD</span>
        </div>
        <h1 className="font-serif text-2xl font-bold tracking-tight">
          StudyDoc
        </h1>
      </div>

      <p className="text-sm text-stone-500 mb-6">
        {isSignIn
          ? "Sign in to access your saved papers, Tutor Mode, and semantic search."
          : "Create a free StudyDoc account to save papers and unlock AI-powered research tools."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
            placeholder="you@university.edu"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-stone-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading
            ? isSignIn
              ? "Signing in..."
              : "Creating account..."
            : isSignIn
            ? "Sign in"
            : "Sign up"}
        </button>
      </form>

      <div className="mt-4 text-xs text-stone-500 flex items-center justify-between">
        <span>
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
        </span>
        <button
          type="button"
          onClick={() => setMode(isSignIn ? "signup" : "signin")}
          className="font-medium text-stone-900 hover:underline"
        >
          {isSignIn ? "Create one" : "Sign in"}
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
