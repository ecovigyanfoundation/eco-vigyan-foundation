"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link"; // Import Link from Next.js
import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const leaveTimeoutRef = useRef(null);

  const handleNavClick = useCallback((event, link) => {
    // Only intercept for hash links on the same page
    if (!link.path.startsWith("/#")) return;

    const hash = link.path.split("#")[1];
    if (!hash) return;

    if (window.location.pathname === "/") {
      event.preventDefault();
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  const navLinks = [
    { name: "About", path: "/#about" },
    { name: "Explore", path: "/explore", isNew: true },
    { name: "Join Us", path: "/join-us" },

  ];

  const programLinks = [
    { name: "Articles", path: "/articles" },
    { name: "Eco-Art Gallery", path: "/gallery" },
    { name: "Programs", path: "/programs" },
    { name: "Reports", path: "/reports" },
    { name: "Contact Us", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ... (handleMouseEnter, handleMouseLeave, handleClickOutside remain same)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth >= 768 && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsProgramsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    if (window.innerWidth >= 768) setIsProgramsOpen(true);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth >= 768) {
      leaveTimeoutRef.current = setTimeout(() => setIsProgramsOpen(false), 200);
    }
  };

  return (
    <>
      {/* --- TOP UTILITY BAR --- */}
      <div className="bg-emerald-950 text-emerald-50 text-xs sm:text-sm py-2.5 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-emerald-400 font-medium tracking-wide text-xs uppercase">Follow Us:</span>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-emerald-400 transition-colors duration-300">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="hover:text-emerald-400 transition-colors duration-300">
                <Instagram className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="flex w-full md:w-auto justify-between md:justify-end md:space-x-8">
            <Link href="tel:+918894486066" className="flex items-center hover:text-emerald-200 transition">
              <Phone className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              <span className="font-medium">+91 8894486066</span>
            </Link>
            <Link href="mailto:ecovigyan@gmail.com" className="flex items-center hover:text-emerald-200 transition">
              <Mail className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              <span className="font-medium">ecovigyan@gmail.com</span>
            </Link>
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
            {/* Logo Group */}
            <Link href="/" className="group flex items-center space-x-2 shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform bg-white">
                <img src="/gallery/logo4.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-extrabold text-emerald-700 leading-none tracking-tight">
                Eco Vigyan Foundation
              </span>
            </Link>

            {/* Desktop Navigation Wrapper */}
            {/* Added flex-1 and justify-end to push contents to the right */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  className="relative group py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                  onClick={(e) => handleNavClick(e, link)}
                >
                  {link.name}
                  {link.isNew && (
                    <span className="absolute -top-1 -right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}

              {/* OUR PROGRAMS DROPDOWN */}
              <div className="relative font-bold " ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <button
                  onClick={() => setIsProgramsOpen((p) => !p)}
                  className="flex cursor-pointer items-center gap-1 py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 focus:outline-none relative group"
                >
                  Our Programs
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isProgramsOpen ? "rotate-180" : ""}`} />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </button>

                <div className={`absolute top-full left-1/2 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-300 origin-top -translate-x-1/2 ${
                  isProgramsOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
                }`}>
                  {programLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      className="block px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-colors rounded-xl mx-1 my-1"
                      onClick={() => setIsProgramsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Donate Button: Now at the extreme right of the container */}
              <Link
                href="/donate"
                className="group relative px-6  py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm rounded-full shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Donate Now <Heart className="w-4 h-4 ml-2 fill-white/20 group-hover:fill-white" />
                </span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 p-2">
                {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu (Updated to use Link) */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-white border-t transition-all duration-300 origin-top ${isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 h-0"}`}>
          <div className="px-4 py-6 space-y-4 flex flex-col items-center">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} className="text-lg font-medium text-slate-700 w-full text-center py-2" onClick={() => setIsOpen(false)}>
                {link.name}
              </Link>
            ))}
            <div className="w-full text-center pt-2 border-t border-stone-100">
              <p className="text-sm uppercase text-slate-400 my-2 font-semibold">Our Programs</p>
              {programLinks.map((item) => (
                <Link key={item.name} href={item.path} className="block py-2 text-slate-700" onClick={() => setIsOpen(false)}>
                  {item.name}
                </Link>
              ))}
            </div>
            <Link href="/donate" className="w-full text-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg" onClick={() => setIsOpen(false)}>
              Donate Now
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}