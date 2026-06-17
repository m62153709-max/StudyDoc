// src/components/BlogList.tsx
import { BLOG_POSTS } from "../data/blog";

interface BlogListProps {
  onSelectPost: (slug: string) => void;
}

const BlogList = ({ onSelectPost }: BlogListProps) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <div className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 mb-2">
          Study Resources
        </p>
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-3">
          The StudyDoc Blog
        </h1>
        <p className="text-stone-600 max-w-xl">
          Guides on reading research papers, writing citations, conducting literature reviews, and using AI tools to study smarter.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            onClick={() => onSelectPost(post.slug)}
            className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded">
                  {post.category}
                </span>
                <span className="text-stone-400 text-xs">{post.readTime}</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-stone-900 mb-2 leading-snug group-hover:text-red-800 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-stone-500 leading-relaxed line-clamp-3">
                {post.description}
              </p>
            </div>
            <div className="px-6 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-400">{post.date}</span>
              <span className="text-xs font-medium text-red-700 group-hover:translate-x-1 transition-transform inline-block">
                Read →
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
