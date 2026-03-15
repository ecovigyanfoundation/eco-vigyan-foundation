"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import {
  User as UserIcon,
  Mail,
  Save,
  Upload,
  Camera,
  Lock,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, updateUser, fetchUser } = useAuth();

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    bio: "",
  });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [cloudinaryAvailable, setCloudinaryAvailable] = useState(true);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    // Wait for session to load before redirecting
    if (loading) return;
    
    if (!user) {
      router.push("/login");
      return;
    }
    // Initialize form with current user data
    setProfileForm({
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
    });
    setAvatarPreview(user.dp?.url || "");
  }, [user, loading, router]);

  // Check if user signed in with Google
  const isGoogleAuth = user?.authProvider === "google";

  /* ================= PROFILE PICTURE HANDLERS ================= */

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image size should be less than 5MB");
      return;
    }

    setAvatarError("");
    setAvatarFile(file);
    setAvatarUrl(""); // Clear URL if file is selected

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCloudinaryError = (error) => {
    if (error.includes("api_key") || error.includes("not configured")) {
      setCloudinaryAvailable(false);
      setAvatarError("File upload is not configured. Please use the URL option instead.");
      toast.error("File upload unavailable. Use avatar URL option.");
    }
  };

  const handleAvatarUrlChange = (e) => {
    setAvatarUrl(e.target.value);
    setAvatarFile(null); // Clear file if URL is entered
  };

  const handleSetAvatarFromUrl = () => {
    if (!avatarUrl.trim()) {
      setAvatarError("Please enter an image URL");
      return;
    }

    setAvatarError("");
    setIsUploadingAvatar(true);

    // Test if URL is valid by loading it
    const img = new window.Image();
    img.onload = () => {
      setAvatarPreview(avatarUrl);
      setIsUploadingAvatar(false);
      toast.success("Avatar preview updated! Click 'Save Profile' to confirm.");
    };
    img.onerror = () => {
      setAvatarError("Invalid image URL or image failed to load");
      setIsUploadingAvatar(false);
    };
    img.src = avatarUrl;
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl("");
    setAvatarPreview(user?.dp?.url || "");
    setAvatarError("");
  };

  /* ================= PROFILE UPDATE HANDLER ================= */

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setIsLoadingProfile(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", profileForm.name);
      formDataToSend.append("email", profileForm.email);
      formDataToSend.append("bio", profileForm.bio);

      // Include avatar file if changed
      if (avatarFile) {
        formDataToSend.append("dp", avatarFile);
      }
      // Include avatar URL if changed (and no file)
      else if (avatarUrl && avatarUrl !== user?.dp?.url) {
        formDataToSend.append("avatarUrl", avatarUrl);
      }

      const res = await fetch("/api/account/update", {
        method: "PATCH",
        body: formDataToSend,
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle Cloudinary configuration errors
        if (data.error?.includes("not configured") || data.error?.includes("api_key")) {
          handleCloudinaryError(data.error);
        }
        throw new Error(data.error || "Failed to update profile");
      }

      // Update user in context
      updateUser(data.user);
      // Refresh user data
      await fetchUser();

      setProfileSuccess("Profile updated successfully!");
      toast.success("Profile updated successfully!");
      
      // Clear form state
      setAvatarFile(null);
      setAvatarUrl("");

      setTimeout(() => setProfileSuccess(""), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError(err.message || "Failed to update profile");
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  /* ================= PASSWORD CHANGE HANDLER ================= */

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsLoadingPassword(true);

    try {
      const res = await fetch("/api/account/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully!");
      toast.success("Password changed successfully!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError(err.message || "Failed to change password");
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  // Show loading state while session is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-900 mb-3 font-serif">
              Profile Settings
            </h1>
            <p className="text-lg text-gray-600">
              Manage your account information and security settings
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* ================= PROFILE PICTURE SECTION ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-purple-900 font-serif">
                      Profile Picture
                    </h2>
                    <p className="text-sm text-purple-700">
                      Upload or set your avatar image
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {avatarError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{avatarError}</p>
                  </motion.div>
                )}

                {/* Current Avatar Preview */}
                <div className="flex items-center gap-6">
                  <div className="shrink-0">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-32 h-32 rounded-2xl object-cover border-4 border-emerald-100 shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center border-4 border-emerald-100 shadow-lg">
                        <span className="text-5xl font-bold text-white">
                          {user?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {user?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                        {user?.role.toUpperCase()}
                      </div>
                      {isUploadingAvatar && (
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span>Updating...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Upload Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* File Upload */}
                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-gray-700">
                      Upload from Computer
                    </label>
                    <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl transition-all ${
                      cloudinaryAvailable 
                        ? 'border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer'
                        : 'border-gray-300 bg-gray-50 cursor-not-allowed opacity-60'
                    }`}>
                      <Upload className={`w-8 h-8 ${cloudinaryAvailable ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <div className="text-center">
                        <p className={`text-sm font-semibold ${cloudinaryAvailable ? 'text-gray-700' : 'text-gray-400'}`}>
                          {cloudinaryAvailable ? 'Click to upload' : 'Upload unavailable'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {cloudinaryAvailable ? 'PNG, JPG, WebP up to 5MB' : 'Use URL option instead'}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarFileChange}
                        className="hidden"
                        disabled={isUploadingAvatar || !cloudinaryAvailable}
                      />
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-3">
                    <label
                      htmlFor="avatarUrl"
                      className="block text-sm font-bold text-gray-700"
                    >
                      Or Paste Image URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        id="avatarUrl"
                        value={avatarUrl}
                        onChange={handleAvatarUrlChange}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="https://example.com/image.jpg"
                        disabled={isUploadingAvatar}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSetAvatarFromUrl}
                      disabled={isUploadingAvatar || !avatarUrl}
                      className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Preview from URL</span>
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                {(avatarFile || (avatarUrl && avatarUrl !== user?.dp?.url)) && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="text-sm text-gray-600 hover:text-red-600 transition-colors font-semibold"
                  >
                    Cancel Changes
                  </button>
                )}

                <p className="text-xs text-gray-500">
                  💡 Tip: Upload a file or paste an image URL, then click "Save
                  Profile" below to apply changes.
                </p>
              </div>
            </motion.div>

            {/* ================= PROFILE INFORMATION SECTION ================= */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-900 font-serif">
                      Profile Information
                    </h2>
                    <p className="text-sm text-emerald-700">
                      Update your personal details
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="p-8 space-y-6">
                {profileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{profileError}</p>
                  </motion.div>
                )}

                {profileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{profileSuccess}</p>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        value={profileForm.name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, name: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, email: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="your@email.com"
                        required
                        disabled={isGoogleAuth}
                      />
                    </div>
                    {isGoogleAuth && (
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed (Google account)
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-bold text-gray-700 mb-2"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, bio: e.target.value })
                    }
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself and your interest in environmental conservation..."
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right">
                    {profileForm.bio.length}/500 characters
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingProfile}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoadingProfile ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            {/* ================= PASSWORD CHANGE SECTION ================= */}
            {!isGoogleAuth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border-2 border-emerald-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-orange-900 font-serif">
                        Change Password
                      </h2>
                      <p className="text-sm text-orange-700">
                        Update your account password
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{passwordError}</p>
                    </motion.div>
                  )}

                  {passwordSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">{passwordSuccess}</p>
                    </motion.div>
                  )}

                  {/* Old Password */}
                  <div>
                    <label
                      htmlFor="oldPassword"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Current Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        id="oldPassword"
                        value={passwordForm.oldPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            oldPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Enter current password"
                        required
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      At least 6 characters
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-bold text-gray-700 mb-2"
                    >
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoadingPassword}
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 rounded-xl font-bold hover:from-orange-700 hover:to-red-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoadingPassword ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Changing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Change Password</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Google Auth Notice */}
            {isGoogleAuth && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">
                      Google Account
                    </h3>
                    <p className="text-sm text-blue-700">
                      You signed in with Google. To change your email or password,
                      please use Google's account settings.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
