"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter, 
  Menu, 
  X, 
  Sprout, 
  Heart 
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleNavClick = useCallback((event, link) => {
    if (!link.path.startsWith("/#")) return;

    event.preventDefault();
    const hash = link.path.split("#")[1];
    if (!hash) return;

    const scrollToSection = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    if (window.location.pathname !== "/") {
      window.location.href = link.path;
    } else {
      scrollToSection();
    }
  }, []);

  // Define links in one place to ensure consistency
  // Note: 'About' uses a hash (#about) to scroll to the section on the home page
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/#about' }, 
    { name: 'Explore', path: '/map', isNew: true },
  ];

  // Handle scroll effect for sticky nav
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* --- TOP UTILITY BAR --- */}
      <div className="bg-emerald-950 text-emerald-50 text-xs sm:text-sm py-2.5 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Social Icons (Left) */}
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-emerald-400 font-medium tracking-wide text-xs uppercase">Follow Us:</span>
            <div className="flex space-x-4">
              <a href="#" aria-label="Facebook" className="hover:text-orange-400 transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-orange-400 transition-colors duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="hover:text-orange-400 transition-colors duration-300">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Info (Right) */}
          <div className="flex w-full md:w-auto justify-between md:justify-end md:space-x-8">
            <a href="tel:+918894486066" className="flex items-center hover:text-emerald-200 transition">
              <Phone className="w-3.5 h-3.5 mr-2 text-orange-500" /> 
              <span className="font-medium">+91 8894486066</span>
            </a>
            <a href="mailto:ecovigyan@gmail.com" className="flex items-center hover:text-emerald-200 transition">
              <Mail className="w-3.5 h-3.5 mr-2 text-orange-500" /> 
              <span className="font-medium">ecovigyan@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* --- MAIN NAVIGATION BAR --- */}
      <nav 
        className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
          scrolled 
            ? "bg-white/90 backdrop-blur-md shadow-lg border-stone-200 py-2" 
            : "bg-white border-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <a href="/" className="group flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-800 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/30 transition-all duration-300 group-hover:scale-105">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-800 leading-none tracking-tight">
                  Eco Vigyan <span className="text-orange-600">Foundation</span>
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-semibold">
                  Eco Club NGO
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                className="relative group py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                onClick={(event) => handleNavClick(event, link)}
                >
                  {link.name}
                  {/* Badge for 'New' items */}
                  {link.isNew && (
                    <span className="absolute -top-1 -right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                  {/* Animated Underline */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}

              {/* Donate Button */}
              <a
                href="/donate"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-sm rounded-full shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Donate Now <Heart className="w-4 h-4 ml-2 fill-white/20 group-hover:fill-white transition-all" />
                </span>
                {/* Hover Shine Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 hover:text-emerald-600 transition-colors p-2"
              >
                {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-full left-0 w-full bg-white border-t border-stone-100 shadow-xl transition-all duration-300 ease-in-out origin-top ${
            isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 h-0"
          }`}
        >
          <div className="px-4 py-6 space-y-4 flex flex-col items-center">
            {navLinks.map((link) => (
               <a
               key={link.name}
               href={link.path}
               className="text-lg font-medium text-slate-700 hover:text-emerald-700 w-full text-center py-2 hover:bg-stone-50 rounded-lg transition"
             onClick={(event) => {
               handleNavClick(event, link);
               setIsOpen(false);
             }}
             >
               {link.name}
             </a>
            ))}
            <a
              href="/donate"
              className="w-full text-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md active:scale-95 transition"
              onClick={() => setIsOpen(false)}
            >
              Donate Now
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}