"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, ArrowRight, Leaf, Chrome } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  /* ---------------- SUBMIT HANDLER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Redirect after successful login
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } else {
      setError(result.error || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-100">

        {/* LEFT SIDE */}
        <div className="hidden md:flex md:w-1/2 bg-emerald-950 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-10 -left-10 opacity-10">
            <Leaf className="w-64 h-64 text-emerald-400 rotate-45" />
          </div>

          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Empowering Nature <br />
              <span className="text-emerald-400">Through Science.</span>
            </h1>
            <p className="mt-4 text-emerald-100/70 text-lg">
              Log in to access your dashboard and contribute to projects.
            </p>
          </div>

          <div className="relative z-10 text-emerald-400/60 text-sm">
            © 2025 Eco Vigyan Foundation
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 mt-2">
              Please enter your details to sign in.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* EMAIL OR USERNAME */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                Email or Username
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="name@example.com or username"
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-sm font-bold text-slate-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}

            {/* BUTTON */}
            <button
              disabled={loading}
              className="w-full group flex items-center justify-center py-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-bold rounded-2xl transition-all"
            >
              {loading ? "Signing In..." : "Sign In"}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* DIVIDER */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium">
                  Or continue with
                </span>
              </div>
            </div>

            {/* GOOGLE (PLACEHOLDER) */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 bg-white border-2 border-stone-100 rounded-2xl font-bold hover:bg-stone-50"
            >
              <Chrome className="w-5 h-5 text-red-500" />
              Sign in with Google
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-500">
            New to the foundation?{" "}
            <Link href="/signup" className="text-emerald-700 font-extrabold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
