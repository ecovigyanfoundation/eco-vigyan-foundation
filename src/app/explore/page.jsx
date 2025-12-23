"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";
import {
  Menu,
  X,
  Search,
  Map as MapIcon,
  Grid,
  Trophy,
  Navigation,
  Layers,
  Users,
  Leaf,
  Flame,
  Info,
} from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("category");
  const [filters, setFilters] = useState({});
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [view, setView] = useState("map");
  const [roleMode, setRoleMode] = useState("use");
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    contributor: "",
    category: "",
    use: "",
    latitude: "",
    longitude: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetch("/api/mushrooms")
      .then((res) => res.json())
      .then((d) => {
        setData(d || []);
        initializeFilters(d || [], "category");
      })
      .catch(console.error);
  }, []);

  const initializeFilters = (dataset, filterMode) => {
    const f = {};
    dataset.forEach((item) => {
      const key = filterMode === "category" ? item.category : item.use;
      if (key) f[key] = true;
    });
    setFilters(f);
  };

  const toggleFilter = (key) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const switchMode = (newMode) => {
    setMode(newMode);
    initializeFilters(data, newMode);
  };

  const handleFormChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([k, v]) => formPayload.append(k, v));
      if (imageFile) formPayload.append("image", imageFile);

      const res = await fetch("/api/mushrooms", {
        method: "POST",
        body: formPayload,
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message);

      setData((prev) => [...prev, payload]);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden relative">
      <style jsx global>{`
        .leaflet-marker-icon,
        .leaflet-interactive,
        .map-marker {
          cursor: pointer !important;
        }
      `}</style>

      {/* --- HEADER (Added fixed height h-[73px]) --- */}
      <header className="h-[73px] z-[100] bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between gap-4 shadow-xl shrink-0 relative">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <MapIcon className="text-green-500" size={20} /> Explore
            </h1>
            <div className="group relative flex items-center gap-1 text-xs text-gray-400 cursor-help">
              <Users size={12} /> Citizen Scientists <Info size={12} />
              <span className="absolute top-6 left-0 w-48 bg-gray-700 text-white p-2 rounded shadow-lg hidden group-hover:block z-[110]">
                Community members contributing fungal observations.
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl flex items-center gap-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-900 border border-gray-700 rounded-full pl-10 pr-4 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <nav className="hidden lg:flex items-center bg-gray-900 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView("map")}
              className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-2 cursor-pointer ${
                view === "map" ? "bg-green-600 text-white" : "text-gray-400"
              }`}
            >
              <MapIcon size={14} /> Map
            </button>
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-2 cursor-pointer ${
                view === "grid" ? "bg-green-600 text-white" : "text-gray-400"
              }`}
            >
              <Grid size={14} /> Grid
            </button>
            <button
              onClick={() => setView("leaderboard")}
              className={`px-3 py-1.5 rounded-md text-xs flex items-center gap-2 cursor-pointer ${
                view === "leaderboard"
                  ? "bg-green-600 text-white"
                  : "text-gray-400"
              }`}
            >
              <Trophy size={14} /> Leaderboard
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open("https://maps.google.com", "_blank")}
            className="hidden sm:flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer"
          >
            <Navigation size={14} /> Trail
          </button>
          <button className="hidden sm:flex items-center gap-2 bg-gray-700 text-white px-3 py-2 rounded-lg text-xs font-bold cursor-pointer">
            <Layers size={14} /> Eco Zones
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative bg-gray-900">
        {/* --- ASIDE (Updated fixed top-[73px] and z-index) --- */}
        <aside
          className={`
    fixed top-[64px] left-0 z-50
    h-[calc(100vh-64px)]
    w-[300px] sm:w-[350px]
    bg-gray-800 border-r border-gray-700
    transition-transform duration-300 ease-in-out
    md:relative md:top-0 md:h-full md:translate-x-0
    md:w-1/3 lg:w-1/4
    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
    overflow-y-auto custom-scrollbar shadow-2xl flex flex-col
  `}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 z-[60] p-2 bg-gray-900 rounded-lg text-gray-400 cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="p-6 space-y-6">
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 min-h-[150px]">
              <h2 className="text-lg font-bold text-green-400 mb-3">
                Selected Mushroom Info
              </h2>
              {selectedMushroom ? (
                <div className="space-y-4 text-gray-200">
                  {selectedMushroom.image && (
                    <img
                      src={selectedMushroom.image}
                      className="w-full h-40 object-cover rounded-xl border border-gray-600"
                    />
                  )}
                  <h3 className="text-xl font-bold text-white">
                    {selectedMushroom.name}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-center">
                    <div className="bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">
                        Category
                      </span>
                      {selectedMushroom.category}
                    </div>
                    <div className="bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold">
                        Use
                      </span>
                      {selectedMushroom.use}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-gray-500 text-sm italic border-2 border-dashed border-gray-700 rounded-lg">
                  <p>Select a location on the map</p>
                </div>
              )}
            </div>

            <hr className="border-gray-700" />

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">
                Filter Mode:
              </p>
              <div className="relative flex p-1 bg-gray-900 rounded-full w-full border border-gray-700">
                <div
                  className={`absolute top-1 bottom-1 w-1/2 bg-green-700 rounded-full transition-transform duration-300 ${
                    mode === "category" ? "translate-x-0" : "translate-x-full"
                  }`}
                ></div>
                <button
                  className="w-1/2 py-2 text-sm z-10 cursor-pointer text-white"
                  onClick={() => switchMode("category")}
                >
                  Category
                </button>
                <button
                  className="w-1/2 py-2 text-sm z-10 cursor-pointer text-white"
                  onClick={() => switchMode("use")}
                >
                  Use
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">
                Active Filters:
              </p>
              <div className="bg-gray-900/40 rounded-xl p-1">
                <CategoryFilter
                  categories={Object.keys(filters)}
                  filters={filters}
                  toggle={toggleFilter}
                />
              </div>
            </div>

            <div className="bg-gray-700/40 border border-gray-600 rounded-xl p-4">
              <h3 className="text-md font-bold text-green-400 mb-4 uppercase">
                Contribute
              </h3>
              <form className="space-y-3" onSubmit={handleFormSubmit}>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Specimen Name"
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white"
                  required
                />
                <button
                  disabled={isSubmitting}
                  className="w-full bg-green-600 py-3 rounded-xl text-sm font-bold text-white cursor-pointer active:scale-95"
                >
                  {isSubmitting ? "Uploading..." : "Add to Map"}
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* MOBILE BACKDROP (Updated fixed top-[73px]) */}
        {isSidebarOpen && (
          <div
            className="fixed top-[73px] inset-0 bg-black/70 backdrop-blur-sm z-[40] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 relative z-10 h-full">
          {view === "map" ? (
            isMounted && (
              <Map
                data={data}
                filters={filters}
                mode={mode}
                onMarkerSelect={(m) => {
                  setSelectedMushroom(m);
                  setIsSidebarOpen(true);
                }}
              />
            )
          ) : view === "grid" ? (
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-full text-white custom-scrollbar bg-gray-950">
              {data
                .filter((item) => filters[item.category] || filters[item.use])
                .map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-green-500 transition cursor-pointer group"
                    onClick={() => {
                      setSelectedMushroom(item);
                      setView("map");
                      setIsSidebarOpen(true);
                    }}
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      className="h-48 w-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="p-4 text-center">
                      <h4 className="font-bold text-lg">{item.name}</h4>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-8 text-white h-full bg-gray-950">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" /> Top Contributors
              </h2>
              <p className="text-gray-400 italic">
                Leaderboard content goes here...
              </p>
            </div>
          )}
        </main>
      </div>

      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed bottom-6 left-6 z-[60] p-4 bg-green-600 text-white rounded-full shadow-2xl cursor-pointer transition-transform"
        >
          <Menu size={24} />
        </button>
      )}
    </div>
  );
}
