"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users, Heart, ArrowRight, Sparkles } from 'lucide-react';

export default function CallToAction() {
  return (
    <section className="py-24 px-4 bg-gradient-to-b from-emerald-700 to-emerald-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600/50 text-white text-sm font-semibold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            Join Our Mission
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold font-serif text-white mb-6"
          >
            Be Part of the Change
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 max-w-3xl mx-auto"
          >
            Whether you want to volunteer your time or support our research, every contribution helps us create a greener, more sustainable future.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Volunteer CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/join-us">
              <div className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  Volunteer Today
                </h3>
                
                <p className="text-emerald-100/70 mb-6 leading-relaxed">
                  Join our community of passionate volunteers and make a direct impact through field work, education programs, and conservation projects.
                </p>
                
                <div className="flex items-center gap-2 text-emerald-300 font-semibold group-hover:gap-4 transition-all">
                  Get Involved
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Donate CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/donate">
              <div className="group bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-3xl p-8 hover:bg-white/15 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  Support Our Research
                </h3>
                
                <p className="text-emerald-100/70 mb-6 leading-relaxed">
                  Your financial support enables groundbreaking ecological research, field studies, and conservation initiatives across India.
                </p>
                
                <div className="flex items-center gap-2 text-amber-300 font-semibold group-hover:gap-4 transition-all">
                  Donate Now
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
