"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ArticleImage({ src, alt }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div 
        className="relative aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden shadow-md cursor-zoom-in group border border-gray-100"
        onClick={() => setIsOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white text-5xl font-light z-[110]"
            onClick={() => setIsOpen(false)}
          >
            &times;
          </button>
          
          <div className="relative w-[95vw] h-[85vh]">
            <Image
              src={src}
              alt={alt}
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}