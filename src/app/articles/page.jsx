"use client"; // Required for useState
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { articles } from "@/data/articles";

export default function ArticlesPage() {
  // 1. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 5; // Change this to how many articles you want per page

  // 2. Calculation Logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(articles.length / articlesPerPage);

  const hasArticles = currentArticles && currentArticles.length > 0;

  return (
    <section className="max-w-4xl mx-auto p-6 md:p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          📚 Articles List
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Showing {indexOfFirstArticle + 1}-{Math.min(indexOfLastArticle, articles.length)} of {articles.length} articles.
        </p>
      </header>

      {hasArticles ? (
        <>
          <ul className="space-y-6">
            {currentArticles.map((article) => (
              <li key={article.slug}>
                <Link
                  href={`/articles/${article.slug}`}
                  className="group block w-full border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:border-indigo-500 hover:shadow-lg"
                >
                  <article className="flex flex-col md:flex-row items-stretch">
                    {/* Image Section */}
                    <div className="relative w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-gray-100 overflow-hidden">
                      <Image
                        src={article.image || "/placeholder-image.jpg"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="p-5 flex flex-col justify-center flex-grow">
                      <time className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                        {new Date(article.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </time>
                      <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                        {article.description}
                      </p>
                      <span className="text-sm font-medium text-indigo-500 group-hover:text-indigo-700 flex items-center">
                        Read article <span className="ml-1 transition-transform group-hover:translate-x-1">&rarr;</span>
                      </span>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination Controls */}
          <nav className="flex justify-center items-center space-x-2 mt-12">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  currentPage === pageNum
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </nav>
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">No articles found.</p>
        </div>
      )}
    </section>
  );
}