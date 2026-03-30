"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Leaf, Loader2 } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";

export default function ResetPasswordLandingPage() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token;
  
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Validate token exists
    if (!token || typeof token !== 'string') {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Auto-open modal after brief delay for smooth UX
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [token]);

  const handleModalClose = () => {
    setShowModal(false);
    // Redirect to home or login after closing
    setTimeout(() => {
      router.push('/');
    }, 300);
  };

  // Error state - invalid token
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-stone-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Invalid Reset Link</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/forgot-password')}
            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all"
          >
            Request New Password Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-stone-50 flex items-center justify-center p-4">
      {/* Minimal landing page with branding */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6 animate-pulse">
          <Leaf className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Eco Vigyan Foundation</h1>
        <p className="text-slate-600 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading password reset...
        </p>
      </div>

      {/* AuthModal with token */}
      <AuthModal 
        isOpen={showModal}
        onClose={handleModalClose}
        defaultMode="reset"
        resetToken={token}
      />
    </div>
  );
}
