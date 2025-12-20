"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { articles } from "@/data/articles";
import { BookOpen, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function ArticlesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5;

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(
    indexOfFirstArticle,
    indexOfLastArticle
  );
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const hasArticles = currentArticles && currentArticles.length > 0;

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* --- Emerald Header Section --- */}
      <section className="bg-emerald-900 py-20 px-4 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <BookOpen className="w-96 h-96 absolute -bottom-20 -right-20 text-white" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Library of Thought
          </h1>
          <div className="h-1.5 bg-emerald-400 mx-auto mb-8 rounded-full w-24" />
          <p className="text-xl md:text-2xl text-emerald-100 font-medium leading-relaxed">
            Exploring the intersection of science, nature, and sustainability
            through deep-dive articles.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto p-6 md:p-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">
              Resources
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Latest Articles
            </h2>
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter bg-white px-4 py-2 rounded-full shadow-sm border border-stone-100">
            Showing {indexOfFirstArticle + 1}—
            {Math.min(indexOfLastArticle, articles.length)} of {articles.length}
          </p>
        </header>

        {hasArticles ? (
          <>
            <ul className="space-y-8">
              {currentArticles.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/articles/${article.slug}`}
                    className="group block w-full bg-white border border-stone-200 rounded-[2rem] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1"
                  >
                    <article className="flex flex-col md:flex-row items-stretch">
                      {/* Image Section */}
                      <div className="relative w-full md:w-64 h-56 md:h-auto flex-shrink-0 bg-stone-100 overflow-hidden">
                        <Image
                          src={article.images?.[0] || "/placeholder-image.jpg"}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      {/* Content Section */}
                      <div className="p-8 flex flex-col justify-center flex-grow">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="h-1 w-6 bg-emerald-500 rounded-full" />
                          <time className="block text-xs font-bold uppercase tracking-widest text-emerald-600">
                            {new Date(article.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </time>
                        </div>

                        <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">
                          {article.title}
                        </h2>
                        <p className="text-slate-600 text-base leading-relaxed mb-6 line-clamp-2 font-medium">
                          {article.description}
                        </p>

                        <span className="inline-flex items-center text-sm font-black uppercase tracking-widest text-emerald-600 group-hover:text-emerald-800">
                          Read Full Article
                          <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-2" />
                        </span>
                      </div>
                    </article>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-3 mt-16">
                <button
                  onClick={() => paginate(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-full bg-white border border-stone-200 text-slate-600 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-12 h-12 rounded-full text-sm font-black transition-all shadow-sm ${
                          currentPage === pageNum
                            ? "bg-emerald-600 text-white border-emerald-600 scale-110"
                            : "bg-white text-slate-600 border-stone-200 hover:bg-emerald-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() =>
                    paginate(Math.min(currentPage + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-full bg-white border border-stone-200 text-slate-600 disabled:opacity-30 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200">
            <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">
              No articles found.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
