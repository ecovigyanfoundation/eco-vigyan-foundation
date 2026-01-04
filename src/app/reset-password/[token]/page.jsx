"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Lock, ArrowRight, Leaf, ArrowLeft, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      toast.success("Password reset successfully! Redirecting to login...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl p-8 border border-stone-100 text-center">
          <p className="text-red-600 mb-4">Invalid reset link</p>
          <Link
            href="/forgot-password"
            className="text-emerald-700 font-bold hover:underline"
          >
            Request a new password reset
          </Link>
        </div>
      </div>
    );
  }

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
              Create New <br />
              <span className="text-emerald-400">Password</span>
            </h1>
            <p className="mt-4 text-emerald-100/70 text-lg">
              Enter your new password below to complete the reset process.
            </p>
          </div>

          <div className="relative z-10 text-emerald-400/60 text-sm">
            © 2025 Eco Vigyan Foundation
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Reset Password</h2>
            <p className="text-slate-500 mt-2">
              {success 
                ? "Your password has been reset successfully!"
                : "Please enter your new password below."
              }
            </p>
          </div>

          {success ? (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <p className="text-emerald-800 font-semibold mb-2">
                  Password Reset Successful!
                </p>
                <p className="text-emerald-700 text-sm">
                  You can now log in with your new password.
                </p>
              </div>
              <Link
                href="/login"
                className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-bold rounded-2xl transition-all"
              >
                Go to Login
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* NEW PASSWORD */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  New Password
                </label>
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
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">
                  Must be at least 6 characters
                </p>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Confirm new password"
                    minLength={6}
                  />
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-red-600 text-sm text-center">{error}</p>
              )}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full group flex items-center justify-center py-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting Password..." : "Reset Password"}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
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
        </div>
      </div>
    </div>
  );
}









