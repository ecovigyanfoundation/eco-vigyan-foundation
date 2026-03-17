"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TreePine, Users, FlaskConical, School, Compass } from 'lucide-react';

function AnimatedCounter({ end, duration = 2, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
    let startTime = null;
    const startValue = 0;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * (end - startValue) + startValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function ImpactStats() {
  const stats = [
    {
      icon: School,
      value: 300,
      suffix: '+',
      label: 'Schools Partnered',
      description: 'Environmental education programs',
      gradient: 'from-emerald-600 to-emerald-700',
    },
    {
      icon: Users,
      value: 450,
      suffix: '+',
      label: 'Teachers Trained',
      description: 'Capacity building initiatives',
      gradient: 'from-green-600 to-teal-700',
    },
    {
      icon: Users,
      value: 20,
      suffix: 'K+',
      label: 'Students Reached',
      description: 'Future environmental leaders',
      gradient: 'from-teal-600 to-cyan-700',
    },
    {
      icon: TreePine,
      value: 100,
      suffix: '+',
      label: 'Community Initiatives',
      description: 'Local conservation projects',
      gradient: 'from-amber-600 to-orange-700',
    },
    {
      icon: FlaskConical,
      value: 5000,
      suffix: '+',
      label: 'Mushrooms Mapped',
      description: 'Fungal biodiversity database',
      gradient: 'from-violet-600 to-purple-700',
    },
    {
      icon: Compass,
      value: 12,
      suffix: '+',
      label: 'Mushroom Trails Created',
      description: 'Interactive nature experiences',
      gradient: 'from-rose-600 to-pink-700',
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600 blur-[120px] rounded-full" />
      </div>

      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 border-2 border-white rounded-full" />
        <div className="absolute bottom-20 right-20 w-96 h-96 border-2 border-white rounded-full" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-white text-4xl md:text-5xl font-bold font-serif mb-6 leading-tight">
              Our Impact in Numbers
            </h2>
            <p className="text-emerald-100/70 text-lg max-w-2xl mx-auto">
              Measurable progress towards a sustainable future, backed by science and driven by community engagement.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 overflow-hidden h-full">
                {/* Icon */}
                <div className={`relative w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>

                {/* Number */}
                <div className="relative text-5xl md:text-6xl font-bold text-white mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>

                {/* Label */}
                <div className="relative text-emerald-100 font-bold text-lg mb-2">
                  {stat.label}
                </div>

                {/* Description */}
                <div className="relative text-emerald-100/60 text-sm">
                  {stat.description}
                </div>

                {/* Decorative Corner */}
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-white/90 text-xl md:text-2xl font-serif italic max-w-3xl mx-auto">
            "To preserve the wild is not just to save species, but to secure our own scientific and spiritual future."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
