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
  Settings,
  Menu,
  X,
  Loader2,
  Home,
  Info,
  FileText,
  Image,
  Calendar,
  FileCheck,
  Mail,
  Heart,
  Users,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { getCityBoundary } from "@/lib/geocoding";

export default function ExploreHeader({
  view,
  setView,
  onAddClick,
  onMobileSearchClick,
  onFilterToggle,
  onResetFilters,
  selectedFilters = {},
  onZonesClick,
  onTrailsClick,
  onSpeciesSearch,
  onLocationSearch,
  allData = [],
  onManualSearch,
  onManualLocationSearch,
}) {
  const { user, logout } = useAuth();



  return (
    <header className="z-40 bg-white border-b border-emerald-100 shrink-0 sticky top-0">
      {/* SINGLE ROW: TAB NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Tab Navigation */}
        <div className="flex items-center overflow-x-auto no-scrollbar flex-1 min-w-0">
          <div className="bg-emerald-50 p-1 rounded-2xl flex gap-1 w-full md:w-fit">
            {[
              { id: "map", label: "Explore", icon: MapIcon },
              { id: "grid", label: "Gallery", icon: Grid },
              { id: "leaderboard", label: "Leaders", icon: Trophy },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  view === tab.id
                    ? "bg-white text-emerald-950 shadow-md"
                    : "text-emerald-600 hover:text-emerald-950"
                }`}
              >
                <tab.icon size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
            
            {/* Add Observation as Tab */}
            {user && (
              <button
                onClick={onAddClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all whitespace-nowrap shadow-md"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span className="hidden sm:inline">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!user ? (
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all"
            >
              Login
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={onTrailsClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Navigation size={16} strokeWidth={2.5} />
                <span className="hidden md:inline">Trails</span>
              </button>
              <button 
                onClick={onZonesClick}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Layers size={16} strokeWidth={2.5} />
                <span className="hidden md:inline">Zones</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}









