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

          {/* --- MAIN NAVBAR (NOT STICKY, FIXED HEIGHT) --- */}
          <motion.nav 
            className="relative z-[200] w-full bg-white border-b border-stone-200 py-4 shadow-sm"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center">
                {/* Logo - slides from left */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href="/"
                    className="group flex items-center space-x-2 shrink-0"
                  >
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
                </motion.div>

                {/* Desktop Menu - slides from left */}
                <div className="hidden md:flex flex-1 justify-end items-center space-x-8">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: 0.1, 
                        ease: [0.22, 1, 0.36, 1] 
                      }}
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
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                      </Link>
                    </motion.div>
                  ))}

                  {/* Programs Dropdown */}
                  <motion.div
                    className="relative font-bold"
                    ref={dropdownRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
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

                    <AnimatePresence>
                      {isProgramsOpen && (
                        <motion.div
                          className="absolute top-full left-1/2 mt-3 w-48 bg-white rounded-xl shadow-2xl border -translate-x-1/2 overflow-hidden"
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {programLinks.map((item, idx) => (
                            <motion.div
                              key={item.name}
                              initial={{ x: 30, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ duration: 0.25, delay: idx * 0.04 }}
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

                  {/* User Profile or Login */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {user ? (
                      <div className="relative" ref={userMenuRef}>
                        <button
                          onClick={() => setUserMenuOpen(!userMenuOpen)}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
                        </button>

                        {/* User Dropdown Menu */}
                        <AnimatePresence>
                          {userMenuOpen && (
                            <motion.div 
                              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden z-50"
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
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
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all group-hover:w-full"></span>
                      </Link>
                    )}
                  </motion.div>

                  {/* Donate - slides from left */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: 0.1, 
                      ease: [0.22, 1, 0.36, 1] 
                    }}
                  >
                    <Link
                      href="/donate"
                      className="group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white font-bold text-sm rounded-full shadow-lg hover:-translate-y-0.5 transition"
                    >
                      Donate Now
                      {/* The Heart Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 transition-colors duration-300 fill-transparent stroke-white group-hover:fill-white"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>

                {/* Mobile Toggle */}
                <motion.div 
                  className="md:hidden"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <button onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? (
                      <X className="w-7 h-7" />
                    ) : (
                      <Menu className="w-7 h-7" />
                    )}
                  </button>
                </motion.div>
              </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="md:hidden absolute top-full left-0 w-full bg-white border-t shadow-lg"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-4 py-6 space-y-4 flex flex-col items-center">
                    {/* Home Link - Always visible */}
                    <motion.div
                      initial={{ x: -40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
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
                        initial={{ x: idx % 2 === 0 ? -40 : 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 + idx * 0.05 }}
                        className="w-full"
                      >
                        <Link
                          href={link.path}
                          className="text-lg font-medium text-slate-700 w-full text-center py-2 block"
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
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-sm uppercase text-slate-400 my-2 font-semibold">
                        Our Programs
                      </p>
                      {programLinks.map((item, idx) => (
                        <motion.div
                          key={item.name}
                          initial={{ x: idx % 2 === 0 ? 40 : -40, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.25, delay: 0.25 + idx * 0.04 }}
                        >
                          <Link
                            href={item.path}
                            className="block py-2 text-slate-700"
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
                        transition={{ delay: 0.4 }}
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
                        transition={{ delay: 0.4 }}
                        className="w-full"
                      >
                        <Link
                          href="/login"
                          className="w-full text-center px-6 py-3 border border-emerald-600 text-emerald-700 font-bold rounded-lg block"
                          onClick={() => setIsOpen(false)}
                        >
                          Member Login
                        </Link>
                      </motion.div>
                    )}
                    <motion.div
                      initial={{ x: 40, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                      className="w-full"
                    >
                      <Link
                        href="/donate"
                        className="w-full text-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg block"
                        onClick={() => setIsOpen(false)}
                      >
                        Donate Now
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
