import { notFound } from "next/navigation";
import { articles } from "@/data/articles";

export async function generateStaticParams() {
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }) {
  // Handle params - in Next.js 16, params might be a Promise
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const article = articles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">
        {article.title}
      </h1>

      {article.description && (
        <p className="text-xl text-gray-600 mb-6">
          {article.description}
        </p>
      )}

      <div className="prose prose-lg max-w-none">
        <div className="text-gray-700 leading-relaxed whitespace-pre-line">
          {article.content.trim()}
        </div>
      </div>
    </article>
  );
}


