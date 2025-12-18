"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Twitter,
  Menu,
  X,
  Heart,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // --- Dropdown States/Refs ---
  const [knowMoreOpen, setKnowMoreOpen] = useState(false);
  const dropdownRef = useRef(null);
  const leaveTimeoutRef = useRef(null); 

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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/#about" },
    { name: "Explore", path: "/map", isNew: true },
  ];

  const knowMoreLinks = [
    { name: "Articles", path: "/articles" },
    { name: "Programs", path: "/programs" },
    { name: "Reports", path: "/reports" },
    { name: "Gallery", path: "/gallery" },
    { name: "Join Us", path: "/join-us" },
    { name: "Contact Us", path: "/contact" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth >= 768 && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setKnowMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }
    };
  }, []);

  const handleMouseEnter = () => {
      if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current); 
      }
      if (window.innerWidth >= 768) { 
          setKnowMoreOpen(true);
      }
  };

  const handleMouseLeave = () => {
      if (window.innerWidth >= 768) { 
          leaveTimeoutRef.current = setTimeout(() => {
              setKnowMoreOpen(false);
          }, 200); 
      }
  };

  return (
    <>
      {/* --- TOP UTILITY BAR --- */}
      <div className="bg-emerald-950 text-emerald-50 text-xs sm:text-sm py-2.5 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* Social Icons (Left) */}
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-emerald-400 font-medium tracking-wide text-xs uppercase">
              Follow Us:
            </span>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-emerald-400 transition-colors duration-300"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-emerald-400 transition-colors duration-300"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Contact Info (Right) */}
          <div className="flex w-full md:w-auto justify-between md:justify-end md:space-x-8">
            <a
              href="tel:+918894486066"
              className="flex items-center hover:text-emerald-200 transition"
            >
              <Phone className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              <span className="font-medium">+91 8894486066</span>
            </a>
            <a
              href="mailto:ecovigyan@gmail.com"
              className="flex items-center hover:text-emerald-200 transition"
            >
              <Mail className="w-3.5 h-3.5 mr-2 text-emerald-500" />
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
              <div className="w-12 h-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300 group-hover:scale-105 bg-white">
                <img
                  src="/gallery/logo4.png"
                  alt="Eco Vigyan Foundation Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-extrabold text-emerald-700 leading-none tracking-tight">
                  Eco Vigyan <span className="text-emerald-700">Foundation</span>
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
                  {link.isNew && (
                    <span className="absolute -top-1 -right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  {/* Underline color changed to emerald */}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}

              {/* KNOW MORE DROPDOWN */}
              <div 
                  className="relative font-bold" 
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setKnowMoreOpen((p) => !p)}
                  className="flex items-center gap-1 py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 cursor-pointer focus:outline-none relative group"
                >
                  Know More
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      knowMoreOpen ? "rotate-180 text-emerald-700" : ""
                    }`}
                  />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </button>

                <div
                  className={`absolute top-full right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 transform transition-all duration-300 origin-top ${
                    knowMoreOpen
                      ? "opacity-100 scale-y-100 translate-y-0"
                      : "opacity-0 scale-y-0 -translate-y-2 pointer-events-none"
                  }`}
                >
                    {knowMoreLinks.map((item) => (
                      <a
                        key={item.name}
                        href={item.path}
                        className="block px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-colors rounded-xl mx-1 my-1"
                        onClick={() => setKnowMoreOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                </div>
              </div>

              {/* Donate Button: Gradient changed to emerald/green */}
              <a
                href="/donate"
                className="group relative px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Donate Now{" "}
                  <Heart className="w-4 h-4 ml-2 fill-white/20 group-hover:fill-white transition-all" />
                </span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700" />
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-600 hover:text-emerald-600 transition-colors p-2"
              >
                {isOpen ? (
                  <X className="w-7 h-7" />
                ) : (
                  <Menu className="w-7 h-7" />
                )}
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

            <div className="w-full text-center pt-2 border-t border-stone-100">
                <p className="text-sm uppercase text-slate-400 my-2 font-semibold">
                    Know More
                </p>
                {knowMoreLinks.map((item) => (
                    <a
                        key={item.name}
                        href={item.path}
                        className="block py-2 text-slate-700 hover:text-emerald-700 hover:bg-stone-50 rounded-lg transition"
                        onClick={() => setIsOpen(false)}
                    >
                        {item.name}
                    </a>
                ))}
            </div>
            
            <a
              href="/donate"
              className="w-full text-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg shadow-md active:scale-95 transition"
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