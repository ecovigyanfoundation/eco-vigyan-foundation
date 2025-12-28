"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, X, Upload, ArrowLeft } from "lucide-react";

export default function NewArticlePage() {
  const router = useRouter();
  const { isWriterOrAdmin, loading: authLoading } = useAuth();

  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image1: null,
    image1Preview: null,
    image2: null,
    image2Preview: null,
  });

  // Redirect if not authorized
  React.useEffect(() => {
    if (!authLoading && !isWriterOrAdmin()) {
      toast.error("Only writers and admins can upload articles");
      router.push("/articles");
    }
  }, [authLoading, isWriterOrAdmin, router]);

  // Handle image selection
  const handleImageSelect = (e, imageNumber) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a JPEG, PNG, or WebP image");
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (imageNumber === 1) {
        setFormData({
          ...formData,
          image1: file,
          image1Preview: reader.result,
        });
      } else {
        setFormData({
          ...formData,
          image2: file,
          image2Preview: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = (imageNumber) => {
    if (imageNumber === 1) {
      setFormData({
        ...formData,
        image1: null,
        image1Preview: null,
      });
    } else {
      setFormData({
        ...formData,
        image2: null,
        image2Preview: null,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    if (formData.title.trim().length < 5 || formData.title.trim().length > 200) {
      toast.error("Title must be between 5 and 200 characters");
      return;
    }

    if (formData.content.trim().length < 50 || formData.content.trim().length > 10000) {
      toast.error("Content must be between 50 and 10000 characters");
      return;
    }

    setUploading(true);
    try {
      const submitFormData = new FormData();
      submitFormData.append("title", formData.title.trim());
      submitFormData.append("content", formData.content.trim());

      if (formData.image1) {
        submitFormData.append("image1", formData.image1);
      }
      if (formData.image2) {
        submitFormData.append("image2", formData.image2);
      }

      const res = await fetch("/api/articles/upload", {
        method: "POST",
        body: submitFormData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      toast.success("Article uploaded successfully!");

      // Redirect to articles page after a short delay
      setTimeout(() => {
        router.push("/articles");
      }, 1000);
    } catch (error) {
      toast.error(error.message || "Failed to upload article");
    } finally {
      setUploading(false);
    }
  };

  // Show loading or unauthorized message
  if (authLoading) {
    return (
      <main className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-slate-400 font-bold">Loading...</p>
      </main>
    );
  }

  if (!isWriterOrAdmin()) {
    return null; // Will redirect
  }

  return (
    <main className="min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header */}
      <section className="bg-emerald-900 py-20 px-4 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-10">
          <BookOpen className="w-96 h-96 absolute -bottom-20 -right-20 text-white" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Articles</span>
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
            Write New Article
          </h1>
          <div className="h-1.5 bg-emerald-400 mx-auto mb-8 rounded-full w-24" />
          <p className="text-xl md:text-2xl text-emerald-100 font-medium">
            Share your thoughts and insights
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto p-6 md:p-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title"
              required
              minLength={5}
              maxLength={200}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.title.length}/200 characters (minimum 5)
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write your article content here..."
              required
              minLength={50}
              maxLength={10000}
              rows={15}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
            />
            <p className="text-xs text-slate-500 mt-1">
              {formData.content.length}/10000 characters (minimum 50)
            </p>
          </div>

          {/* Image 1 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Image 1 (Optional)
            </label>
            {formData.image1Preview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-stone-200">
                <img
                  src={formData.image1Preview}
                  alt="Preview 1"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(1)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-50 transition">
                <Upload className="w-12 h-12 text-stone-400 mb-2" />
                <span className="text-sm font-medium text-stone-600">
                  Click to upload image 1
                </span>
                <span className="text-xs text-stone-500 mt-1">
                  JPEG, PNG, or WebP (max 10MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleImageSelect(e, 1)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Image 2 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Image 2 (Optional)
            </label>
            {formData.image2Preview ? (
              <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-stone-200">
                <img
                  src={formData.image2Preview}
                  alt="Preview 2"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(2)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-50 transition">
                <Upload className="w-12 h-12 text-stone-400 mb-2" />
                <span className="text-sm font-medium text-stone-600">
                  Click to upload image 2
                </span>
                <span className="text-xs text-stone-500 mt-1">
                  JPEG, PNG, or WebP (max 10MB)
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(e) => handleImageSelect(e, 2)}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Link
              href="/articles"
              className="flex-1 px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Publish Article"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}





