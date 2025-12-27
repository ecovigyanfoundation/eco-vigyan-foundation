"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ArticleImage from "@/components/ArticleImage";

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Article ID not found");
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 404) {
            setError("Article not found");
          } else {
            setError(data.error || "Failed to load article");
          }
          setLoading(false);
          return;
        }

        setArticle(data.article);
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-gray-500">Loading article...</p>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="min-h-screen bg-white py-12 md:py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Article not found"}
          </h1>
          <Link
            href="/articles"
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-2 transition-colors"
          >
            <span>&larr;</span> Back to all articles
          </Link>
        </div>
      </main>
    );
  }

  const images = article.images || [];

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 md:py-20 overflow-x-hidden">
      {/* Navigation */}
      <nav className="mb-8">
        <Link 
          href="/articles" 
          className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-2 transition-colors"
        >
          <span>&larr;</span> Back to all articles
        </Link>
      </nav>

      {/* Header Section */}
      <header className="mb-12 border-b border-gray-100 pb-12">
        <div className="flex items-center gap-3 text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-4">
          <span>Article</span>
          {article.createdAt && (
            <>
              <span className="text-gray-300">•</span>
              <time className="text-gray-500">
                {new Date(article.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </>
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6 break-words">
          {article.title}
        </h1>

        {article.description && (
          <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light">
            {article.description}
          </p>
        )}
      </header>

      {/* Enhanced Image Gallery */}
      {images.length > 0 && (
        <div className={`grid gap-6 mb-12 ${
          images.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
        }`}>
          {images.map((img, index) => (
            <ArticleImage 
              key={index} 
              src={img.url || img} 
              alt={`Image ${index + 1} for ${article.title}`} 
            />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-indigo prose-lg max-w-none overflow-hidden">
        <div className="text-gray-800 leading-[1.8] whitespace-pre-wrap text-lg md:text-xl break-words overflow-wrap-anywhere">
          {article.content.trim()}
        </div>
      </div>

      {/* Footer / CTA */}
      <footer className="mt-16 pt-8 border-t border-gray-100">
        <div className="bg-indigo-50 rounded-2xl p-8 text-center">
          <h3 className="text-indigo-900 font-bold text-xl mb-2">Thanks for reading!</h3>
          <p className="text-indigo-700 mb-6">Stay tuned for more articles like this.</p>
          <Link 
            href="/articles" 
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
          >
            Explore More Content
          </Link>
        </div>
      </footer>
    </article>
  );
}
