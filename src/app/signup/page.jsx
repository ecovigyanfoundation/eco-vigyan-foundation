"use client";

import React from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Leaf, Chrome, User, CheckCircle2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-100">
        
        {/* Left Side: Impact/Branding */}
        <div className="hidden md:flex md:w-[45%] bg-emerald-950 p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute -bottom-20 -right-20 opacity-10">
            <Leaf className="w-80 h-80 text-emerald-400 -rotate-12" />
          </div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <img src="/gallery/logo4.png" alt="Logo" className="w-7 h-7 object-contain" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Eco Vigyan</span>
            </Link>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Start Your <span className="text-emerald-400">Green Journey</span> With Us.
            </h1>
            
            <ul className="space-y-4">
              {[
                "Access exclusive research articles",
                "Participate in Eco-Art workshops",
                "Track your conservation impact",
                "Join a community of 5000+ experts"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-emerald-100/80">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <p className="text-emerald-100/60 text-xs italic">
              "The best time to plant a tree was 20 years ago. The second best time is now."
            </p>
          </div>
        </div>

        {/* Right Side: Sign Up Form */}
        <div className="w-full md:w-[55%] p-8 lg:p-12 overflow-y-auto">
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
            <p className="text-slate-500 mt-2">Join the foundation and make a difference today.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start ml-1 mt-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 w-4 h-4 text-emerald-600 bg-stone-100 border-stone-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="ml-2 text-xs font-medium text-slate-500 leading-relaxed">
                I agree to the <Link href="#" className="text-emerald-700 font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-emerald-700 font-bold hover:underline">Privacy Policy</Link>.
              </label>
            </div>

            {/* Submit Button */}
            <button className="w-full group mt-4 relative flex items-center justify-center py-4 px-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
              Create My Account
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium">Or join with</span>
              </div>
            </div>

            {/* Social Sign Up */}
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-stone-100 text-slate-700 text-sm font-bold rounded-2xl hover:bg-stone-50 hover:border-stone-200 transition-all">
              <Chrome className="w-5 h-5 text-red-500" />
              Sign up with Google
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Already a member?{" "}
            <Link href="/login" className="text-emerald-700 font-extrabold hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}