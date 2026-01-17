"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Droplets,
  Home,
  Leaf,
  ExternalLink,
} from "lucide-react";

const ChemicalFreeLivingSeries = ({ onBack }) => {
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
          Chemical Free Living Series
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-stone-600 text-lg mb-12 max-w-4xl">
          Embrace a healthier lifestyle with our comprehensive workshop series on 
          chemical-free living. Learn practical solutions to reduce your chemical 
          footprint and create a safer, more sustainable home environment.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Workshop Topics */}
          <div className="space-y-6">
            <h4 className="text-emerald-600 font-bold text-xl mb-6">
              Workshop Series
            </h4>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Droplets className="w-5 h-5" />
                  Natural Cleaning Products
                </h5>
                <p className="text-sm text-stone-600">
                  Make your own eco-friendly cleaning solutions using simple household ingredients.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Chemical-Free Home Care
                </h5>
                <p className="text-sm text-stone-600">
                  Discover alternatives to chemical-laden products for home maintenance and care.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Organic Personal Care
                </h5>
                <p className="text-sm text-stone-600">
                  Create natural personal care products for healthier skin and body.
                </p>
              </div>
            </div>

            {/* Impact Box */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
              <h5 className="font-bold mb-2">Environmental Impact</h5>
              <p className="text-sm opacity-90">
                By switching to chemical-free alternatives, each household can prevent 
                approximately 20kg of harmful chemicals from entering our water systems annually.
              </p>
            </div>
          </div>

          {/* Right: Benefits & Topics */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <h4 className="font-black text-stone-800 uppercase mb-6">
              What You'll <span className="text-emerald-600">Gain</span>
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Healthier Living</h5>
                <p className="text-sm text-stone-600">
                  Reduce exposure to harmful chemicals and toxins in your daily life.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Cost Savings</h5>
                <p className="text-sm text-stone-600">
                  DIY solutions are often more economical than commercial chemical products.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Environmental Protection</h5>
                <p className="text-sm text-stone-600">
                  Minimize your ecological footprint and contribute to a cleaner planet.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Practical Skills</h5>
                <p className="text-sm text-stone-600">
                  Learn recipes and techniques you can use immediately at home.
                </p>
              </div>

              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-sm">
                <p className="font-bold text-center">
                  Recipe booklet and starter kit included!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-stone-600 text-lg">
              Take the first step towards a chemical-free lifestyle and create a 
              healthier home for you and your family!
            </p>
          </div>

          <button 
            onClick={() => router.push('/register?program=chemical-free')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95"
          >
            Register Now <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ChemicalFreeLivingSeries;
