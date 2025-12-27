"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  ArrowRight,
  Leaf,
  User,
  CheckCircle2,
  Camera,
  AtSign,
} from "lucide-react";

/* ---------------------------------------------------
   SIGN UP PAGE
--------------------------------------------------- */
export default function SignUpPage() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ---------------- IMAGE HANDLER ---------------- */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  /* ---------------- SUBMIT HANDLER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!imageFile) {
        throw new Error("Please upload a profile picture");
      }

      const body = new FormData();
      body.append("name", formData.name);
      body.append("username", formData.username);
      body.append("email", formData.email);
      body.append("password", formData.password);
      body.append("dp", imageFile);

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // OPTIONAL (temporary): store token
      localStorage.setItem("token", data.token);

      // Redirect to login
      window.location.href = "/login";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------
     UI
  --------------------------------------------------- */
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-100">
        
        {/* LEFT PANEL */}
        <div className="hidden md:flex md:w-[40%] bg-emerald-950 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 opacity-10">
            <Leaf className="w-80 h-80 text-emerald-400 -rotate-12" />
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Start Your <span className="text-emerald-400">Green Journey</span>
            </h1>

            <ul className="space-y-4">
              {[
                "Access exclusive research articles",
                "Track your conservation impact",
                "Join a community of experts",
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-emerald-100/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-emerald-100/60 text-xs italic">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-[60%] p-8 lg:p-12 overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
            <p className="text-slate-500 mt-2">
              Join the foundation and make a difference.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* PROFILE PIC */}
            <div>
              <label className="block text-sm font-bold mb-2">Profile Picture</label>
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full bg-stone-100 border-2 border-dashed flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img src={imagePreview} className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-stone-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* NAME + USERNAME */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                icon={User}
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Input
                icon={AtSign}
                placeholder="Username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            {/* EMAIL */}
            <Input
              icon={Mail}
              placeholder="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            {/* PASSWORD */}
            <Input
              icon={Lock}
              placeholder="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            <button
              disabled={loading}
              className="w-full flex items-center justify-center py-4 bg-emerald-700 text-white font-bold rounded-2xl hover:bg-emerald-800 transition"
            >
              {loading ? "Creating Account..." : "Create My Account"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already a member?{" "}
            <Link href="/login" className="text-emerald-700 font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   REUSABLE INPUT
--------------------------------------------------- */
function Input({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
      <input
        {...props}
        className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-stone-50 focus:ring-2 focus:ring-emerald-500 outline-none"
      />
    </div>
  );
}
