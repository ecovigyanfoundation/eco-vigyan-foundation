import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { articles } from "@/data/articles";

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) notFound();

  const article = articles.find((a) => a.slug === slug);
  if (!article) notFound();

  // Assuming article.images is an array of URLs: string[]
  const images = article.images || [];

  return (
    <article className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      {/* Navigation / Breadcrumb */}
      <nav className="mb-8">
        <Link 
          href="/articles" 
          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
        >
          &larr; Back to all articles
        </Link>
      </nav>

      {/* Header Section */}
      <header className="mb-12 border-b border-gray-100 pb-12">
        <div className="flex items-center gap-3 text-sm font-semibold text-indigo-500 uppercase tracking-widest mb-4">
          <span>Article</span>
          {article.date && (
            <>
              <span className="text-gray-300">•</span>
              <time className="text-gray-500">
                {new Date(article.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </time>
            </>
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          {article.title}
        </h1>

        {article.description && (
          <p className="text-xl md:text-2xl text-gray-500 leading-relaxed font-light">
            {article.description}
          </p>
        )}
      </header>

      {/* Smart Image Gallery */}
      {images.length > 0 && (
        <div className={`grid gap-4 mb-12 ${
          images.length === 1 ? "grid-cols-1" : 
          images.length === 2 ? "grid-cols-2" : 
          "grid-cols-1 md:grid-cols-3"
        }`}>
          {images.map((src, index) => (
            <div key={index} className="relative aspect-video rounded-2xl overflow-hidden shadow-md">
              <Image
                src={src}
                alt={`Image ${index + 1} for ${article.title}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="prose prose-indigo prose-lg max-w-none">
        <div className="text-gray-800 leading-extra-relaxed whitespace-pre-line text-lg md:text-xl">
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
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition-colors"
          >
            Explore More Content
          </Link>
        </div>
      </footer>
    </article>
  );
}