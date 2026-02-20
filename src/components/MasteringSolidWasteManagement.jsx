"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trash2,
  Recycle,
  Lightbulb,
  Quote,
  ExternalLink,
  PlayCircle,
  Heart
} from "lucide-react";

const MasteringSolidWaste = ({ onBack }) => {
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
          Mastering Solid <span className="text-emerald-600">Waste Management</span>
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <div className="mb-12 max-w-5xl">
          <p className="text-slate-700 text-xl leading-relaxed mb-6">
            This is our <span className="text-emerald-600 font-bold italic underline decoration-sky-300">pilot program</span>, designed to empower institutes, households, and communities in waste management.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <div className="flex gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm h-fit">
                <Recycle className="text-emerald-500 w-6 h-6" />
              </div>
              <p className="text-slate-600 text-sm">
                <span className="font-bold text-slate-800 block mb-1">Streamlined Composting</span>
                A key highlight delivering organic compost in just 6-8 months.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm h-fit">
                <Lightbulb className="text-sky-500 w-6 h-6" />
              </div>
              <p className="text-slate-600 text-sm">
                <span className="font-bold text-slate-800 block mb-1">Zero-Waste Events</span>
                We assist organizations in hosting events where we upcycle waste following the 3 R's.
              </p>
            </div>
          </div>
        </div>

        {/* Video Highlight Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 text-sky-600">
            <PlayCircle className="w-6 h-6" />
            <h4 className="font-bold">Check out how school events transform waste into decorations & unique gifts</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Video Player */}
            <div className="lg:col-span-7 aspect-video bg-black rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/lyseeUQZv0Y"
                title="Zero Waste Event | Eco Vigyan"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Photo & Testimonial Column */}
            <div className="lg:col-span-5 space-y-6">
                <div className="aspect-[4/3] bg-slate-200 rounded-[2rem] overflow-hidden border-4 border-white shadow-lg relative group">
                   <img
                     src="/programs/img3.png"
                     alt="Zero Waste Event Participation"
                     className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                   />
                   <div className="absolute inset-0 bg-emerald-600/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                </div>

               <div className="relative pt-6">
                 <Quote className="absolute -top-2 -left-4 w-10 h-10 text-pink-100 rotate-180" />
                 <div className="bg-white p-6 rounded-[2rem] border-r-4 border-pink-400 shadow-sm border-y border-l border-slate-50">
                    <p className="text-slate-600 italic text-lg leading-relaxed mb-4">
                      "From being a nature lover I became a nature protector. Thank you, Shery to show me the easy way of living keep up the good work and keep inspiring <Heart className="inline w-4 h-4 text-pink-500 fill-pink-500" />"
                    </p>
                    <p className="text-sky-600 font-bold text-right">— Dr. Shilpi Singh</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center">
              <Trash2 className="text-sky-600 w-7 h-7" />
            </div>
            <div>
              <p className="text-slate-800 font-black uppercase text-sm tracking-widest">Join the Movement</p>
              <p className="text-slate-500">Empower your community in waste management</p>
            </div>
          </div>

          <button 
            onClick={() => router.push('/register?program=waste-management')}
            className="group bg-[#4ade80] hover:bg-[#22c55e] text-white px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-green-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            Register Here <ExternalLink className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MasteringSolidWaste;