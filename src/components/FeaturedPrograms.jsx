"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Sparkles, TreeDeciduous, School, Heart, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedPrograms() {
  const featuredPrograms = [
    {
      id: 'grow-mushrooms',
      title: 'Grow Your Own Mushrooms',
      tagline: 'Turn kitchen waste into mushrooms in 30 days',
      description: 'An 8-session online course to help you grow oyster mushrooms on kitchen waste. Perfect for beginners!',
      icon: TreeDeciduous,
      color: 'from-emerald-500 to-teal-600',
      highlights: [
        'Harvest in just 30 days',
        'Beginner friendly',
        '8 hands-on sessions'
      ]
    },
    {
      id: 'wipro-earthian',
      title: 'Wipro Earthian Program',
      tagline: 'National school sustainability competition',
      description: 'Join schools across India in building eco-clubs focused on biodiversity, water, waste management, and community awareness.',
      icon: School,
      color: 'from-purple-500 to-pink-600',
      highlights: [
        'National-level competition',
        'Whole school participation',
        'Full year program'
      ]
    },
    {
      id: 'chemical-free',
      title: 'Chemical Free Living',
      tagline: '3 sessions to decode non-toxic living',
      description: 'Learn to identify synthetic chemicals in your everyday products and create natural alternatives for food, personal care, and cleaning.',
      icon: Heart,
      color: 'from-rose-500 to-red-600',
      highlights: [
        'Chemical-free edibles',
        'Natural personal care',
        'DIY bio-products'
      ]
    }
  ];

  return (
    <section id="programs" className="py-24 bg-gradient-to-b from-white to-emerald-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-sm font-semibold mb-4">
              <Sparkles className="w-4 h-4" />
              Education & Action
            </div>
            <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-3">Join Our Programs</h2>
            <h3 className="text-4xl md:text-5xl font-bold font-serif text-emerald-950">Featured Learning Experiences</h3>
          </div>
          <Link href="/programs">
            <button className="text-emerald-900 font-bold flex items-center gap-2 hover:gap-3 transition-all group">
              View All Programs 
              <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform" />
            </button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {featuredPrograms.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white rounded-3xl overflow-hidden border border-emerald-100 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
            >
              {/* Header with Gradient */}
              <div className={`relative h-40 bg-gradient-to-br ${program.color} p-6 flex items-center justify-between`}>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,_white,transparent)]" />
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <program.icon className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-xl font-bold text-emerald-950 mb-2 group-hover:text-emerald-600 transition-colors">
                  {program.title}
                </h4>
                <p className="text-emerald-600 text-sm font-semibold mb-3">
                  {program.tagline}
                </p>
                <p className="text-emerald-800/70 text-sm mb-4 leading-relaxed">
                  {program.description}
                </p>

                {/* Highlights */}
                <ul className="space-y-2 mb-6">
                  {program.highlights.map((highlight, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-emerald-800/60">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>

                <Link href={`/programs#${program.id}`}>
                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg">
                    Learn More & Enroll
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
