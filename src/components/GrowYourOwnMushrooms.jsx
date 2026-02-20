"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sprout,
  Clock,
  Quote,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
} from "lucide-react";

const GrowYourOwnMushrooms = ({ onBack }) => {
  const router = useRouter();

  const testimonials = [
    {
      name: "Romi Kohsala",
      text: "I am not sure which is easier- to push a car uphill single-handedly or to enthuse an 80-year person to get excited to grow mushrooms. But Shrey has done just that. I was successful. Oysters grew.",
      highlight: "I just followed what he told me to do."
    },
    {
      name: "Raman Bhal",
      text: "Something that I couldn't even measure was the happiness which I got post getting the first harvest! It was invaluable!",
      highlight: ""
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-sky-100"
    >
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-100 p-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sky-600 font-bold hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Programs
        </button>
        <h2 className="text-3xl font-black text-sky-500 uppercase tracking-tight">
          Grow Your Own <span className="text-slate-800">Mushrooms</span>
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Section */}
        <div className="max-w-4xl mb-12">
          <p className="text-slate-700 text-xl font-medium leading-relaxed">
            This is an online, hands-on series of <span className="text-sky-600 font-bold">8 sessions</span> to help you grow your own <span className="underline decoration-sky-300 decoration-4 underline-offset-4">oyster mushrooms on kitchen waste.</span>
          </p>
          <div className="flex items-center gap-3 mt-4 text-slate-500">
            <Clock className="w-5 h-5 text-sky-500" />
            <p className="text-lg">Follow along & towards the end of this series, you will be able to successfully harvest your first crop in <span className="font-bold text-slate-800">30 days.</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left: Program Highlights */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
              <h4 className="text-sky-700 font-black uppercase tracking-wider mb-6 flex items-center gap-2">
                <Sprout className="w-6 h-6" /> Program Goals
              </h4>
              <ul className="space-y-4">
                {[
                  "Grow on Kitchen Waste",
                  "8 Comprehensive Sessions",
                  "First Harvest in 30 Days",
                  "Beginner Friendly",
                  "Step-by-Step Guidance"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-sky-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Participant Showcase Collage */}
            <div className="relative group overflow-hidden rounded-3xl shadow-lg border border-sky-100">
              <img
                src="/programs/gmw1.png"
                alt="Our Mushroom Growers"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-900/20 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Right: Testimonials (The Quote Section) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="relative">
              <Quote className="absolute -top-6 -left-6 w-12 h-12 text-sky-100 rotate-180" />
              <div className="space-y-8 relative z-10">
                {testimonials.map((t, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-8 rounded-3xl border-l-4 border-sky-400 shadow-sm border-y border-r border-slate-100"
                  >
                    <div className="flex items-start gap-4">
                      <MessageSquare className="w-6 h-6 text-sky-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-slate-600 italic text-lg leading-relaxed mb-4">
                          "{t.text} <span className="font-bold text-slate-800 not-italic">{t.highlight}</span>"
                        </p>
                        <p className="text-sky-600 font-bold flex items-center justify-end gap-2">
                          — {t.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Instructor Mention */}
            <div className="bg-slate-50 p-6 rounded-2xl text-center border border-dashed border-slate-300">
                <p className="text-slate-500 italic">"My family says there must be something extraordinary about him. They are absolutely right"</p>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-sky-600 font-bold uppercase tracking-widest text-sm">Ready to start?</span>
            <p className="text-slate-500 text-lg">
              Turn your kitchen waste into a bountiful mushroom harvest.
            </p>
          </div>

          <button 
            onClick={() => router.push('/register?program=mushroom-series')}
            className="group bg-[#4ade80] hover:bg-[#22c55e] text-white px-12 py-5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-green-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            Register Here 
            <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <ExternalLink className="w-6 h-6" />
            </motion.div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GrowYourOwnMushrooms;