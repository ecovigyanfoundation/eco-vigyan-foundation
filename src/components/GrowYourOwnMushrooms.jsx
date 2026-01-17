"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Sprout,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";

const GrowYourOwnMushrooms = ({ onBack }) => {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-emerald-100"
    >
      {/* Top Header Bar */}
      <div className="bg-white border-b border-stone-100 p-6 flex justify-between items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Programs
        </button>
        <h2 className="text-2xl font-black text-emerald-800 uppercase tracking-tighter">
          Grow Your Own Mushrooms
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-stone-600 text-lg mb-12 max-w-4xl">
          Learn the art and science of mushroom cultivation! This hands-on program 
          teaches you how to grow nutritious and delicious mushrooms at home, from 
          substrate preparation to harvesting. Perfect for beginners and enthusiasts alike.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Program Details */}
          <div className="space-y-6">
            <h4 className="text-emerald-600 font-bold text-xl mb-6">
              What You'll Learn
            </h4>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Sprout className="w-5 h-5" />
                  Substrate Preparation
                </h5>
                <p className="text-sm text-stone-600">
                  Master the techniques of preparing optimal growing mediums for different mushroom species.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Cultivation Cycles
                </h5>
                <p className="text-sm text-stone-600">
                  Understand the complete lifecycle from inoculation to fruiting and harvesting.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Hands-On Training
                </h5>
                <p className="text-sm text-stone-600">
                  Get practical experience with live demonstrations and interactive sessions.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Program Features */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <h4 className="font-black text-stone-800 uppercase mb-6">
              Program <span className="text-emerald-600">Features</span>
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Oyster Mushrooms</h5>
                <p className="text-sm text-stone-600">
                  Easy to grow, fast-growing, and perfect for beginners
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Button Mushrooms</h5>
                <p className="text-sm text-stone-600">
                  Learn commercial cultivation techniques for the most popular variety
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Specialty Varieties</h5>
                <p className="text-sm text-stone-600">
                  Explore unique mushrooms like shiitake and lion's mane
                </p>
              </div>

              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-sm">
                <p className="font-bold text-center">
                  Take-home mushroom growing kit included!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-stone-600 text-lg">
              Start your mushroom growing journey today and discover the joy of 
              cultivating your own fresh, organic mushrooms at home!
            </p>
          </div>

          <button 
            onClick={() => router.push('/register?program=grow-mushrooms')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95"
          >
            Register Here <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GrowYourOwnMushrooms;
