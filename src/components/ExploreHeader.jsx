"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Map as MapIcon,
  Plus,
  Trophy,
  Grid,
  Navigation,
  Layers,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ExploreHeader({
  view,
  setView,
  onAddClick,
  onMobileSearchClick,
}) {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="z-[100] bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shrink-0 sticky top-0">
      {/* TOP ROW: BRANDING, SEARCH, ACTIONS */}
      <div className="border-b border-emerald-50/50">
        <div className="max-w-7xl mx-auto min-h-[90px] px-6 lg:px-10 py-4 flex items-center justify-between gap-8">
          {/* LEFT: BRANDING */}
          <a
            href="/"
            className="flex items-center gap-5 shrink-0 hover:opacity-90 transition-opacity group"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center transition-transform group-hover:scale-105">
              <img
                src="/icons/icon2.png"
                alt="Mushroom Mania Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-2xl font-black text-emerald-950 leading-none uppercase tracking-tighter">
                Mushroom <span className="text-emerald-500">Mania</span>
              </h2>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-700/60 font-black uppercase tracking-[0.25em]">
                <span className="text-emerald-500 italic lowercase font-medium text-[12px] tracking-normal">
                  An initiative of
                </span>
                Eco Vigyan
              </div>
            </div>
          </a>

          {/* CENTER: GREEN-TINTED SEARCH BAR */}
          <div className="hidden md:flex flex-1 max-w-lg lg:max-w-xl items-center bg-emerald-50/60 rounded-2xl border border-emerald-100/50 overflow-hidden px-5 gap-3 focus-within:bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all duration-300">
            <Search size={20} className="text-emerald-400 shrink-0" />
            <input
              placeholder="Search Species..."
              className="bg-transparent flex-1 py-4 text-sm outline-none text-emerald-900 placeholder:text-emerald-300 font-medium min-w-0"
            />
            <div className="w-px h-6 bg-emerald-200 mx-1 shrink-0" />
            <MapPin size={20} className="text-emerald-400 shrink-0" />
            <input
              placeholder="Location..."
              className="bg-transparent flex-1 py-4 text-sm outline-none text-emerald-900 placeholder:text-emerald-300 font-medium min-w-0"
            />
          </div>

          {/* RIGHT: NAVIGATION & ACTIONS */}
          <div className="flex items-center gap-6 lg:gap-8 shrink-0">
            <Link
              href="/"
              className="hidden lg:block text-[12px] font-black uppercase tracking-[0.2em] text-emerald-900 hover:text-emerald-500 transition-colors"
            >
              Home
            </Link>

            {!user ? (
              <Link
                href="/login"
                className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-800/40 hover:text-emerald-600 transition-colors"
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-5">
                {/* USER PROFILE */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center justify-center w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shadow-lg shadow-emerald-100 hover:ring-4 hover:ring-emerald-100 transition-all"
                  >
                    {user.dp?.url ? (
                      <img
                        src={user.dp.url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-6 py-5 border-b border-emerald-50 bg-emerald-50/30">
                        <p className="text-sm font-black text-emerald-950 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs font-medium text-emerald-600/70 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-6 py-4 text-sm font-black text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* ADD OBSERVATION BUTTON */}
                <button
                  onClick={onAddClick}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black text-[11px] flex items-center gap-3 shadow-xl shadow-emerald-200/60 transition-all active:scale-95 uppercase tracking-widest"
                >
                  <Plus size={20} strokeWidth={3} />
                  <span className="hidden xl:inline">Add Observation</span>
                </button>

                {/* ADMIN LINK */}
                {user?.role === "admin" && (
                  <Link
                    href="/admin/mushrooms"
                    className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-4 rounded-2xl font-black text-[11px] flex items-center gap-3 shadow-xl transition-all active:scale-95 uppercase tracking-widest"
                  >
                    <User size={18} strokeWidth={3} />
                    <span className="hidden xl:inline">Admin</span>
                  </Link>
                )}
              </div>
            )}

            {/* MOBILE SEARCH ICON */}
            <button
              onClick={onMobileSearchClick}
              className="md:hidden p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 active:bg-emerald-100 transition-colors"
            >
              <Search size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* SECOND ROW: GREENISH TAB NAVIGATION */}
      <div className="bg-emerald-50/20">
        <div className="max-w-7xl mx-auto h-16 px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center h-full overflow-x-auto no-scrollbar">
            <nav className="flex h-full gap-10 lg:gap-14">
              {[
                { id: "map", label: "Explore Map", icon: MapIcon },
                { id: "grid", label: "Observations", icon: Grid },
                {
                  id: "leaderboard",
                  label: "Top Contributors",
                  icon: Trophy,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setView(tab.id)}
                  className={`flex items-center gap-3.5 h-full transition-all text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-4 ${
                    view === tab.id
                      ? "text-emerald-700 border-emerald-500"
                      : "text-emerald-900/40 hover:text-emerald-700 border-transparent"
                  }`}
                >
                  <tab.icon
                    size={20}
                    className={
                      view === tab.id ? "text-emerald-500" : "text-emerald-300"
                    }
                  />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* SECONDARY ACTION BUTTONS */}
          <div className="hidden sm:flex items-center gap-4 ml-10">
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-100/50">
              <Navigation size={14} /> Trails
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-emerald-100 text-[10px] font-black uppercase tracking-widest text-emerald-700 hover:bg-emerald-500 hover:text-white transition-all shadow-sm shadow-emerald-100/50">
              <Layers size={14} /> Zones
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

