"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Shield, Zap, Leaf } from 'lucide-react';
import Link from 'next/link';

export default function WhyOurApproach() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-white via-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-emerald-100/50 to-emerald-50/30 rounded-[48px] p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center border-2 border-emerald-100/50 shadow-xl">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-emerald-700 text-sm font-semibold mb-4 border border-emerald-200">
                <Leaf className="w-4 h-4" />
                Our Methodology
              </div>
              <h3 className="text-4xl font-bold font-serif text-emerald-950">Why Our Approach Works</h3>
            </motion.div>
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex gap-4 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-lg mb-2">We Simplify Science</h4>
                  <p className="text-emerald-800/70 leading-relaxed">We break down complex environmental concepts so children can understand them — and if a child can understand it, anyone can.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex gap-4 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-lg mb-2">We Strengthen What Already Exists</h4>
                  <p className="text-emerald-800/70 leading-relaxed">We build on existing eco-club activities in schools, enhancing impact without adding extra burden or new frameworks.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex gap-4 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-700 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 text-lg mb-2">We Focus on Local Solutions</h4>
                  <p className="text-emerald-800/70 leading-relaxed">We address real environmental challenges with practical, community-driven solutions rooted in local ecosystems.</p>
                </div>
              </motion.div>
            </div>
            
            <Link href="/programs">
              <button className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-10 py-4 rounded-2xl font-bold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg shadow-emerald-200">
                Join Our Programs
              </button>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex-1 w-full relative"
          >
            <div className="aspect-square rounded-[32px] overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src="/gallery/img3.jpeg"
                className="w-full h-full object-cover" 
                alt="Ecology Lab"
              />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute -top-6 -right-6 bg-gradient-to-br from-white to-emerald-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white shadow-lg">
                <Leaf size={24} />
              </div>
              <span className="font-bold text-emerald-900 pr-2">Head, Heart & Hand</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
