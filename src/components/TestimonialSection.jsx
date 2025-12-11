// components/TestimonialSection.js

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";

import FramerAnimation from "@/components/FramerAnimation";

/* ---------------------------------------------------------
  TESTIMONIAL DATA
--------------------------------------------------------- */
const testimonials = [
  {
    quote:
      "From being a nature lover I became a nature protector. Thank you, Shery to show me the easy way of living keep up the good work and keep inspiring ❤️",
    name: "Dr. Shilpi Singh",
    title: "Yoga Trainer",
    imageSrc: "/images/testimonials/shilpi.jpeg", // Placeholder
  },
  {
    quote:
      "Something that I couldn't even measure was the happiness which I got post getting the first harvest! It was invaluable!",
    name: "Raman Bhal",
    title: "Founder, Learning Initiatives for India",
    imageSrc: "/images/testimonials/raman.jpeg", // Placeholder
  },
  {
    quote:
      "I am not sure which is easier- to push a car uphill single-handedly or to enthuse an 80-year person to get excited to grow mushrooms. But Shrey has done just that. I was successful. Oysters grew. I just followed what he told me to do. My family says there must be something extraordinary about him. They are absolutely right",
    name: "Romi Kohsala",
    title: "Celebrated Architect",
    imageSrc: "/images/testimonials/romi.jpeg", // Placeholder
  },
  {
    quote:
      "Shray never fails to amaze with his knowledge and passion and the experience of walking through Forest Road searching for mushrooms was really special. My 6-year old son enjoyed it immensely too so much so that he wants to go again!",
    name: "Avih Rastogi",
    title: "Naturalist",
    imageSrc: "/images/testimonials/avhi.jpeg", // Placeholder
  },
  {
    quote:
      "Thankuuu sooo much shrey for imparting your wealth of knowledge about the fungi world with us. It was an amzing experience to learn things from you, you are a wondurful Teacher and Great human Being... keep it up",
    name: "Kanchan Chandel",
    title: "Naturalist",
    imageSrc: "/images/testimonials/kanchan.jpeg", // Placeholder
  },
  {
    quote:
      "Shrey has Amazing knowledge on 🍄Mushrooms. His hands on DIY Mushrooms growing so simple and understandable for a common person. He is very organized and professional. Way to go! We collaborate with Shrey for few Mushrooms sessions & he was really great experience working with him. Bravo!!! We wish you all the best for your journey and all future initiatives. Thank you, ",
    name: "Anamika Bist",
    title: "Founder, Village Story",
    imageSrc: "/images/testimonials/anamika.jpeg", // Placeholder
  },
];

/* ---------------------------------------------------------
  TESTIMONIAL CARD SUBCOMPONENT
--------------------------------------------------------- */
function TestimonialCard({ quote, name, title, imageSrc }) {
  return (
    <div className="w-full md:w-[450px] lg:w-[400px] flex-shrink-0 snap-center p-8 bg-white rounded-3xl shadow-xl border border-stone-200 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] cursor-grab">
      <Quote className="w-8 h-8 text-orange-600 mb-4 transform -scale-x-100 opacity-70" />
      <p className="text-xl italic text-slate-700 mb-6 leading-relaxed">
        {quote}
      </p>
      
      <div className="flex items-center pt-4 border-t border-stone-100">
        {imageSrc && (
          <div className="w-14 h-14 mr-4 rounded-full overflow-hidden flex-shrink-0 bg-stone-200 border-2 border-orange-500/50">
            <Image 
              src={imageSrc} 
              alt={name} 
              width={56}
              height={56}
              className="object-cover w-full h-full"
            />
          </div>
        )}

        <div>
          <h4 className="text-xl font-extrabold text-slate-900">{name}</h4>
          <p className="text-orange-500 text-sm font-semibold mt-1">{title}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
  MAIN TESTIMONIAL SECTION COMPONENT
--------------------------------------------------------- */
export default function TestimonialSection() {
  const googleReviewLink = "https://share.google/A29hvCVtrkSWgRdRC";
  
  const carouselRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollSpeed = 5000; // Auto-slide every 5 seconds
  const testimonialContainerPadding = 16; // Corresponds to p-4 inside the carousel track

  // Utility function to scroll the carousel
  const scrollCarousel = (direction) => {
    if (carouselRef.current && !isScrolling) {
      setIsScrolling(true);
      const { current } = carouselRef;
      // Get the width of the first card (assuming all are the same) and add spacing (space-x-8 = 32px)
      const cardWidth = current.children[0].offsetWidth + 32; 
      
      let newScrollLeft = current.scrollLeft;
      const maxScroll = current.scrollWidth - current.clientWidth;

      if (direction === 'next') {
        newScrollLeft += cardWidth;
        // Check if we hit the end, loop to start (0)
        if (newScrollLeft >= maxScroll) { 
          newScrollLeft = 0;
        }
      } else if (direction === 'prev') {
        newScrollLeft -= cardWidth;
        // Check if we hit the start, loop to end (maxScroll)
        if (newScrollLeft < 0) {
          newScrollLeft = maxScroll; 
        }
      }
      
      current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      // Reset scrolling state after animation
      setTimeout(() => setIsScrolling(false), 500);
    }
  };

  const handleNext = () => scrollCarousel('next');
  const handlePrev = () => scrollCarousel('prev');

  // Auto-sliding Logic
  useEffect(() => {
    const autoSlide = setInterval(() => {
      scrollCarousel('next');
    }, scrollSpeed);

    return () => clearInterval(autoSlide);
  }, []); 

  return (
    // Moved 'relative' to the outer section container
    <section className="py-24 bg-stone-50 overflow-hidden relative"> 
      <style global jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }
      `}</style>

      {/* Main Content Container: max-w-7xl mx-auto px-4 */}
      <div className="max-w-7xl mx-auto px-4"> 
        <FramerAnimation delay={0.1}>
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-sm">
              Community Voices
            </span>
            <h2 className="mt-3 text-4xl md:text-5xl font-extrabold text-slate-900 text-shadow-md">
              Hear From Our Community
            </h2>
            <div className="w-24 h-1.5 mx-auto mt-6 bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full" />
          </div>
        </FramerAnimation>

        {/* Testimonial Carousel Track */}
        <FramerAnimation delay={0.3}>
          {/* Note: Removed the extra 'relative' div wrapper here */}
          <div 
            ref={carouselRef} 
            // Tailwind classes ensure it looks great and scrolls horizontally
            className="flex space-x-8 pb-4 -mx-4 px-4 overflow-x-auto snap-x snap-mandatory lg:mx-auto lg:px-0 scrollbar-hide shadow-inner bg-stone-100/50 rounded-3xl p-4 transition-all duration-500 ease-in-out"
          >
            {testimonials.map((t, index) => (
              <TestimonialCard key={index} {...t} />
            ))}
          </div>
        </FramerAnimation>
        
        {/* Attribution / CTA */}
        <FramerAnimation delay={0.4}>
          <div className="text-center mt-12">
            <p className="text-slate-600 text-lg mb-4">
              Read more reviews and share your story on our official page.
            </p>
            <Link
              href={googleReviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center text-white bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-full font-bold shadow-lg shadow-orange-500/50 transition-all transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <Star className="w-5 h-5 mr-2 fill-current" />
              <span className="border-b-2 border-transparent group-hover:border-white transition">
                See All Google Reviews
              </span>
            </Link>
          </div>
        </FramerAnimation>
      </div>

      {/* NEW: Navigation Arrows - Outside the Inner Content Div */}
      {/* Positioning: 
        - Absolute relative to the parent <section className="relative">.
        - Using 'left-1/2' and 'right-1/2' with large negative margins to visually center them 
          vertically on the carousel area, while being on the far edges of the screen 
          (or use absolute values like lg:left-8). 
      */}
      
      {/* Previous Button */}
      <button
        onClick={handlePrev}
        aria-label="Previous testimonial"
        // Positioned relative to the section, aligned to the left edge of the screen
        className="absolute top-1/2 left-4 transform -translate-y-full mt-[-2.5rem] bg-white p-3 rounded-full shadow-lg border border-stone-200 text-slate-800 hover:bg-orange-500 hover:text-white transition-colors duration-200 z-20 hidden md:block disabled:opacity-50 lg:left-8"
        disabled={isScrolling}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* Next Button */}
      <button
        onClick={handleNext}
        aria-label="Next testimonial"
        // Positioned relative to the section, aligned to the right edge of the screen
        className="absolute top-1/2 right-4 transform -translate-y-full mt-[-2.5rem] bg-white p-3 rounded-full shadow-lg border border-stone-200 text-slate-800 hover:bg-orange-500 hover:text-white transition-colors duration-200 z-20 hidden md:block disabled:opacity-50 lg:right-8"
        disabled={isScrolling}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </section>
  );
}