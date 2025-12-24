"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Menu,
  X,
  Heart,
  ChevronDown,
  LogIn,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const leaveTimeoutRef = useRef(null);

  const handleNavClick = useCallback((event, link) => {
    if (!link.path.startsWith("/#")) return;
    const hash = link.path.split("#")[1];
    if (!hash) return;
    if (window.location.pathname === "/") {
      event.preventDefault();
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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
            <span className="text-emerald-400 font-medium tracking-wide text-xs uppercase">
              Follow Us:
            </span>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-emerald-400 transition">
                <Facebook className="w-4 h-4" />
              </Link>
              <Link href="#" className="hover:text-emerald-400 transition">
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

      {/* --- MAIN NAVBAR (NOT STICKY, FIXED HEIGHT) --- */}
      <nav className="relative z-[200] w-full bg-white border-b border-stone-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="group flex items-center space-x-2 shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg group-hover:scale-105 transition-transform bg-white">
                <img
                  src="/gallery/logo4.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">
                Eco Vigyan Foundation
              </span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={(e) => handleNavClick(e, link)}
                  className="relative group py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 transition"
                >
                  {link.name}
                  {link.isNew && (
                    <span className="absolute -top-1 -right-3 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                </Link>
              ))}

              {/* Programs Dropdown */}
              <div
                className="relative font-bold"
                ref={dropdownRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setIsProgramsOpen((p) => !p)}
                  className="flex items-center gap-1 py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 group cursor-pointer"
                >
                  Our Programs
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isProgramsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute top-full left-1/2 mt-3 w-48 bg-white rounded-xl shadow-2xl border transform -translate-x-1/2 transition-all origin-top ${
                    isProgramsOpen
                      ? "opacity-100 scale-y-100"
                      : "opacity-0 scale-y-0 pointer-events-none"
                  }`}
                >
                  {programLinks.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setIsProgramsOpen(false)}
                      className="block px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 rounded-xl mx-1 my-1"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Login */}
              <Link href="/login" className="flex items-center gap-2 font-bold text-sm text-slate-600 hover:text-emerald-700 group">
                <LogIn className="w-4 h-4" />
                Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
              </Link>

              {/* Donate */}
              <Link
                href="/donate"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm rounded-full shadow-lg hover:-translate-y-0.5 transition"
              >
                Donate Now <Heart className="inline w-4 h-4 ml-2 fill-white/20" />
              </Link>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden bg-white border-t transition-all ${isOpen ? "block" : "hidden"}`}>
          <div className="px-4 py-6 space-y-4 text-center">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.path} onClick={() => setIsOpen(false)} className="block text-lg">
                {link.name}
              </Link>
            ))}
            <Link href="/login" onClick={() => setIsOpen(false)} className="block font-bold text-emerald-700">
              Member Login
            </Link>
            <Link href="/donate" onClick={() => setIsOpen(false)} className="block bg-emerald-600 text-white py-3 rounded-lg">
              Donate Now
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
