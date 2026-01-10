"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Recycle,
  TrendingDown,
  Users2,
  ExternalLink,
} from "lucide-react";

const MasteringSolidWasteManagement = ({ onBack }) => {
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
          Mastering Solid Waste Management
        </h2>
      </div>

      <div className="p-8 md:p-12">
        {/* Intro Text */}
        <p className="text-stone-600 text-lg mb-12 max-w-4xl">
          Transform waste management in your community! This comprehensive program 
          provides practical training on effective waste segregation, composting, 
          recycling, and implementing sustainable waste management systems.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left: Training Modules */}
          <div className="space-y-6">
            <h4 className="text-emerald-600 font-bold text-xl mb-6">
              Training Modules
            </h4>

            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Recycle className="w-5 h-5" />
                  Waste Segregation Systems
                </h5>
                <p className="text-sm text-stone-600">
                  Learn effective methods for sorting waste at source into wet, dry, and hazardous categories.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Waste Reduction Strategies
                </h5>
                <p className="text-sm text-stone-600">
                  Implement proven tactics to minimize waste generation at household and community levels.
                </p>
              </div>

              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                  <Users2 className="w-5 h-5" />
                  Community Engagement
                </h5>
                <p className="text-sm text-stone-600">
                  Develop skills to mobilize and educate communities for collective waste management action.
                </p>
              </div>
            </div>

            {/* Success Story */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
              <h5 className="font-bold mb-2">Community Impact</h5>
              <p className="text-sm opacity-90">
                Our pilot communities have achieved 70% waste diversion from landfills 
                through composting and recycling initiatives within the first year.
              </p>
            </div>
          </div>

          {/* Right: Program Elements */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
            <h4 className="font-black text-stone-800 uppercase mb-6">
              Program <span className="text-emerald-600">Elements</span>
            </h4>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Composting Techniques</h5>
                <p className="text-sm text-stone-600">
                  Master vermicomposting, aerobic composting, and bokashi methods for organic waste.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Recycling Networks</h5>
                <p className="text-sm text-stone-600">
                  Connect with local recycling chains and establish effective recycling systems.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Policy Advocacy</h5>
                <p className="text-sm text-stone-600">
                  Learn to engage with local authorities for better waste management policies.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm">
                <h5 className="font-bold text-emerald-900 mb-2">Monitoring & Reporting</h5>
                <p className="text-sm text-stone-600">
                  Track waste metrics and measure the impact of your management initiatives.
                </p>
              </div>

              <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-sm">
                <p className="font-bold text-center">
                  Toolkit and implementation guide provided!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer: CTA */}
        <div className="mt-16 pt-8 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-stone-600 text-lg">
              Lead the change in your community and create a cleaner, more sustainable 
              future through effective waste management!
            </p>
          </div>

          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-3 transition-all active:scale-95">
            Get Started <ExternalLink className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MasteringSolidWasteManagement;
