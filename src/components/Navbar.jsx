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
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
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
    { name: "Join Us", path: "/join-us" },
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
                    <button
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
                    </button>

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
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <AnimatePresence mode="wait">
                      {isOpen ? (
                        <motion.div
                          key="close"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <X className="w-7 h-7" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="menu"
                          initial={{ rotate: 90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: -90, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Menu className="w-7 h-7" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </div>
            </div>

            {/* Mobile Menu - Beautiful slide down */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="md:hidden absolute top-full left-0 w-full bg-white border-t shadow-2xl"
                  initial={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, height: "auto", filter: "blur(0px)" }}
                  exit={{ opacity: 0, height: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-4 py-6 space-y-4 flex flex-col items-center">
                    {/* Home Link */}
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="w-full"
                    >
                      <Link
                        href="/"
                        className="text-lg font-medium text-slate-700 w-full text-center py-2 hover:text-emerald-600 transition-colors block"
                        onClick={() => setIsOpen(false)}
                      >
                        Home
                      </Link>
                    </motion.div>
                    {navLinks.map((link, idx) => (
                      <motion.div
                        key={link.name}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.15 + idx * 0.08 }}
                        className="w-full"
                      >
                        <Link
                          href={link.path}
                          className="text-lg font-medium text-slate-700 w-full text-center py-2 block hover:text-emerald-600 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.name}
                        </Link>
                      </motion.div>
                    ))}
                    <motion.div 
                      className="w-full text-center pt-2 border-t border-stone-100"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <p className="text-sm uppercase text-slate-400 my-2 font-semibold">
                        Our Programs
                      </p>
                      {programLinks.map((item, idx) => (
                        <motion.div
                          key={item.name}
                          initial={{ x: -40, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.35 + idx * 0.06 }}
                        >
                          <Link
                            href={item.path}
                            className="block py-2 text-slate-700 hover:text-emerald-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Mobile User Profile or Login */}
                    {user ? (
                      <motion.div 
                        className="w-full space-y-3 border-t border-stone-200 pt-4 mt-4"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Link
                          href={`/user/${user.id || user._id?.toString() || user._id}`}
                          className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0">
                            {user.dp?.url ? (
                              <img
                                src={user.dp.url}
                                alt={user.name || "User"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </Link>
                        <div className="w-full flex flex-col gap-2">
                          <Link
                            href="/my-submissions"
                            className="w-full text-center px-6 py-3 border border-emerald-600 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition"
                            onClick={() => setIsOpen(false)}
                          >
                            My Submissions
                          </Link>
                          <Link
                            href="/account"
                            className="w-full text-center px-6 py-3 border border-emerald-600 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition"
                            onClick={() => setIsOpen(false)}
                          >
                            Account Settings
                          </Link>
                          {user.role === "admin" && (
                            <Link
                              href="/admin/mushrooms"
                              className="w-full text-center px-6 py-3 border border-emerald-600 text-emerald-700 font-bold rounded-lg hover:bg-emerald-50 transition"
                              onClick={() => setIsOpen(false)}
                            >
                              Admin Panel
                            </Link>
                          )}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className="w-full text-center px-6 py-3 border border-red-600 text-red-600 font-bold rounded-lg hover:bg-red-50 transition"
                          >
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ x: -40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="w-full"
                      >
                        <Link
                          href="/login"
                          className="w-full text-center px-6 py-3 border border-emerald-600 text-emerald-700 font-bold rounded-lg block hover:bg-emerald-50 transition"
                          onClick={() => setIsOpen(false)}
                        >
                          Member Login
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ y: 30, opacity: 0, scale: 0.9 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", stiffness: 150 }}
                      className="w-full"
                    >
                      <Link
                        href="/donate"
                        className="w-full text-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold rounded-lg block shadow-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        Donate Now ❤️
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </>
      )}
    </>
  );
}
