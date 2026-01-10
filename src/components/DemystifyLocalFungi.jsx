"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Database,
  ExternalLink,
} from "lucide-react";

const DemystifyLocalFungi = ({ onBack }) => {
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
          Demystify Your Local Fungi
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-stone-600 text-lg mb-12 max-w-4xl">
          Unlock the secrets of fungi in your area! This citizen science program 
          empowers you to identify, document, and understand the fascinating world 
          of local mushrooms and their ecological importance.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Program Components */}
          <div className="space-y-6">
            <h4 className="text-emerald-600 font-bold text-xl mb-6">
              Program Components
            </h4>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Identification Training
                </h5>
                <p className="text-sm text-stone-600">
                  Learn to identify mushrooms using morphological features, spore prints, 
                  and field guides.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Documentation Methods
                </h5>
                <p className="text-sm text-stone-600">
                  Master photography techniques and data recording for scientific documentation.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Contribution
                </h5>
                <p className="text-sm text-stone-600">
                  Add your findings to our growing database of local fungal biodiversity.
                </p>
              </div>
            </div>

            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-3xl font-black">250+</div>
                  <div className="text-xs uppercase tracking-wider opacity-90">Species Documented</div>
                </div>
                <div>
                  <div className="text-3xl font-black">500+</div>
                  <div className="text-xs uppercase tracking-wider opacity-90">Citizen Scientists</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Why Participate */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <h4 className="font-black text-stone-800 uppercase mb-6">
              Why <span className="text-emerald-600">Participate?</span>
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Contribute to Science</h5>
                <p className="text-sm text-stone-600">
                  Your observations help researchers understand fungal distribution and ecology.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Learn from Experts</h5>
                <p className="text-sm text-stone-600">
                  Get guidance from mycologists and experienced mushroom enthusiasts.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Connect with Nature</h5>
                <p className="text-sm text-stone-600">
                  Develop a deeper appreciation for the hidden world of fungi around you.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Build Community</h5>
                <p className="text-sm text-stone-600">
                  Join a network of passionate fungi enthusiasts and nature lovers.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-stone-600 text-lg">
              Become a fungi detective and help us map the mycological treasures of your region!
            </p>
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95">
            Join Program <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DemystifyLocalFungi;
