import Link from "next/link";
import { articles } from "@/data/articles";

/**
 * Renders a page displaying a list of all available articles.
 * This version uses a classic, single-column list format.
 */
export default function ArticlesPage() {
  const hasArticles = articles && articles.length > 0;

  return (
    <section className="max-w-4xl mx-auto p-6 md:p-8">
      {/* Page Title */}
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          📚 Articles List
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Viewing all articles in a single-column format.
        </p>
      </header>

      {/* Articles List - Now a Single Column */}
      {hasArticles ? (
        <ul className="space-y-6"> {/* Use space-y- to add vertical gap between items */}
          {articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/articles/${article.slug}`}
                // Styled as a card, now taking full width
                className="group block w-full border border-gray-200 rounded-xl p-5 transition-all duration-300 ease-in-out hover:border-indigo-500 hover:shadow-lg"
              >
                <article>
                  <h2 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {article.description}
                  </p>
                  <span className="text-sm font-medium text-indigo-500 group-hover:text-indigo-700 transition-colors">
                    Read article &rarr;
                  </span>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-20">
          <p className="text-xl text-gray-500">
            No articles found at the moment.
          </p>
        </div>
      )}
    </section>
  );
}