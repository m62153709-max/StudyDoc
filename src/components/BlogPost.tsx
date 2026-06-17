// src/components/BlogPost.tsx
import { BLOG_POSTS } from "../data/blog";
import { ChevronLeft } from "lucide-react";

interface BlogPostProps {
  slug: string;
  onBack: () => void;
  onUpload: () => void;
}

const BlogPost = ({ slug, onBack, onUpload }: BlogPostProps) => {
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-stone-500">Post not found.</p>
        <button onClick={onBack} className="mt-4 text-sm text-red-700 underline">
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800 mb-8 transition-colors"
      >
        <ChevronLeft size={16} /> Back to Blog
      </button>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded">
            {post.category}
          </span>
          <span className="text-stone-400 text-xs">{post.readTime}</span>
          <span className="text-stone-400 text-xs">{post.date}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 leading-tight mb-3">
          {post.title}
        </h1>
        <p className="text-stone-600 text-lg leading-relaxed">{post.description}</p>
      </header>

      <div
        className="prose prose-stone prose-sm md:prose-base max-w-none
          prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-stone-700 prose-p:leading-relaxed
          prose-li:text-stone-700
          prose-strong:text-stone-900
          prose-table:text-sm
          prose-th:bg-stone-100 prose-th:text-stone-700 prose-th:font-semibold
          prose-td:text-stone-600
          prose-a:text-red-700 prose-a:no-underline hover:prose-a:underline
          prose-blockquote:border-stone-300 prose-blockquote:text-stone-600"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="mt-14 rounded-xl bg-stone-900 text-white px-8 py-7 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-stone-400 mb-2">
          Try it free
        </p>
        <h2 className="text-2xl font-serif font-bold mb-3">
          Upload your first paper — it's free
        </h2>
        <p className="text-stone-300 text-sm mb-5">
          StudyDoc turns any academic PDF into layered explanations, summaries, quizzes, and formatted citations in seconds.
        </p>
        <button
          onClick={onUpload}
          className="bg-white text-stone-900 font-semibold text-sm px-6 py-3 rounded-lg hover:bg-stone-100 transition-colors"
        >
          Upload a Paper — It's Free
        </button>
        <p className="mt-3 text-xs text-stone-500">No credit card required · 3 free uploads per day</p>
      </div>
    </div>
  );
};

export default BlogPost;
