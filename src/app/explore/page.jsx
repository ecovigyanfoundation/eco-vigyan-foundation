"use client";
import { motion } from "framer-motion";

import { useEffect, useRef, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import Link from "next/link";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import {
  X,
  Search,
  Map as MapIcon,
  Plus,
  Filter,
  Camera,
  Trophy,
  Grid,
  Navigation,
  Layers,
  Users,
  Info,
  MapPin,
  Utensils,
  FlaskConical,
  Skull,
  Leaf,
  Flame,
  Zap,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
const Map = dynamic(() => import("@/components/Map"), { ssr: false });
const LocationPickerMap = dynamic(() => import("@/components/LocationPickerMap"), { ssr: false });

/* ================= OPTIONS ================= */

const ECOLOGICAL_ROLES = ["decomposer", "symbiont", "parasite"];

const TEXTURES = [
  "soft-to-touch",
  "hard-to-touch",
  "jelly-like",
  "leathery",
];

const UNDERSIDES = [
  "gills",
  "pores",
  "teeth",
  "ball-with-no-distinctive-bottom",
  "cup-with-no-distinctive-bottom",
  "star-with-no-distinctive-bottom",
  "jelly-with-no-distinctive-bottom",
  "sponge-with-no-distinctive-bottom",
];

const FRUITING_SURFACES = ["ground", "leaf", "wood", "dung"];

const STEM_PRESENCE = ["has-stem", "has-no-stem"];

const COMMON_USES = [
  "edible",
  "inedible",
  "poisonous",
  "medicinal",
  "hallucinogenic",
  "other-uses",
  "mysterious",
];

/* ----------------------------------
    COMPONENT: DUAL ICON BADGE
    Shows the 'Use' Icon + 'Category' Text
---------------------------------- */
const MushroomBadge = ({ category, use, variant = "small" }) => {
  const getUseIcon = (useType) => {
    const iconSize = variant === "small" ? 12 : 16;
    switch (useType?.toLowerCase()) {
      case "culinary":
      case "edible":
        return <Utensils size={iconSize} className="text-emerald-400" />;
      case "medicinal":
        return <FlaskConical size={iconSize} className="text-blue-400" />;
      case "poisonous":
        return <Skull size={iconSize} className="text-red-500" />;
      case "research":
        return <Leaf size={iconSize} className="text-orange-400" />;
      case "fuel":
        return <Flame size={iconSize} className="text-yellow-500" />;
      default:
        return <Zap size={iconSize} className="text-purple-400" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full ${
        variant === "small" ? "px-2 py-0.5" : "px-4 py-2"
      }`}
    >
      {getUseIcon(use)}
      <span
        className={`font-black uppercase tracking-tighter text-white ${
          variant === "small" ? "text-[9px]" : "text-xs"
        }`}
      >
        {category}
      </span>
    </div>
  );
};

export default function MapPage() {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [data, setData] = useState([]);
  const [mode, setMode] = useState("category"); // Toggle b/w 'category' vs 'use'
  const [filters, setFilters] = useState({});
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [view, setView] = useState("map");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ species: "", place: "" });

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    use: "",
    latitude: "",
    longitude: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  // Optional classification fields
  const [commonName, setCommonName] = useState("");
  const [ecologicalRole, setEcologicalRole] = useState("");
  const [texture, setTexture] = useState("");
  const [underside, setUnderside] = useState("");
  const [fruitingSurface, setFruitingSurface] = useState("");
  const [stemPresence, setStemPresence] = useState("");
  const [commonUses, setCommonUses] = useState([]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
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
    setIsMounted(true);
    fetch("/api/mushrooms")
      .then((res) => res.json())
      .then((d) => {
        const mushrooms = d.mushrooms || [];
        // Transform data to match Map component expectations
        const transformedMushrooms = mushrooms.map((m) => ({
          ...m,
          latitude: m.location?.latitude || m.latitude,
          longitude: m.location?.longitude || m.longitude,
          name: m.commonName || m.name || "Unnamed Mushroom",
          image: m.images?.[0]?.url || m.image,
          contributor: m.submittedBy?.name || m.submittedBy?.username || m.contributor || "Anonymous",
          info: m.description || m.info || "",
          category: m.ecologicalRole || m.category || "Unknown",
          use: m.commonUses?.[0] || m.use || "",
        }));
        setData(transformedMushrooms);
        initializeFilters(transformedMushrooms, "category");
      })
      .catch(console.error);
  }, []);

  const initializeFilters = (dataset, filterMode) => {
    const f = {};
    dataset.forEach((item) => {
      // Use ecologicalRole for category mode, commonUses for use mode
      const key = filterMode === "category" 
        ? (item.ecologicalRole || item.category) 
        : (item.commonUses?.[0] || item.use);
      if (key) f[key] = true;
    });
    setFilters(f);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    initializeFilters(data, newMode);
  };

  const toggleFilter = (key) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col min-h-dvh w-screen bg-gray-950 overflow-x-hidden text-white ">
      {/* ================= HEADER ================= */}
      <header className="z-[100] bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-sm shrink-0 sticky top-0">
        {/* TOP ROW: BRANDING, SEARCH, ACTIONS */}
        <div className="border-b border-emerald-50/50">
          <div className="max-w-7xl mx-auto min-h-[90px] px-6 lg:px-10 py-4 flex items-center justify-between gap-8">
            {/* LEFT: BRANDING */}
            <a
              href="/"
              className="flex items-center gap-5 shrink-0 hover:opacity-90 transition-opacity group"
            >
              {/* LOGO: No background, transparent, and significantly larger */}
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
                    onClick={() => setShowAddModal(true)}
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
                onClick={() => setShowMobileSearch(true)}
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
                        view === tab.id
                          ? "text-emerald-500"
                          : "text-emerald-300"
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
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 relative overflow-hidden">
        {view === "map" && isMounted && (
          <>
            <Map data={data} filters={filters} mode={mode} />

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute top-6 left-6 z-20 p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl hover:bg-gray-700"
            >
              <Filter
                size={20}
                className={showFilters ? "text-green-500" : "text-white"}
              />
            </button>
            {showFilters && (
              <div className="absolute top-20 left-6 z-20 w-64 bg-gray-800/95 backdrop-blur-md p-5 rounded-[2rem] border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700 mb-4">
                  <button
                    onClick={() => switchMode("category")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      mode === "category"
                        ? "bg-green-600 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => switchMode("use")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      mode === "use"
                        ? "bg-green-600 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Use
                  </button>
                </div>
                <CategoryFilter
                  categories={Object.keys(filters)}
                  filters={filters}
                  toggle={toggleFilter}
                />
              </div>
            )}
          </>
        )}

        {view === "grid" && (
          <div className="p-8 h-full overflow-y-auto bg-stone-50 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {/* SECTION HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-stone-200 pb-8">
                <div>
                  <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Database
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
                    Community{" "}
                    <span className="text-emerald-600">Observations</span>
                  </h2>
                </div>
                <p className="text-stone-400 font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-stone-100 shadow-sm">
                  {data.length} Specimens Documented
                </p>
              </div>

              {/* THE GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {data.map((item, index) => (
                  <motion.div
                    key={item.id || item._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, ease: "easeOut" }}
                    onClick={() => setSelectedMushroom(item)}
                    className="group bg-white border border-stone-200 rounded-[2.5rem] p-3 hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all cursor-pointer relative"
                  >
                    {/* IMAGE AREA */}
                    <div className="aspect-square bg-stone-100 rounded-[2rem] mb-4 overflow-hidden relative shadow-inner">
                      {item.image || item.images?.[0]?.url ? (
                        <img
                          src={item.image || item.images?.[0]?.url}
                          alt={item.name || item.commonName || "Mushroom"}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 gap-2">
                          <MapIcon size={40} strokeWidth={1} />
                          <span className="text-[8px] font-black uppercase tracking-tighter">
                            No Photo
                          </span>
                        </div>
                      )}

                      {/* CATEGORY BADGE */}
                      <div className="absolute top-3 left-3 scale-90 origin-top-left transition-transform group-hover:scale-100">
                        <MushroomBadge
                          category={item.category || item.ecologicalRole || "Unknown"}
                          use={item.use || item.commonUses?.[0] || "Unknown"}
                        />
                      </div>

                      {/* DATE OVERLAY */}
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-[8px] font-black text-emerald-900 shadow-sm border border-white/50">
                          {new Date(
                            item.createdAt || Date.now()
                          ).toLocaleDateString("en-GB")}
                        </div>
                      </div>
                    </div>

                    {/* INFO AREA */}
                    <div className="px-3 pb-2">
                      <h3 className="font-black text-sm text-slate-800 group-hover:text-emerald-700 transition-colors uppercase tracking-tight truncate mb-1">
                        {item.name || item.commonName || "Unknown Species"}
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-stone-200 rounded-full group-hover:bg-emerald-400 transition-colors" />
                          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest truncate max-w-[80px]">
                            {item.contributor || item.submittedBy?.name || item.submittedBy?.username || "Guest Scientist"}
                          </p>
                        </div>

                        {/* LOCATION ICON */}
                        <Navigation
                          size={10}
                          className="text-stone-300 group-hover:text-emerald-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* HOVER GLOW EFFECT */}
                    <div className="absolute inset-0 rounded-[2.5rem] border-2 border-emerald-500/0 group-hover:border-emerald-500/10 pointer-events-none transition-all" />
                  </motion.div>
                ))}
              </div>

              {/* EMPTY STATE */}
              {data.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                  <div className="bg-white p-8 rounded-full shadow-xl border border-stone-100 mb-6">
                    <Search size={48} className="text-stone-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest">
                    No observations found
                  </h3>
                  <p className="text-stone-400 text-sm mt-2">
                    Try adjusting your filters or add a new specimen.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showMobileSearch && (
        <div className="fixed inset-0 z-[200] bg-emerald-950/40 backdrop-blur-md flex items-start p-4 md:hidden">
          <div className="w-full bg-white border border-stone-200 rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                <h3 className="font-black text-xs uppercase tracking-[0.2em] text-emerald-900">
                  Search Species
                </h3>
              </div>
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 rounded-xl bg-stone-100 text-stone-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* SEARCH INPUTS */}
            <div className="space-y-4">
              {/* Species Search */}
              <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                <Search size={18} className="text-emerald-600" />
                <input
                  placeholder="What did you find?"
                  className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
                />
              </div>

              {/* Location Search */}
              <div className="flex items-center bg-stone-100 border border-stone-200 rounded-2xl px-4 gap-3 focus-within:bg-white focus-within:border-emerald-500 transition-all">
                <MapPin size={18} className="text-emerald-600" />
                <input
                  placeholder="Where?"
                  className="bg-transparent flex-1 py-4 text-sm outline-none text-stone-800 placeholder:text-stone-400 font-medium"
                />
              </div>

              {/* Search Action Button */}
              <button
                onClick={() => setShowMobileSearch(false)}
                className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 active:scale-95 transition-all mt-2"
              >
                Explore Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white border border-stone-200 w-full max-w-md rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 my-8 max-h-[90vh] flex flex-col">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-8 right-8 text-stone-400 hover:text-emerald-600 transition-colors z-10"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* HEADER - Fixed */}
            <div className="p-8 md:p-10 pb-6 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  Citizen Science
                </span>
              </div>
              <h2 className="text-3xl font-black text-emerald-900 uppercase tracking-tight">
                Add <span className="text-emerald-600 italic">Specimen</span>
              </h2>
            </div>

            {/* FORM - Scrollable */}
            <form
              id="mushroom-form"
              onSubmit={async (e) => {
                e.preventDefault();

                if (!selectedLocation) {
                  toast.error("Please select a location on the map");
                  return;
                }

                if (!imageFile) {
                  toast.error("Please upload at least one image");
                  return;
                }

                setIsSubmitting(true);

                try {
                  const fd = new FormData();
                  fd.append("latitude", selectedLocation.latitude);
                  fd.append("longitude", selectedLocation.longitude);
                  fd.append("image1", imageFile);
                  
                  // Optional fields - only append if filled
                  if (commonName) fd.append("commonName", commonName);
                  if (ecologicalRole) fd.append("ecologicalRole", ecologicalRole);
                  if (texture) fd.append("texture", texture);
                  if (underside) fd.append("underside", underside);
                  if (fruitingSurface) fd.append("fruitingSurface", fruitingSurface);
                  if (stemPresence) fd.append("stemPresence", stemPresence);
                  commonUses.forEach((use) => fd.append("commonUses", use));

                  const res = await fetch("/api/mushrooms", {
                    method: "POST",
                    body: fd,
                  });

                  let data;
                  try {
                    data = await res.json();
                  } catch (parseError) {
                    console.error("Failed to parse response:", parseError);
                    throw new Error(`Server error: ${res.status} ${res.statusText}`);
                  }

                  if (!res.ok) {
                    throw new Error(data.error || data.message || `Submission failed: ${res.status} ${res.statusText}`);
                  }

                  // Show success message
                  toast.success("Mushroom submitted successfully! It will be reviewed by an admin.");

                  // refresh public data
                  const refreshed = await fetch("/api/mushrooms");
                  const refreshedData = await refreshed.json();
                  const mushrooms = refreshedData.mushrooms || [];
                  // Transform data to match Map component expectations
                  const transformedMushrooms = mushrooms.map((m) => ({
                    ...m,
                    latitude: m.location?.latitude || m.latitude,
                    longitude: m.location?.longitude || m.longitude,
                    name: m.commonName || m.name || "Unnamed Mushroom",
                    image: m.images?.[0]?.url || m.image,
                    contributor: m.submittedBy?.name || m.submittedBy?.username || m.contributor || "Anonymous",
                    info: m.description || m.info || "",
                    category: m.ecologicalRole || m.category || "Unknown",
                    use: m.commonUses?.[0] || m.use || "",
                  }));
                  setData(transformedMushrooms);
                  initializeFilters(transformedMushrooms, "category");

                  // Reset form
                  setShowAddModal(false);
                  setImageFile(null);
                  setSelectedLocation(null);
                  setCommonName("");
                  setEcologicalRole("");
                  setTexture("");
                  setUnderside("");
                  setFruitingSurface("");
                  setStemPresence("");
                  setCommonUses([]);
                } catch (err) {
                  console.error("Submission error:", err);
                  const errorMessage = err.message || "Failed to submit mushroom. Please try again.";
                  
                  // Show detailed error toast
                  if (errorMessage.includes("Unauthorized") || errorMessage.includes("token")) {
                    toast.error("Please log in to submit mushrooms");
                  } else if (errorMessage.includes("image")) {
                    toast.error("Image error: Please ensure image is JPG, PNG, or WEBP and under 10MB");
                  } else if (errorMessage.includes("Location")) {
                    toast.error("Please select a location on the map");
                  } else {
                    toast.error(errorMessage);
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="flex-1 overflow-y-auto px-8 md:px-10 pb-8 md:pb-10 space-y-4"
            >
              {/* INFO MESSAGE */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-emerald-800 text-center">
                  Only image and location are required. All other fields are optional and can be filled by admin during review.
                </p>
              </div>

              {/* COMMON NAME - OPTIONAL */}
              <input
                value={commonName}
                onChange={(e) => setCommonName(e.target.value)}
                placeholder="Common name (optional)"
                className="w-full bg-stone-100 border border-stone-200 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 placeholder:text-stone-400"
              />

              {/* LOCATION PICKER - REQUIRED */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                  Location <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(true)}
                  className={`w-full bg-stone-100 border-2 rounded-2xl px-5 py-4 text-left font-bold transition ${
                    selectedLocation
                      ? "border-emerald-500 text-emerald-700"
                      : "border-stone-200 text-stone-600 hover:border-emerald-300"
                  }`}
                >
                  {selectedLocation
                    ? `📍 ${selectedLocation.latitude.toFixed(
                        5
                      )}, ${selectedLocation.longitude.toFixed(5)}`
                    : "Click to select location on map"}
                </button>
              </div>

              {/* PHOTO UPLOAD - REQUIRED */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                  Photo <span className="text-red-500">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-3xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 group transition-all bg-stone-50">
                  <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                    <Camera className="text-emerald-600" size={24} />
                  </div>
                  <p className="mt-3 text-[10px] text-stone-400 group-hover:text-emerald-700 uppercase font-black tracking-widest">
                    {imageFile ? imageFile.name : "Upload Specimen Photo"}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    accept="image/*"
                    required
                  />
                </label>
              </div>

              {/* CLASSIFICATION FIELDS - OPTIONAL */}
              <div className="border-t border-stone-200 pt-6 mt-6">
                <p className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
                  Classification (Optional)
                </p>
                
                <div className="space-y-4">
                  {/* ECOLOGICAL ROLE */}
                  <SelectField
                    label="Ecological Role"
                    value={ecologicalRole}
                    onChange={setEcologicalRole}
                    options={ECOLOGICAL_ROLES}
                  />

                  {/* TEXTURE */}
                  <SelectField
                    label="Texture"
                    value={texture}
                    onChange={setTexture}
                    options={TEXTURES}
                  />

                  {/* UNDERSIDE */}
                  <SelectField
                    label="Underside"
                    value={underside}
                    onChange={setUnderside}
                    options={UNDERSIDES}
                  />

                  {/* FRUITING SURFACE */}
                  <SelectField
                    label="Fruiting Surface"
                    value={fruitingSurface}
                    onChange={setFruitingSurface}
                    options={FRUITING_SURFACES}
                  />

                  {/* STEM PRESENCE */}
                  <SelectField
                    label="Stem Presence"
                    value={stemPresence}
                    onChange={setStemPresence}
                    options={STEM_PRESENCE}
                  />

                  {/* COMMON USES */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
                      Common Uses
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_USES.map((use) => (
                        <button
                          key={use}
                          type="button"
                          onClick={() => {
                            setCommonUses((prev) =>
                              prev.includes(use)
                                ? prev.filter((u) => u !== use)
                                : [...prev, use]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                            commonUses.includes(use)
                              ? "bg-emerald-600 text-white"
                              : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                          }`}
                        >
                          {use
                            .split("-")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </form>
            
            {/* SUBMIT BUTTON - Fixed */}
            <div className="p-8 md:p-10 pt-4 border-t border-stone-200 shrink-0">
              <button
                type="submit"
                form="mushroom-form"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Submit Observation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LOCATION PICKER MODAL ================= */}
      {showLocationPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white border border-stone-200 w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowLocationPicker(false)}
              className="absolute top-8 right-8 text-stone-400 hover:text-emerald-600 transition-colors z-10"
            >
              <X size={24} strokeWidth={2.5} />
            </button>

            {/* HEADER */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">
                  Select Location
                </span>
              </div>
              <h3 className="text-2xl font-black text-emerald-900 uppercase tracking-tight">
                Click on the map to set location
              </h3>
            </div>

            {/* MAP */}
            <div className="h-96 rounded-2xl overflow-hidden border border-stone-200">
              <LocationPickerMap
                onSelect={(location) => {
                  setSelectedLocation(location);
                  setShowLocationPicker(false);
                }}
              />
            </div>

            {/* INFO */}
            {selectedLocation && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm font-bold text-emerald-900">
                  Selected: {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SELECT FIELD COMPONENT ================= */

function SelectField({ label, value, onChange, options }) {
  const formatLabel = (val) => {
    return val
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <label className="block">
      <span className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || "")}
        className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 text-sm"
      >
        <option value="">— Select (Optional) —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {formatLabel(o)}
          </option>
        ))}
      </select>
    </label>
  );
}
