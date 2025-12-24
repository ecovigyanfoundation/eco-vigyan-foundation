"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";
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
} from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

/* ----------------------------------
    COMPONENT: DUAL ICON BADGE
    Shows the 'Use' Icon + 'Category' Text
---------------------------------- */
const MushroomBadge = ({ category, use, variant = "small" }) => {
  const getUseIcon = (useType) => {
    const iconSize = variant === "small" ? 12 : 16;
    switch (useType?.toLowerCase()) {
      case "culinary": case "edible": return <Utensils size={iconSize} className="text-emerald-400" />;
      case "medicinal": return <FlaskConical size={iconSize} className="text-blue-400" />;
      case "poisonous": return <Skull size={iconSize} className="text-red-500" />;
      case "research": return <Leaf size={iconSize} className="text-orange-400" />;
      case "fuel": return <Flame size={iconSize} className="text-yellow-500" />;
      default: return <Zap size={iconSize} className="text-purple-400" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full ${variant === "small" ? "px-2 py-0.5" : "px-4 py-2"}`}>
      {getUseIcon(use)}
      <span className={`font-black uppercase tracking-tighter text-white ${variant === "small" ? "text-[9px]" : "text-xs"}`}>
        {category}
      </span>
    </div>
  );
};

export default function MapPage() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("category"); // Toggle b/w 'category' vs 'use'
  const [filters, setFilters] = useState({});
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [view, setView] = useState("map");
  const [isMounted, setIsMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ species: "", place: "" });

  const [formData, setFormData] = useState({ name: "", category: "", use: "", latitude: "", longitude: "" });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/mushrooms").then(res => res.json()).then(d => {
      setData(d || []);
      initializeFilters(d || [], "category");
    }).catch(console.error);
  }, []);

  const initializeFilters = (dataset, filterMode) => {
    const f = {};
    dataset.forEach((item) => {
      const key = filterMode === "category" ? item.category : item.use;
      if (key) f[key] = true;
    });
    setFilters(f);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    initializeFilters(data, newMode);
  };

  const toggleFilter = (key) => setFilters(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 overflow-hidden text-white">
      {/* ================= HEADER ================= */}
      <header className="z-[100] bg-gray-900 border-b border-gray-800 shadow-2xl shrink-0">
        <div className="h-[73px] px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 p-2 rounded-xl"><MapIcon size={24} /></div>
            <div>
              <h1 className="font-black text-xl tracking-tighter leading-none">ECOVIGYAN</h1>
              <div className="flex items-center gap-1.5 mt-1 group cursor-help text-[10px] text-gray-500 font-bold uppercase">
                <Users size={12} className="text-green-500" /> Citizen Scientists <Info size={10} />
              </div>
            </div>
          </div>

          <div className="flex-1 max-w-2xl flex items-center bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden px-4 gap-2">
             <Search size={16} className="text-gray-500" />
             <input placeholder="Search Species..." className="bg-transparent flex-1 py-2.5 text-sm outline-none" />
             <div className="w-px h-4 bg-gray-700 mx-2" />
             <MapPin size={16} className="text-gray-500" />
             <input placeholder="Place..." className="bg-transparent flex-1 py-2.5 text-sm outline-none" />
          </div>

          <button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-green-900/40">
            <Plus size={18} /> <span className="hidden lg:inline">ADD OBSERVATION</span>
          </button>
        </div>

        <div className="h-12 px-6 flex items-center justify-between bg-gray-900/50 border-t border-gray-800/50">
          <nav className="flex h-full">
            {[{ id: 'map', label: 'Explore', icon: MapIcon }, { id: 'grid', label: 'Observations', icon: Grid }, { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }].map((tab) => (
              <button key={tab.id} onClick={() => setView(tab.id)} className={`flex items-center gap-2 px-6 h-full border-b-2 transition-all text-[10px] font-black uppercase tracking-widest ${view === tab.id ? "border-green-500 text-green-500 bg-green-500/5" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-[10px] font-black uppercase tracking-tighter"><Navigation size={12} className="text-blue-400" /> Trail</button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-[10px] font-black uppercase tracking-tighter"><Layers size={12} className="text-orange-400" /> Eco Zones</button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 relative overflow-hidden">
        {view === "map" && isMounted && (
          <>
            <Map data={data} filters={filters} mode={mode} onMarkerSelect={(m) => setSelectedMushroom(m)} />
            <button onClick={() => setShowFilters(!showFilters)} className="absolute top-6 left-6 z-20 p-4 rounded-2xl bg-gray-800 border border-gray-700 shadow-2xl hover:bg-gray-700">
              <Filter size={20} className={showFilters ? "text-green-500" : "text-white"} />
            </button>
            {showFilters && (
              <div className="absolute top-20 left-6 z-20 w-64 bg-gray-800/95 backdrop-blur-md p-5 rounded-[2rem] border border-gray-700 shadow-2xl animate-in fade-in slide-in-from-top-2">
                 <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700 mb-4">
                  <button onClick={() => switchMode('category')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'category' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>Category</button>
                  <button onClick={() => switchMode('use')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${mode === 'use' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>Use</button>
                </div>
                <CategoryFilter categories={Object.keys(filters)} filters={filters} toggle={toggleFilter} />
              </div>
            )}
          </>
        )}

        {view === "grid" && (
          <div className="p-8 h-full overflow-y-auto bg-gray-950 custom-scrollbar">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {data.map((item, index) => (
                <div key={item.id || item._id || index} onClick={() => setSelectedMushroom(item)} className="group bg-gray-900 border border-gray-800 rounded-[2rem] p-3 hover:border-green-500 transition-all cursor-pointer">
                  <div className="aspect-square bg-gray-950 rounded-[1.5rem] mb-4 overflow-hidden relative shadow-inner">
                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center opacity-10"><MapIcon size={48} /></div>}
                    <div className="absolute top-3 left-3">
                      <MushroomBadge category={item.category} use={item.use} />
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-black text-lg group-hover:text-green-400 transition-colors truncate">{item.name}</h3>
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">By {item.contributor || "Scientist"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= DETAIL OVERLAY ================= */}
        {selectedMushroom && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-800 border border-gray-700 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95">
              <div className="relative h-64 bg-gray-900">
                {selectedMushroom.image && <img src={selectedMushroom.image} alt={selectedMushroom.name} className="w-full h-full object-cover" />}
                <button onClick={() => setSelectedMushroom(null)} className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-2xl"><X size={20} /></button>
              </div>
              <div className="p-10">
                <div className="mb-6"><MushroomBadge category={selectedMushroom.category} use={selectedMushroom.use} variant="large" /></div>
                <h2 className="text-4xl font-black mt-3 leading-tight mb-8 tracking-tighter">{selectedMushroom.name}</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-950 p-4 rounded-3xl border border-gray-700">
                    <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Contributor</p>
                    <p className="text-sm font-bold truncate">{selectedMushroom.contributor || "Anonymous"}</p>
                  </div>
                  <div className="bg-gray-950 p-4 rounded-3xl border border-gray-700">
                    <p className="text-[9px] font-black text-gray-600 uppercase mb-1">Coordinates</p>
                    <p className="text-sm font-mono truncate">{selectedMushroom.latitude}, {selectedMushroom.longitude}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedMushroom(null)} className="w-full bg-white text-black hover:bg-gray-200 py-5 rounded-[1.5rem] font-black text-xl shadow-xl">Return to Map</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={28}/></button>
            <h2 className="text-3xl font-black mb-8 italic">Add Specimen</h2>
            <form onSubmit={async (e) => { e.preventDefault(); setShowAddModal(false); }} className="space-y-4">
              <input name="name" placeholder="Species Name" className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-green-500 outline-none" required />
              <div className="grid grid-cols-2 gap-4">
                <input name="latitude" placeholder="Lat" className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 outline-none" required />
                <input name="longitude" placeholder="Long" className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-5 py-4 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select name="category" className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-4 outline-none" required>
                  <option value="">Category...</option>
                  <option value="Edible">Edible</option>
                  <option value="Medicinal">Medicinal</option>
                  <option value="Poisonous">Poisonous</option>
                </select>
                <select name="use" className="w-full bg-gray-900 border border-gray-700 rounded-2xl px-4 py-4 outline-none" required>
                  <option value="">Use...</option>
                  <option value="Culinary">Culinary</option>
                  <option value="Research">Research</option>
                  <option value="Fuel">Fuel</option>
                </select>
              </div>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-900 transition-all">
                <Camera className="text-gray-500 mb-2" size={24} />
                <p className="text-[10px] text-gray-500 uppercase font-black">{imageFile ? imageFile.name : "Specimen Photo"}</p>
                <input type="file" className="hidden" onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
              </label>
              <button disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 py-5 rounded-2xl text-white font-black text-lg transition-all active:scale-95 shadow-xl shadow-green-900/40">
                {isSubmitting ? "PROCESSING..." : "SUBMIT OBSERVATION"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}