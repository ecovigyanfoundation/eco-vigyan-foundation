"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Leaf,
  Droplets,
  Sparkles,
  ShoppingBasket,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

const ChemicalFreeLiving = ({ onBack }) => {
  const router = useRouter();

  const themes = [
    {
      title: "Chemical-free Edibles",
      icon: <ShoppingBasket className="w-6 h-6 text-emerald-500" />,
      desc: "Decode what goes into your food and transition to natural alternatives.",
    },
    {
      title: "Personal Care Products",
      icon: <Sparkles className="w-6 h-6 text-sky-500" />,
      desc: "Learn to identify synthetic chemicals in skincare and hygiene routines.",
    },
    {
      title: "Household Cleaning",
      icon: <Droplets className="w-6 h-6 text-blue-500" />,
      desc: "Create effective, non-toxic cleaners for a safer home environment.",
    },
  ];

  const testimonials = [
    {
      text: "It was reflective and provided solutions rather just discussing about problems",
      color: "bg-sky-100 border-sky-200 text-sky-800",
      position: "md:rotate-[-2deg]",
    },
    {
      text: "What is not good for you & me is not good for Mother earth too!",
      color: "bg-emerald-100 border-emerald-200 text-emerald-800",
      position: "md:translate-y-4",
    },
    {
      text: "We could make bioproducts on our own and the ingredients were as easily available as the process.",
      color: "bg-white border-slate-200 text-slate-700 shadow-sm",
      position: "md:rotate-[2deg]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-emerald-50"
    >
      {/* Header Bar */}
      <div className="bg-white border-b border-slate-100 p-6 flex flex-col md:row justify-between items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <h2 className="text-3xl font-black text-sky-500 uppercase tracking-tight">
          Chemical Free <span className="text-emerald-500">Living Series</span>
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Section */}
        <div className="max-w-4xl mb-12">
          <p className="text-slate-700 text-xl leading-relaxed">
            To handhold you and get you off most synthetic chemicals in your everyday routine, 
            we are happy to announce a <span className="font-bold text-emerald-600">journey of 3 sessions</span> to 
            decode a synthetic chemical-free living.
          </p>
        </div>

        {/* Themes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {themes.map((theme, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center space-y-4"
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm">{theme.icon}</div>
              <h4 className="font-bold text-slate-800">{theme.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed">{theme.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Educators Feedback Section */}
        <div className="bg-[#f3f4e9] rounded-[3rem] p-8 md:p-12 border border-slate-200 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-10">
            <MessageCircle className="w-8 h-8 text-indigo-600" />
            <h3 className="text-2xl font-black text-indigo-900 uppercase">Educators Said!</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className={`${t.color} ${t.position} p-8 rounded-[2rem] border-2 flex items-center justify-center text-center font-medium leading-snug shadow-sm`}
              >
                "{t.text}"
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 flex flex-col md:row items-center justify-between gap-8 border-t border-slate-100 pt-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <Leaf className="text-emerald-600 w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Start your natural journey</p>
              <p className="text-sm text-slate-500">3 Sessions to decode non-toxic living</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/register?program=chemical-free")}
            className="group bg-[#4ade80] hover:bg-[#22c55e] text-white px-10 py-5 rounded-full font-black uppercase tracking-widest shadow-xl shadow-green-100 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            Register Here
            <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChemicalFreeLiving;