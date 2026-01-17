"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Globe,
  PlayCircle,
  History,
  ExternalLink,
  Award,
  Users
} from "lucide-react";

const WiproEarthianProgram = ({ onBack }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-emerald-100"
    >
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Programs
        </button>
        <h2 className="text-3xl font-black text-sky-600 uppercase tracking-tighter">
          Wipro Earthian <span className="text-emerald-600">Program</span>
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <div className="mb-12">
          <p className="text-slate-700 text-lg leading-relaxed max-w-5xl">
            Eco Vigyan gladly invites you to attend the <span className="font-bold text-emerald-700">National Level School Competition for Sustainability</span> managed by Wipro earthian in collaboration with Wipro earthian’s Sustainability Program and the Department of Education (DOE) Himachal Pradesh.
          </p>
          <p className="mt-4 text-slate-600 text-lg">
            This competition is open to all Schools, Administrations, Teachers, and Educational Institutions across India to build knowledge, skills, and a mindset for self-reliance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Video & Video CTA */}
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-video bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
              {/* iframe for YouTube Video */}
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/Ri-3fJ3JoHY"
                title="12 Years of Wipro earthian | India Impact Stories"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-sky-600 font-bold">
              <PlayCircle className="w-6 h-6 animate-pulse" />
              <p>To get a quick program overview, watch this video!</p>
            </div>
          </div>

          {/* Right: Interaction Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Journey Card */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-emerald-50 p-6 rounded-[2rem] border-2 border-emerald-100 relative group cursor-pointer"
            >
              <div className="flex gap-4">
                <History className="w-10 h-10 text-emerald-600 shrink-0" />
                <p className="text-emerald-900 font-bold leading-tight">
                  To look back at our journey with the program in Himachal last year, click here!
                </p>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-5 h-5 text-emerald-600" />
              </div>
            </motion.div>

            {/* Program Impact Stats/Highlights (Derived from Video Content) */}
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4">
              <h4 className="font-black text-slate-800 uppercase text-sm tracking-widest">Program Focus</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-700 font-medium">Biodiversity & Nature Care</span>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-700 font-medium">Water & Waste Management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-sky-500" />
                  <span className="text-slate-700 font-medium">Community Awareness</span>
                </div>
              </div>
            </div>

            {/* Register CTA */}
            <button 
              onClick={() => router.push('/register?program=wipro-earthian')}
              className="mt-auto bg-[#4ade80] hover:bg-[#22c55e] text-white py-6 rounded-full font-black uppercase tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              Register Here <ExternalLink className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WiproEarthianProgram;