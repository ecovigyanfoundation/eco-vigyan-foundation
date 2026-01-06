"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Leaf, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
      toast.success("Password reset email sent! Please check your inbox.");
    } catch (error) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
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
              Reset Your <br />
              <span className="text-emerald-400">Password</span>
            </h1>
            <p className="mt-4 text-emerald-100/70 text-lg">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <div className="relative z-10 text-emerald-400/60 text-sm">
            © 2025 Eco Vigyan Foundation
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Forgot Password?</h2>
            <p className="text-slate-500 mt-2">
              {success 
                ? "Check your email for password reset instructions."
                : "No worries! Enter your email and we'll send you reset instructions."
              }
            </p>
          </div>

          {!success ? (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center py-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Reset Link"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <Mail className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-emerald-800 font-semibold mb-2">
                  Check your email
                </p>
                <p className="text-emerald-700 text-sm">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
                <p className="text-emerald-600 text-xs mt-4">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full py-3 bg-stone-100 text-stone-700 font-bold rounded-2xl hover:bg-stone-200 transition-colors"
              >
                Try Another Email
              </button>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-slate-500 hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link href="/login" className="text-emerald-700 font-extrabold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}












