"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit3,
  Trash2,
  User,
  X,
} from "lucide-react";

const ARTICLES_PER_PAGE = 5;

export default function ArticlesPage() {
  const { isWriterOrAdmin } = useAuth();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    title: "",
    content: "",
    image1: null,
    image1Preview: null,
    image2: null,
    image2Preview: null,
    originalImage1Url: null,
    originalImage2Url: null,
    existingImage1Url: null,
    existingImage2Url: null,
  });

  /* ---------------- FETCH ARTICLES ---------------- */
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await fetch("/api/articles");
        const data = await res.json();
        if (!res.ok) throw new Error();
        setArticles(data.articles || []);
      } catch {
        toast.error("Failed to load articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(articles.length / ARTICLES_PER_PAGE);
  const indexOfLast = currentPage * ARTICLES_PER_PAGE;
  const indexOfFirst = indexOfLast - ARTICLES_PER_PAGE;
  const currentArticles = articles.slice(indexOfFirst, indexOfLast);

  const paginate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- EDIT HANDLERS ---------------- */
  const handleEdit = (article) => {
    setEditForm({
      id: article._id,
      title: article.title,
      content: article.content,
      image1: null,
      image1Preview: null,
      image2: null,
      image2Preview: null,
      originalImage1Url: article.images?.[0]?.url || null,
      originalImage2Url: article.images?.[1]?.url || null,
      existingImage1Url: article.images?.[0]?.url || null,
      existingImage2Url: article.images?.[1]?.url || null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditing(true);
    try {
      const formData = new FormData();
      formData.append("title", editForm.title.trim());
      formData.append("content", editForm.content.trim());
      
      // Handle image1
      if (editForm.image1) {
        // User uploaded a new image1
        formData.append("image1", editForm.image1);
      } else if (editForm.originalImage1Url && !editForm.existingImage1Url) {
        // User removed image1 (it existed originally but was cleared)
        formData.append("removeImage1", "true");
      }
      // If originalImage1Url exists and existingImage1Url still exists, we keep it (don't send anything)
      
      // Handle image2
      if (editForm.image2) {
        // User uploaded a new image2
        formData.append("image2", editForm.image2);
      } else if (editForm.originalImage2Url && !editForm.existingImage2Url) {
        // User removed image2 (it existed originally but was cleared)
        formData.append("removeImage2", "true");
      }
      // If originalImage2Url exists and existingImage2Url still exists, we keep it (don't send anything)

      const res = await fetch(`/api/articles/${editForm.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Update failed");
      }

      toast.success("Article updated successfully!");

      // Refresh articles
      const articlesRes = await fetch("/api/articles");
      const articlesData = await articlesRes.json();
      if (articlesRes.ok) {
        setArticles(articlesData.articles || []);
      }

      setShowEditModal(false);
      setEditForm({
        id: null,
        title: "",
        content: "",
        image1: null,
        image1Preview: null,
        image2: null,
        image2Preview: null,
        originalImage1Url: null,
        originalImage2Url: null,
        existingImage1Url: null,
        existingImage2Url: null,
      });
    } catch (error) {
      toast.error(error.message || "Failed to update article");
    } finally {
      setEditing(false);
    }
  };

  /* ---------------- DELETE HANDLERS ---------------- */
  const confirmDelete = (id) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await fetch(`/api/articles/${deletingId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      toast.success("Article deleted successfully!");

      // Remove from list
      setArticles(articles.filter((article) => article._id !== deletingId));

      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (error) {
      toast.error(error.message || "Failed to delete article");
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <main className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* ================= HERO ================= */}
      <section className="bg-emerald-900 py-20 px-4 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <BookOpen className="w-96 h-96 absolute -bottom-20 -right-20 text-white" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Library of Thought
          </h1>
          <div className="h-1.5 bg-emerald-400 mx-auto mb-8 rounded-full w-24" />
          <p className="text-xl md:text-2xl text-emerald-100 font-medium">
            Perspectives on science, nature & sustainability.
          </p>

          {isWriterOrAdmin() && (
            <div className="mt-10">
              <Link
                href="/articles/new"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-full font-bold shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Write New Article
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ================= CONTENT ================= */}
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

          <p className="text-sm font-bold text-slate-500 uppercase bg-white px-4 py-2 rounded-full border">
            Showing {indexOfFirst + 1}—
            {Math.min(indexOfLast, articles.length)} of {articles.length}
          </p>
        </header>

        {/* ================= LIST ================= */}
        {loading ? (
          <p className="text-center text-slate-400 font-bold py-20">
            Loading articles...
          </p>
        ) : currentArticles.length ? (
          <>
            <ul className="space-y-8">
              {currentArticles.map((article) => (
                <li key={article._id}>
                  <Link
                    href={`/articles/${article._id}`}
                    className="group block bg-white border border-stone-200 rounded-[2rem] overflow-hidden transition-all hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-1"
                  >
                    <article className="flex flex-col md:flex-row">
                      {/* IMAGE */}
                      <div className="relative w-full md:w-64 h-56 bg-stone-100 overflow-hidden">
                        {article.images?.[0]?.url ? (
                          <Image
                            src={article.images[0].url}
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="p-8 flex flex-col flex-1">
                        <time className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">
                          {new Date(article.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "long", day: "numeric", year: "numeric" }
                          )}
                        </time>

                        <h2 className="text-2xl font-black text-slate-800 mb-3 group-hover:text-emerald-700 uppercase tracking-tight">
                          {article.title}
                        </h2>

                        <p className="text-slate-600 leading-relaxed line-clamp-2 mb-6">
                          {article.content}
                        </p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <User className="w-4 h-4" />
                            {article.uploadedBy?.name || "Author"}
                          </div>

                          <span className="inline-flex items-center text-sm font-black uppercase tracking-widest text-emerald-600">
                            Read
                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>

                  {/* ADMIN ACTIONS */}
                  {isWriterOrAdmin() && (
                    <div className="flex gap-3 mt-3 justify-end">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleEdit(article);
                        }}
                        className="p-2 rounded-full bg-white border hover:text-emerald-600 transition-colors"
                        title="Edit article"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          confirmDelete(article._id);
                        }}
                        className="p-2 rounded-full bg-white border hover:text-red-600 transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {/* ================= PAGINATION ================= */}
            {totalPages > 1 && (
              <nav className="flex justify-center items-center gap-3 mt-16">
                <button
                  onClick={() => paginate(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-3 rounded-full bg-white border disabled:opacity-30 hover:bg-emerald-50"
                >
                  <ChevronLeft />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (num) => (
                    <button
                      key={num}
                      onClick={() => paginate(num)}
                      className={`w-12 h-12 rounded-full font-black ${
                        currentPage === num
                          ? "bg-emerald-600 text-white"
                          : "bg-white hover:bg-emerald-50"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}

                <button
                  onClick={() =>
                    paginate(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-full bg-white border disabled:opacity-30 hover:bg-emerald-50"
                >
                  <ChevronRight />
                </button>
              </nav>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2rem] border">
            <p className="text-xl font-bold text-slate-400 uppercase">
              No articles found
            </p>
          </div>
        )}
      </section>

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Edit Article</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                  required
                  minLength={5}
                  maxLength={200}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  required
                  minLength={50}
                  rows={10}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                />
              </div>

              {/* Image 1 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Image 1 (optional)
                </label>
                {editForm.existingImage1Url && !editForm.image1Preview && (
                  <div className="mb-3 relative">
                    <img
                      src={editForm.existingImage1Url}
                      alt="Current image 1"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          existingImage1Url: null,
                          image1: null,
                          image1Preview: null,
                        })
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {editForm.image1Preview && (
                  <div className="mb-3 relative">
                    <img
                      src={editForm.image1Preview}
                      alt="Preview image 1"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          image1: null,
                          image1Preview: null,
                        })
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {!editForm.existingImage1Url && !editForm.image1Preview && (
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditForm({
                          ...editForm,
                          image1: file,
                          image1Preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Image 2 */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Image 2 (optional)
                </label>
                {editForm.existingImage2Url && !editForm.image2Preview && (
                  <div className="mb-3 relative">
                    <img
                      src={editForm.existingImage2Url}
                      alt="Current image 2"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          existingImage2Url: null,
                          image2: null,
                          image2Preview: null,
                        })
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {editForm.image2Preview && (
                  <div className="mb-3 relative">
                    <img
                      src={editForm.image2Preview}
                      alt="Preview image 2"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          image2: null,
                          image2Preview: null,
                        })
                      }
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {!editForm.existingImage2Url && !editForm.image2Preview && (
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setEditForm({
                          ...editForm,
                          image2: file,
                          image2Preview: URL.createObjectURL(file),
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editing ? "Updating..." : "Update Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION ================= */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Delete Article?
            </h2>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete this article? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingId(null);
                }}
                className="flex-1 px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
