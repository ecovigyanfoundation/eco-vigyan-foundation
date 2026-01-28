"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

import {
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  X,
  Heart,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  Settings,
  Navigation,
  Info,
  Layers,
  Trophy,
  Grid,
  FileText,
  Home,
} from "lucide-react";
import { createPortal } from "react-dom";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const leaveTimeoutRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hideNavbar = pathname.startsWith("/explore");

  // Handle logout
  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
  };

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
    { name: "Mushroom Mania", path: "/explore", isNew: true },
    // { name: "Join Us", path: "/join-us" },
  ];

  const programLinks = [
    { name: "Eco-Art Gallery", path: "/gallery" },
    { name: "Articles", path: "/articles" },
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
      {!hideNavbar && (
        <>
          {/* --- TOP UTILITY BAR --- */}
          {pathname === "/" && (
            <motion.div 
              className="bg-emerald-950 text-emerald-50 text-xs sm:text-sm py-2.5 relative z-50"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                <motion.div 
                  className="hidden md:flex items-center space-x-6"
                  initial={{ x: -60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-emerald-400 font-medium tracking-wide text-xs uppercase">
                    Follow Us:
                  </span>
                  <div className="flex space-x-4">
                    <Link
                      href="https://www.facebook.com/people/Eco-Vigyan-Foundation/100090610935292/?rdid=qQ3Ik930QW0SHoiR&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BcJ2mxyDF%2F"
                      className="hover:text-emerald-400 transition hover:scale-110"
                    >
                      <Facebook className="w-4 h-4" />
                    </Link>
                    <Link
                      href="https://www.instagram.com/ecovigyan/?igsh=MXdpdWFhbDd5amg4dQ%3D%3D#"
                      className="hover:text-emerald-400 transition hover:scale-110"
                    >
                      <Instagram className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex w-full md:w-auto justify-between md:justify-end md:space-x-8"
                  initial={{ x: 60, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href="tel:+918894486066"
                    className="flex items-center hover:text-emerald-200 transition"
                  >
                    <Phone className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    <span className="font-medium">+91 8894486066</span>
                  </Link>
                  <Link
                    href="mailto:ecovigyan@gmail.com"
                    className="flex items-center hover:text-emerald-200 transition"
                  >
                    <Mail className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                    <span className="font-medium">ecovigyan@gmail.com</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* --- MAIN NAVBAR WITH PREMIUM ANIMATIONS --- */}
          <motion.nav 
            className="relative z-[200] w-full bg-white border-b border-stone-200 py-4 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Animated background shimmer container */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-50/0 via-emerald-50/50 to-emerald-50/0"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
              />
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="flex justify-between items-center">
                {/* Logo - Spectacular entrance */}
                <motion.div
                  initial={{ x: -150, opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                  animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                >
                  <Link
                    href="/"
                    className="group flex items-center space-x-2 shrink-0"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-white"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <img
                        src="/gallery/logo4.png"
                        alt="Logo"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                    <motion.span 
                      className="text-2xl font-extrabold text-emerald-700 tracking-tight"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Eco Vigyan Foundation
                    </motion.span>
                  </Link>
                </motion.div>

                {/* Desktop Menu - Wave cascade from left */}
                <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ x: -80, opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                      animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.2 + index * 0.1,
                        type: "spring",
                        stiffness: 120,
                        damping: 14
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      <Link
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
                        <motion.span 
                          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    </motion.div>
                  ))}

                  {/* Programs Dropdown - Wave cascade continues */}
                  <motion.div
                    className="relative font-bold"
                    ref={dropdownRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    initial={{ x: -80, opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                    animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.4,
                      type: "spring",
                      stiffness: 120,
                      damping: 14
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    {/* <button
                      onClick={() => setIsProgramsOpen((p) => !p)}
                      className="flex items-center gap-1 py-2 text-sm font-bold text-slate-600 hover:text-emerald-700 group cursor-pointer"
                    >
                      Our Programs
                      <motion.div
                        animate={{ rotate: isProgramsOpen ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button> */}

                    <AnimatePresence>
                      {isProgramsOpen && (
                        <motion.div
                          className="absolute top-full left-1/2 mt-3 w-48 bg-white rounded-xl shadow-2xl border -translate-x-1/2 overflow-hidden z-[300]"
                          initial={{ opacity: 0, y: -15, scale: 0.9, filter: "blur(4px)" }}
                          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {programLinks.map((item, idx) => (
                            <motion.div
                              key={item.name}
                              initial={{ x: -30, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.2, delay: idx * 0.05 }}
                            >
                              <Link
                                href={item.path}
                                onClick={() => setIsProgramsOpen(false)}
                                className="block px-5 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                              >
                                {item.name}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* User Profile or Login - Wave continues */}
                  <motion.div
                    initial={{ x: -80, opacity: 0, scale: 0.9, filter: "blur(8px)" }}
                    animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.5,
                      type: "spring",
                      stiffness: 120,
                      damping: 14
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {user ? (
                      <div className="relative" ref={userMenuRef}>
                        <motion.button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-600 shadow-md">
                            {user.dp?.url ? (
                              <img
                                src={user.dp.url}
                                alt={user.name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </div>
                        </motion.button>

                        {/* User Dropdown Menu */}
                        <AnimatePresence>
                          {userMenuOpen && (
                            <motion.div 
                              className="absolute -right-20 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-[300]"
                              initial={{ opacity: 0, y: -15, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Link
                                href={`/user/${user.id || user._id?.toString() || user._id}`}
                                onClick={() => setUserMenuOpen(false)}
                                className="px-4 py-3 border-b border-stone-100 hover:bg-stone-50 transition-colors block"
                              >
                                <p className="text-sm font-bold text-slate-800">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {user.email}
                                </p>
                                {user.role && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-full">
                                    {user.role.charAt(0).toUpperCase() +
                                      user.role.slice(1)}
                                  </span>
                                )}
                              </Link>
                              <div className="py-1">
                                <Link
                                  href="/my-submissions"
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <User className="w-4 h-4" />
                                  My Submissions
                                </Link>
                                <Link
                                  href="/account"
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                                  onClick={() => setUserMenuOpen(false)}
                                >
                                  <Settings className="w-4 h-4" />
                                  Account Settings
                                </Link>
                                {user.role === "admin" && (
                                  <Link
                                    href="/admin/mushrooms"
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition"
                                    onClick={() => setUserMenuOpen(false)}
                                  >
                                    <User className="w-4 h-4" />
                                    Admin Panel
                                  </Link>
                                )}
                                <button
                                  onClick={handleLogout}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Logout
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href="/login"
                        className="flex items-center gap-2 font-bold text-sm text-slate-600 hover:text-emerald-700 group relative"
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                        <motion.span 
                          className="absolute bottom-0 left-0 h-0.5 bg-emerald-600"
                          initial={{ width: 0 }}
                          whileHover={{ width: "100%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </Link>
                    )}
                  </motion.div>

                  {/* Donate Button - Grand finale with glow */}
                  <motion.div
                    initial={{ x: -100, opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    animate={{ x: 0, opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ 
                      duration: 0.7, 
                      delay: 0.6,
                      type: "spring",
                      stiffness: 100,
                      damping: 12
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.08, y: -3 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full blur-lg opacity-0"
                        whileHover={{ opacity: 0.5 }}
                        transition={{ duration: 0.3 }}
                      />
                      <Link
                        href="/donate"
                        className="relative group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm rounded-full shadow-lg transition"
                      >
                        Donate Now
                        <motion.svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 fill-transparent stroke-white"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          whileHover={{ fill: "white", scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </motion.svg>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Mobile Toggle - Smooth entrance */}
                <motion.div 
                  className="md:hidden"
                  initial={{ x: -50, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.2,
                    type: "spring",
                    stiffness: 150
                  }}
                >
                  <motion.button 
                    onClick={() => setShowSidebar(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    <Menu className="w-7 h-7" />
                  </motion.button>
                </motion.div>
              </div>
            </div>


            {/* SIDEBAR NAVIGATION PORTAL */}
            {mounted && createPortal(
              <div className={`fixed inset-0 z-[99999] ${showSidebar ? "pointer-events-auto" : "pointer-events-none"}`}>
                {/* BACKDROP */}
                <div 
                  className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${showSidebar ? "opacity-100" : "opacity-0"}`}
                  onClick={() => setShowSidebar(false)}
                />

                {/* DRAWER - RIGHT SIDE */}
                <div
                  className={`absolute right-0 top-0 h-[100dvh] bg-white/95 backdrop-blur-md border-l border-emerald-100 shadow-2xl transition-transform duration-300 ease-in-out w-72 flex flex-col ${
                    showSidebar ? "translate-x-0" : "translate-x-full"
                  }`}
                >
                  {/* HEADER */}
                  <div className="p-6 border-b border-emerald-100 flex justify-between items-center bg-emerald-50/50 shrink-0">
                    <h2 className="text-lg font-black text-emerald-950 uppercase tracking-widest">
                      Navigation
                    </h2>
                    <button 
                      onClick={() => setShowSidebar(false)}
                      className="p-2 rounded-full bg-white border border-emerald-100 text-emerald-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm active:scale-95 z-50 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* MENU LINKS */}
                  <nav className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-1">
                    {/* MAIN PAGES */}
                    <div className="mb-6">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-3">
                        Main Pages
                      </p>
                      <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                        <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Home size={18} /></span></div>
                        <span>Home</span>
                      </Link>
                      <Link
                        href="/#about"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Info size={18} /></span></div>
                        <span>About</span>
                      </Link>
                      <Link
                        href="/explore"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Navigation size={18} /></span></div>
                        <span>Explore</span>
                      </Link>
                      {/* <Link
                        href="/join-us"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><User size={18} /></span></div>
                        <span>Join Us</span>
                      </Link> */}
                    </div>

                    {/* PROGRAMS */}
                    {/* <div className="mb-6">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-3">
                        Programs
                      </p>
                      <Link
                        href="/articles"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Layers size={18} /></span></div>
                        <span>Articles</span>
                      </Link>
                      <Link
                        href="/gallery"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Trophy size={18} /></span></div>
                        <span>Eco-Art Gallery</span>
                      </Link>
                      <Link
                        href="/programs"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Grid size={18} /></span></div>
                        <span>Programs</span>
                      </Link>
                      <Link
                        href="/reports"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><FileText size={18} /></span></div>
                        <span>Reports</span>
                      </Link>
                      <Link
                        href="/contact"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                        onClick={() => setShowSidebar(false)}
                      >
                          <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Mail size={18} /></span></div>
                        <span>Contact Us</span>
                      </Link>
                    </div> */}

                    {/* USER PAGES */}
                    {user ? (
                      <div className="mb-6">
                        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-3">
                          My Account
                        </p>
                        
                        {/* Profile Summary */}
                        <div className="mx-3 mb-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden shrink-0">
                            {user.dp?.url ? (
                              <img src={user.dp.url} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} className="text-emerald-700" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-emerald-950 truncate">
                              Hi, {user.name?.split(" ")[0]}
                            </p>
                            <p className="text-xs text-emerald-600 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>

                        <Link
                          href="/my-submissions"
                          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                          onClick={() => setShowSidebar(false)}
                        >
                            <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><User size={18} /></span></div>
                          <span>My Submissions</span>
                        </Link>
                        {user.role === "admin" && (
                          <Link
                            href="/admin/mushrooms"
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700 transition-all group"
                            onClick={() => setShowSidebar(false)}
                          >
                              <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-emerald-500 group-hover:text-emerald-600"><span className="lucide-icon"><Settings size={18} /></span></div>
                            <span>Admin Panel</span>
                          </Link>
                        )}
                        
                        {/* Logout Button */}
                         <button
                          onClick={() => {
                            handleLogout();
                            setShowSidebar(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-400 hover:bg-red-50 hover:text-red-600 transition-all group mt-1"
                        >
                           <div className="p-2 bg-red-50 rounded-lg group-hover:bg-white group-hover:scale-110 transition-all shadow-sm text-red-400 group-hover:text-red-500"><span className="lucide-icon"><LogOut size={18} /></span></div>
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                       <div className="mb-6 px-3">
                          <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 px-1">
                            Account
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <Link
                              href="/login"
                              className="flex items-center justify-center py-2.5 rounded-xl border border-emerald-200 text-emerald-700 font-bold hover:bg-emerald-50 transition text-sm"
                              onClick={() => setShowSidebar(false)}
                            >
                              Login
                            </Link>
                            <Link
                              href="/register"
                              className="flex items-center justify-center py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200 text-sm"
                              onClick={() => setShowSidebar(false)}
                            >
                              Register
                            </Link>
                          </div>
                       </div>
                    )}
                  </nav>

                  {/* FOOTER */}
                  <div className="p-4 border-t border-emerald-100 bg-emerald-50/30 shrink-0">
                    <Link
                      href="/donate"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 active:to-emerald-700 text-white font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95"
                      onClick={() => setShowSidebar(false)}
                    >
                      <span className="lucide-icon"><Heart size={16} fill="currentColor" /></span>
                      <span>Donate Now</span>
                    </Link>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </motion.nav>
        </>
      )}
    </>
  );
}
