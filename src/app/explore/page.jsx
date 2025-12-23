"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";
import { Menu, X } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("category");
  const [filters, setFilters] = useState({});
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
  const [formStatus, setFormStatus] = useState(null);

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

  const handleImageChange = (e) => setImageFile(e.target.files?.[0] || null);

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
      setFormStatus({ type: "success", message: "Added!" });
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      setFormStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden relative">
      {/* <header className="h-[60px] border-b border-white/10 flex items-center justify-between px-4 shrink-0 bg-gray-950 z-50">
        <h1 className="text-lg font-black text-white tracking-tight">
          <span className="text-green-500 text-xl">🍄</span> MushMap
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 text-white bg-gray-800 rounded-lg border border-white/10"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header> 
      */}

      {/* MOBILE TRIGGER BUTTON (Pushed down to avoid overlap) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-6 left-6 z-40 p-4 bg-green-600 text-white rounded-full shadow-2xl border border-white/20 active:scale-90 transition-transform"
        >
          <Menu size={24} />
        </button>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <aside
          className={`
          fixed top-0 left-0 z-50 w-[300px] sm:w-[350px] 
          h-full bg-gray-800 border-r border-gray-700
          transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:w-1/3 lg:w-1/4 md:h-full
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          overflow-y-auto custom-scrollbar shadow-2xl flex flex-col
        `}
        >
          {/* MOBILE CLOSE BUTTON */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute top-4 right-4 z-50 p-2 bg-gray-900 rounded-lg text-gray-400 hover:text-white border border-white/10"
          >
            <X size={20} />
          </button>

          <div className="p-6 space-y-6">
            {/* 1. SELECTION DETAILS PANEL (Styled like your reference) */}
            <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600 min-h-[150px] mt-8 md:mt-0">
              <h2 className="text-lg font-bold text-green-400 mb-3">
                Selected Mushroom Info
              </h2>

              {selectedMushroom ? (
                <div className="space-y-4 text-gray-200 animate-in fade-in slide-in-from-left-4 duration-300">
                  {selectedMushroom.image && (
                    <img
                      src={selectedMushroom.image}
                      className="w-full h-40 object-cover rounded-xl border border-gray-600"
                      alt={selectedMushroom.name}
                    />
                  )}
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    {selectedMushroom.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold mb-1">Category</span>
                      {selectedMushroom.category}
                    </div>
                    <div className="bg-gray-800/80 p-2 rounded-lg border border-gray-700">
                      <span className="text-gray-500 block text-[10px] uppercase font-bold mb-1">Use</span>
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

            {/* 2. TOGGLE SWITCH (Made larger for mobile) */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">Filter Mode:</p>
              <div className="relative flex p-1 bg-gray-900 rounded-full w-full shadow-inner border border-gray-700">
                <div
                  className={`absolute top-1 bottom-1 w-1/2 bg-green-700 rounded-full transition-transform duration-300 ease-in-out ${
                    mode === "category" ? "translate-x-0" : "translate-x-full"
                  }`}
                ></div>
                <button
                  className={`w-1/2 py-2.5 text-sm z-10 transition-colors ${
                    mode === "category" ? "text-white font-bold" : "text-gray-400"
                  }`}
                  onClick={() => switchMode("category")}
                >
                  Category
                </button>
                <button
                  className={`w-1/2 py-2.5 text-sm z-10 transition-colors ${
                    mode === "use" ? "text-white font-bold" : "text-gray-400"
                  }`}
                  onClick={() => switchMode("use")}
                >
                  Use
                </button>
              </div>
            </div>

            {/* 3. FILTERS */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-300">Active Filters:</p>
              <div className="bg-gray-900/40 rounded-xl p-1">
                <CategoryFilter
                  categories={Object.keys(filters)}
                  filters={filters}
                  toggle={toggleFilter}
                />
              </div>
            </div>

            {/* 4. FORM (Refined grid) */}
            <div className="bg-gray-700/40 border border-gray-600 rounded-xl p-4">
              <h3 className="text-md font-bold text-green-400 mb-4 uppercase tracking-tight">
                Contribute Specimen
              </h3>
              <form className="space-y-3" onSubmit={handleFormSubmit}>
                <div className="space-y-3">
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="Specimen Name"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                  <input
                    name="contributor"
                    value={formData.contributor}
                    onChange={handleFormChange}
                    placeholder="Your Name"
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-2 focus:ring-green-500 outline-none"
                    required
                  />
                </div>
                <button
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-xl text-sm font-bold text-white uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? "Uploading..." : "Add to Map"}
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* MOBILE BACKDROP */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 relative z-10 h-full">
          {isMounted && (
            <Map
              data={data}
              filters={filters}
              mode={mode}
              onMarkerSelect={(m) => {
                setSelectedMushroom(m);
                if (window.innerWidth < 768) setIsSidebarOpen(true);
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}