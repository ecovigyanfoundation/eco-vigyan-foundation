"use client";

import React from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Leaf, Chrome } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-stone-100">
        
        {/* Left Side: Branding/Visual (Hidden on mobile) */}
        <div className="hidden md:flex md:w-1/2 bg-emerald-950 p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative Leaf Pattern */}
          <div className="absolute -top-10 -left-10 opacity-10">
            <Leaf className="w-64 h-64 text-emerald-400 rotate-45" />
          </div>
          
         

          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Empowering Nature <br /> 
              <span className="text-emerald-400">Through Science.</span>
            </h1>
            <p className="mt-4 text-emerald-100/70 text-lg">
              Log in to access your dashboard, contribute to projects, and stay updated with our latest initiatives.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-emerald-400/60 text-sm">
            <span>© 2025 Eco Vigyan Foundation</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 lg:p-12">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link href="#" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-11 pr-4 py-3.5 bg-stone-50 border border-stone-200 text-slate-900 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center ml-1">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-emerald-600 bg-stone-100 border-stone-300 rounded focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600">
                Remember for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button className="w-full group relative flex items-center justify-center py-4 px-4 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 active:scale-[0.98] transition-all">
              Sign In
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-2 border-stone-100 text-slate-700 text-sm font-bold rounded-2xl hover:bg-stone-50 hover:border-stone-200 transition-all">
              <Chrome className="w-5 h-5 text-red-500" />
              Sign in with Google
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-10 text-center text-sm text-slate-500">
            New to the foundation?{" "}
            <Link href="/signup" className="text-emerald-700 font-extrabold hover:underline underline-offset-4">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}