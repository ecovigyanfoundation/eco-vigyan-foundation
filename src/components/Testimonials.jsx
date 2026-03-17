"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      quote: "From being a nature lover I became a nature protector. Thank you, Shery to show me the easy way of living keep up the good work and keep inspiring ❤️",
      name: "Dr. Shilpi Singh",
      title: "Yoga Trainer",
      imageSrc: "/images/testimonials/shilpi.jpeg",
      rating: 5,
      gradient: 'from-emerald-50 to-teal-50'
    },
    {
      quote: "Something that I couldn't even measure was the happiness which I got post getting the first harvest! It was invaluable!",
      name: "Raman Bhal",
      title: "Founder, Learning Initiatives for India",
      imageSrc: "/images/testimonials/raman.jpeg",
      rating: 5,
      gradient: 'from-green-50 to-emerald-50'
    },
    {
      quote: "I am not sure which is easier- to push a car uphill single-handedly or to enthuse an 80-year person to get excited to grow mushrooms. But Shrey has done just that. I was successful. Oysters grew. I just followed what he told me to do.",
      name: "Romi Kohsala",
      title: "Celebrated Architect",
      imageSrc: "/images/testimonials/romi.jpeg",
      rating: 5,
      gradient: 'from-amber-50 to-orange-50'
    },
    {
      quote: "Shray never fails to amaze with his knowledge and passion and the experience of walking through Forest Road searching for mushrooms was really special. My 6-year old son enjoyed it immensely too!",
      name: "Avih Rastogi",
      title: "Naturalist",
      imageSrc: "/images/testimonials/avhi.jpeg",
      rating: 5,
      gradient: 'from-teal-50 to-cyan-50'
    },
    {
      quote: "Thankuuu sooo much shrey for imparting your wealth of knowledge about the fungi world with us. It was an amzing experience to learn things from you, you are a wondurful Teacher.",
      name: "Kanchan Chandel",
      title: "Naturalist",
      imageSrc: "/images/testimonials/kanchan.jpeg",
      rating: 5,
      gradient: 'from-purple-50 to-pink-50'
    },
    {
      quote: "Shrey has Amazing knowledge on 🍄Mushrooms. His hands on DIY Mushrooms growing so simple and understandable for a common person. He is very organized and professional.",
      name: "Anamika Bist",
      title: "Founder, Village Story",
      imageSrc: "/images/testimonials/anamika.jpeg",
      rating: 5,
      gradient: 'from-rose-50 to-red-50'
    }
  ];

  const next = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-4">
              <Star className="w-4 h-4 fill-current" />
              Community Voice
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-serif text-emerald-950 mb-4">
              What People Say
            </h2>
            <p className="text-emerald-800/70 max-w-2xl mx-auto">
              Hear from our partners, researchers, and community members about their experience working with us.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          {/* Main Testimonial Carousel */}
          <div className="max-w-5xl mx-auto relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${testimonials[activeIndex].gradient} rounded-[40px] p-8 md:p-16 border-2 border-emerald-100 shadow-2xl`}>
                  {/* Large Quote Mark */}
                  <div className="absolute top-8 left-8 text-emerald-600/20">
                    <Quote className="w-16 h-16 md:w-24 md:h-24 fill-current" />
                  </div>

                  <div className="relative z-10">
                    {/* Stars */}
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-emerald-600 text-emerald-600" />
                      ))}
                    </div>

                    {/* Quote */}
                    <blockquote className="text-2xl md:text-3xl font-serif text-emerald-950 mb-8 leading-relaxed">
                      "{testimonials[activeIndex].quote}"
                    </blockquote>

                    {/* Author Info */}
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonials[activeIndex].imageSrc}
                        alt={testimonials[activeIndex].name}
                        className="w-16 h-16 rounded-full object-cover shadow-lg ring-4 ring-white"
                      />
                      <div>
                        <div className="font-bold text-emerald-900 text-lg">
                          {testimonials[activeIndex].name}
                        </div>
                        <div className="text-emerald-600 text-sm">
                          {testimonials[activeIndex].title}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full bg-white border-2 border-emerald-200 flex items-center justify-center text-emerald-900 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-lg"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full bg-emerald-600 border-2 border-emerald-600 flex items-center justify-center text-white hover:bg-emerald-700 transition-all shadow-lg"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'w-8 bg-emerald-600'
                      : 'w-2 bg-emerald-200 hover:bg-emerald-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
