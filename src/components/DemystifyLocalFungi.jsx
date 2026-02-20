"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  BookOpen,
  Link as LinkIcon,
  Quote,
  ExternalLink,
  MapPin
} from "lucide-react";

const DemystifyLocalFungi = ({ onBack }) => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-sky-100"
    >
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-100 p-6 flex flex-col md:row justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sky-600 font-bold hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Programs
        </button>
        <h2 className="text-3xl font-black text-sky-500 uppercase tracking-tight">
          Demystify Your <span className="text-slate-800">Local Fungi</span>
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-slate-700 text-xl leading-relaxed mb-12 max-w-5xl">
          Join us on an exciting journey to become local mushroom experts! You'll become masters at 
          <span className="font-bold text-sky-600"> spotting and understanding</span> the ecological importance of mushrooms for life. 
          Plus, we'll create a <span className="underline decoration-pink-300 decoration-4 underline-offset-4">field guide of the mushrooms around you.</span>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left/Middle: Visuals & Links */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image Card 1 */}
              <div className="space-y-4">
                <div className="group aspect-[4/3] bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-md">
                   <img
                     src="/programs/img1.png"
                     alt="Field Exploration"
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                </div>
                <button className="w-full bg-[#5da2d5] hover:bg-[#4a8ebf] text-white py-4 rounded-xl flex items-center justify-center gap-3 font-bold transition-all shadow-lg shadow-blue-100">
                  <LinkIcon className="w-5 h-5" /> Click here to know more
                </button>
              </div>

              {/* Image Card 2 */}
              <div className="space-y-4">
                <div className="group aspect-[4/3] bg-slate-200 rounded-3xl overflow-hidden border-4 border-white shadow-md">
                   <img
                     src="/programs/img2.png"
                     alt="Macro Observation"
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                </div>
                <button className="w-full bg-[#5da2d5] hover:bg-[#4a8ebf] text-white py-4 rounded-xl flex flex-col items-center justify-center leading-tight font-bold transition-all shadow-lg shadow-blue-100">
                  <span className="flex items-center gap-2"><LinkIcon className="w-5 h-5" /> Check out our</span>
                  <span>observations here</span>
                </button>
              </div>
            </div>

            {/* Program Details/Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-sky-50 p-4 rounded-2xl flex items-center gap-3">
                <MapPin className="text-sky-500 w-6 h-6" />
                <span className="text-slate-700 font-bold">Local Walks</span>
              </div>
              <div className="bg-sky-50 p-4 rounded-2xl flex items-center gap-3">
                <Search className="text-sky-500 w-6 h-6" />
                <span className="text-slate-700 font-bold">Identification</span>
              </div>
              <div className="bg-sky-50 p-4 rounded-2xl flex items-center gap-3">
                <BookOpen className="text-sky-500 w-6 h-6" />
                <span className="text-slate-700 font-bold">Field Guide</span>
              </div>
            </div>
          </div>

          {/* Right: Testimonial & CTA */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-8">
            {/* Pink Quote Box */}
            <div className="relative p-1 bg-pink-200 rounded-[2rem]">
              <div className="bg-white p-8 rounded-[1.8rem] relative">
                <Quote className="absolute -top-4 -left-2 w-10 h-10 text-pink-200" />
                <p className="text-slate-600 text-lg italic leading-relaxed mb-6">
                  "Got yet another reason to walk in Woods.. Definitely looking forward to Co-creating a guide book for my area."
                </p>
                <p className="text-sky-500 font-bold text-right">— Venus Joshi</p>
                <Quote className="absolute -bottom-4 -right-2 w-10 h-10 text-pink-200 rotate-180" />
              </div>
            </div>

            {/* Register CTA */}
            <div className="flex flex-col items-end gap-4">
               <button 
                onClick={() => router.push('/register?program=local-fungi')}
                className="group bg-[#4ade80] hover:bg-[#22c55e] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-green-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
              >
                Register Here 
                <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DemystifyLocalFungi;