"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "@/components/CategoryFilter";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [data, setData] = useState([]);
  const [mode, setMode] = useState("category");
  const [filters, setFilters] = useState({});
  const [selectedMushroom, setSelectedMushroom] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

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

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    setIsMounted(true);
    fetch("/api/mushrooms")
      .then((res) => res.json())
      .then((d) => setData(d || []))
      .catch(console.error);
  }, []);

  /* ---------------- FILTERS LOGIC ---------------- */
  useEffect(() => {
    if (!data.length) return;
    const f = {};
    data.forEach((item) => {
      const key = mode === "category" ? item.category : item.use;
      if (key) f[key] = true;
    });
    setFilters(f);
  }, [data, mode]);

  const toggleFilter = (key) => setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  const switchMode = (newMode) => setMode(newMode);
  const handleFormChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleImageChange = (e) => setImageFile(e.target.files?.[0] || null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus(null);
    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([k, v]) => formPayload.append(k, v));
      if (imageFile) formPayload.append("image", imageFile);

      const res = await fetch("/api/mushrooms", { method: "POST", body: formPayload });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message);

      setData((prev) => [...prev, payload]);
      setFormStatus({ type: "success", message: "Mushroom added!" });
      setFormData({ name: "", contributor: "", category: "", use: "", latitude: "", longitude: "" });
      setImageFile(null);
    } catch (err) {
      setFormStatus({ type: "error", message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // 1. Full viewport height wrapper, no scroll on body
    <div className="flex flex-col h-screen w-screen bg-gray-900 overflow-hidden">
      
      {/* 2. OPTIONAL NAVBAR SPACE (If you have a 64px header) */}
      {/* <header className="h-[64px] border-b border-white/10 flex items-center px-6 shrink-0 bg-gray-950">
         <h1 className="text-xl font-black text-white tracking-tight">
          <span className="text-green-500">🍄</span> MushMap
        </h1>
      </header> */}

      {/* 3. MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: Removed 'fixed', added 'overflow-y-auto' */}
        <aside className="w-full md:w-[350px] lg:w-[400px] bg-gray-900 border-r border-white/10 flex flex-col overflow-y-auto shrink-0 custom-scrollbar">
          <div className="p-6 space-y-8">
            
            {/* SELECTED SPECIMEN CARD */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-75"></div>
              <div className="relative bg-gray-800/80 rounded-2xl p-4 border border-white/10 min-h-[160px]">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-sm font-bold text-green-400 uppercase tracking-wider">Selected Specimen</h2>
                  {selectedMushroom && (
                    <button onClick={() => setSelectedMushroom(null)} className="text-gray-500 hover:text-white text-xs">Clear</button>
                  )}
                </div>

                {selectedMushroom ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                    {selectedMushroom.image && (
                      <img src={selectedMushroom.image} className="w-full h-40 object-cover rounded-xl border border-white/10" alt={selectedMushroom.name} />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedMushroom.name}</h3>
                      <p className="text-xs text-gray-400">Contributor: {selectedMushroom.contributor}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic text-center py-8">Select a mushroom on the map</p>
                )}
              </div>
            </div> 

            <hr className="border-white/5" />

            {/* FILTERS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-500 uppercase">Filter by</span>
                <div className="flex bg-black rounded-lg p-1 border border-white/5">
                  <button onClick={() => switchMode("category")} className={`px-3 py-1 text-[10px] rounded ${mode === 'category' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>CATEGORY</button>
                  <button onClick={() => switchMode("use")} className={`px-3 py-1 text-[10px] rounded ${mode === 'use' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>USE</button>
                </div>
              </div>
              <CategoryFilter categories={Object.keys(filters)} filters={filters} toggle={toggleFilter} />
            </div>

            {/* FORM SECTION */}
            <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-bold text-white mb-4">Contribute specimen</h3>
              <form className="space-y-3" onSubmit={handleFormSubmit}>
                <div className="grid grid-cols-2 gap-2">
                  <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Name" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" required />
                  <input name="contributor" value={formData.contributor} onChange={handleFormChange} placeholder="Your Name" className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white" required />
                </div>
                {/* ... other form fields ... */}
                <button disabled={isSubmitting} className="w-full bg-green-600 py-3 rounded-xl text-xs font-bold text-white hover:bg-green-500 transition-all">
                  {isSubmitting ? "UPLOADING..." : "ADD TO MAP"}
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* MAP CONTAINER: Takes all remaining space */}
        <main className="flex-1 relative">
          {isMounted && (
            <Map data={data} filters={filters} mode={mode} onMarkerSelect={setSelectedMushroom} />
          )}
        </main>
      </div>
    </div>
  );
}