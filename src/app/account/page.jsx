"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  User as UserIcon,
  Save,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AccountPage() {
  const router = useRouter();
  const { user, updateUser, fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    dp: null,
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    // Initialize form with current user data
    setFormData({
      bio: user.bio || "",
      dp: null,
    });
    setPreview(user.dp?.url || null);
  }, [user, router]);

  const handleBioChange = (e) => {
    setFormData({ ...formData, bio: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      toast.error("Image must be under 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid image format. Please use JPEG, PNG, or WebP.");
      return;
    }

    setFormData({ ...formData, dp: file });

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, dp: null });
    setPreview(user.dp?.url || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("bio", formData.bio);
      if (formData.dp) {
        formDataToSend.append("dp", formData.dp);
      }

      const res = await fetch("/api/account/update", {
        method: "PATCH",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Update user in context
      updateUser(data.user);
      // Refresh user data
      await fetchUser();

      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* TOP NAVIGATION */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/my-submissions"
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold tracking-tight uppercase">Back</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Account Settings</h1>
          <p className="text-slate-500 font-medium">Manage your profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* DISPLAY PICTURE SECTION */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200/60">
            <h2 className="text-xl font-black text-slate-900 mb-6">Profile Picture</h2>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Current/Preview Image */}
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-stone-100 shadow-lg">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                      <UserIcon className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>
                {user.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                    <CheckCircle className="w-5 h-5 fill-current" />
                  </div>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-4">
                <div>
                  <label
                    htmlFor="dp-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    {formData.dp ? "Change Image" : "Upload Image"}
                  </label>
                  <input
                    id="dp-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {formData.dp && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Remove New Image
                  </button>
                )}

                <p className="text-xs text-slate-400">
                  Recommended: Square image, at least 400x400px. Max 5MB. JPEG, PNG, or WebP.
                </p>
              </div>
            </div>
          </div>

          {/* BIO SECTION */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200/60">
            <h2 className="text-xl font-black text-slate-900 mb-6">Bio</h2>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-bold text-slate-700 mb-2">
                About You
              </label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={handleBioChange}
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-slate-400 mt-2 text-right">
                {formData.bio.length}/500 characters
              </p>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex justify-end gap-4">
            <Link
              href="/my-submissions"
              className="px-6 py-3 text-slate-600 font-bold rounded-xl hover:bg-stone-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}


