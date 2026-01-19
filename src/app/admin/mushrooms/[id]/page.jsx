"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  CheckCircle, XCircle, Clock, Save, 
  ChevronLeft, Info, FlaskConical, Map as MapIcon, Sprout, Trash2,
  Sparkles, ImageIcon, Loader2
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

/* ================= OPTIONS ================= */
const ECOLOGICAL_ROLES = ["decomposer", "symbiont", "parasite"];
const TEXTURES = ["soft-to-touch", "hard-to-touch", "jelly-like", "leathery"];
const UNDERSIDES = ["gills", "pores", "teeth", "ball-with-no-distinctive-bottom", "cup-with-no-distinctive-bottom", "club-with-no-distinctive-bottom", "crust-on-wood-with-no-distinctive-bottom", "star-with-no-distinctive-bottom", "jelly-with-no-distinctive-bottom", "sponge-with-no-distinctive-bottom"];
const FRUITING_SURFACES = ["ground", "leaf", "wood", "dung"];
const STEM_PRESENCE = ["has-stem", "has-no-stem"];
const COMMON_USES = ["edible", "inedible", "poisonous", "medicinal", "hallucinogenic", "other-uses", "mysterious"];

export default function AdminMushroomReviewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [mushroom, setMushroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    commonName: "",
    scientificName: "",
    description: "",
    ecologicalRole: [],
    texture: "",
    underside: "",
    fruitingSurface: "",
    stemPresence: "",
    commonUses: [],
    adminNotes: "",
    rejectionReason: "",
    status: "",
  });

  // Autocomplete states
  const [allMushrooms, setAllMushrooms] = useState([]);
  const [commonNameSuggestions, setCommonNameSuggestions] = useState([]);
  const [scientificNameSuggestions, setScientificNameSuggestions] = useState([]);
  const [showCommonNameSuggestions, setShowCommonNameSuggestions] = useState(false);
  const [showScientificNameSuggestions, setShowScientificNameSuggestions] = useState(false);
  const commonNameInputRef = useRef(null);
  const scientificNameInputRef = useRef(null);
  const commonNameSuggestionsRef = useRef(null);
  const scientificNameSuggestionsRef = useRef(null);

  useEffect(() => {
    const fetchMushroom = async () => {
      try {
        const res = await fetch(`/api/admin/mushrooms/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch");

        const m = data.mushroom;
        setMushroom(m);
        setForm({
          commonName: m.commonName ?? "",
          scientificName: m.scientificName ?? "",
          description: m.description ?? "",
          ecologicalRole: Array.isArray(m.ecologicalRole) ? m.ecologicalRole : (m.ecologicalRole ? [m.ecologicalRole] : []),
          texture: m.texture ?? "",
          underside: m.underside ?? "",
          fruitingSurface: m.fruitingSurface ?? "",
          stemPresence: m.stemPresence ?? "",
          commonUses: m.commonUses ?? [],
          adminNotes: m.adminNotes ?? "",
          rejectionReason: m.rejectionReason ?? "",
          status: m.status ?? "pending",
        });
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMushroom();
  }, [id]);

  // Fetch all mushrooms for autocomplete
  useEffect(() => {
    const fetchMushrooms = async () => {
      try {
        const res = await fetch("/api/mushrooms");
        if (res.ok) {
          const data = await res.json();
          setAllMushrooms(data.mushrooms || []);
        }
      } catch (error) {
        console.error("Error fetching mushrooms:", error);
      }
    };
    fetchMushrooms();
  }, []);

  // Generate common name suggestions (only populate list, don't auto-show)
  useEffect(() => {
    if (!form.commonName.trim() || !allMushrooms.length) {
      setCommonNameSuggestions([]);
      return;
    }

    const searchLower = form.commonName.toLowerCase().trim();
    const uniqueMatches = new Map();

    allMushrooms.forEach((item) => {
      const itemCommonName = (item.commonName || item.name || "").toLowerCase();
      
      if (itemCommonName.includes(searchLower)) {
        const key = item.commonName || item.name;
        if (!uniqueMatches.has(key)) {
          uniqueMatches.set(key, {
            commonName: item.commonName || item.name || "Unknown",
            scientificName: item.scientificName || "",
            ecologicalRole: item.ecologicalRole || [],
            texture: item.texture || "",
            underside: item.underside || "",
            fruitingSurface: item.fruitingSurface || "",
            stemPresence: item.stemPresence || "",
            commonUses: item.commonUses || [],
          });
        }
      }
    });

    const matchArray = Array.from(uniqueMatches.values()).slice(0, 8);
    setCommonNameSuggestions(matchArray);
    // Don't auto-show here - only show when user focuses the input
  }, [form.commonName, allMushrooms]);

  // Generate scientific name suggestions (only populate list, don't auto-show)
  useEffect(() => {
    if (!form.scientificName.trim() || !allMushrooms.length) {
      setScientificNameSuggestions([]);
      return;
    }

    const searchLower = form.scientificName.toLowerCase().trim();
    const uniqueMatches = new Map();

    allMushrooms.forEach((item) => {
      const itemScientificName = (item.scientificName || "").toLowerCase();
      
      if (itemScientificName.includes(searchLower)) {
        const key = item.scientificName;
        if (key && !uniqueMatches.has(key)) {
          uniqueMatches.set(key, {
            commonName: item.commonName || item.name || "Unknown",
            scientificName: item.scientificName,
            ecologicalRole: item.ecologicalRole || [],
            texture: item.texture || "",
            underside: item.underside || "",
            fruitingSurface: item.fruitingSurface || "",
            stemPresence: item.stemPresence || "",
            commonUses: item.commonUses || [],
          });
        }
      }
    });

    const matchArray = Array.from(uniqueMatches.values()).slice(0, 8);
    setScientificNameSuggestions(matchArray);
    // Don't auto-show here - only show when user focuses the input
  }, [form.scientificName, allMushrooms]);

  // Handle click outside for common name
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        commonNameSuggestionsRef.current &&
        !commonNameSuggestionsRef.current.contains(event.target) &&
        commonNameInputRef.current &&
        !commonNameInputRef.current.contains(event.target)
      ) {
        setShowCommonNameSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle click outside for scientific name
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        scientificNameSuggestionsRef.current &&
        !scientificNameSuggestionsRef.current.contains(event.target) &&
        scientificNameInputRef.current &&
        !scientificNameInputRef.current.contains(event.target)
      ) {
        setShowScientificNameSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleUse = (use) => {
    setForm(prev => ({
      ...prev,
      commonUses: prev.commonUses.includes(use)
        ? prev.commonUses.filter(u => u !== use)
        : [...prev.commonUses, use],
    }));
  };

  const toggleRole = (role) => {
    setForm(prev => ({
      ...prev,
      ecologicalRole: prev.ecologicalRole.includes(role)
        ? prev.ecologicalRole.filter(r => r !== role)
        : [...prev.ecologicalRole, role],
    }));
  };

  const handleCommonNameSelect = (suggestion) => {
    setForm({ 
      ...form, 
      commonName: suggestion.commonName,
      scientificName: suggestion.scientificName || form.scientificName,
      ecologicalRole: suggestion.ecologicalRole && suggestion.ecologicalRole.length > 0 ? suggestion.ecologicalRole : form.ecologicalRole,
      texture: suggestion.texture || form.texture,
      underside: suggestion.underside || form.underside,
      fruitingSurface: suggestion.fruitingSurface || form.fruitingSurface,
      stemPresence: suggestion.stemPresence || form.stemPresence,
      commonUses: suggestion.commonUses && suggestion.commonUses.length > 0 ? suggestion.commonUses : form.commonUses,
    });
    setShowCommonNameSuggestions(false);
  };

  const handleScientificNameSelect = (suggestion) => {
    setForm({ 
      ...form, 
      scientificName: suggestion.scientificName,
      commonName: suggestion.commonName || form.commonName,
      ecologicalRole: suggestion.ecologicalRole && suggestion.ecologicalRole.length > 0 ? suggestion.ecologicalRole : form.ecologicalRole,
      texture: suggestion.texture || form.texture,
      underside: suggestion.underside || form.underside,
      fruitingSurface: suggestion.fruitingSurface || form.fruitingSurface,
      stemPresence: suggestion.stemPresence || form.stemPresence,
      commonUses: suggestion.commonUses && suggestion.commonUses.length > 0 ? suggestion.commonUses : form.commonUses,
    });
    setShowScientificNameSuggestions(false);
  };

  const submit = async (action) => {
    try {
      const res = await fetch(`/api/admin/mushrooms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, action }),
      });
      if (!res.ok) throw new Error("Action failed");
      toast.success(`Submission ${action} successfully`);
      setTimeout(() => router.push("/admin/mushrooms"), 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!mushroom) return;

    try {
      const res = await fetch(`/api/mushrooms/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete mushroom");
      }

      toast.success("Mushroom deleted successfully");
      setTimeout(() => router.push("/admin/mushrooms"), 1000);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete mushroom");
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-b border-emerald-700/20 shadow-xl shadow-emerald-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-6 bg-white/20 rounded w-48 animate-pulse" />
              <div className="h-4 bg-white/10 rounded w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Image skeleton */}
          <div className="lg:col-span-4">
            <div className="aspect-square bg-white rounded-2xl border-2 border-stone-200 animate-pulse" />
          </div>
          {/* Form skeleton */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 space-y-4">
              <div className="h-6 bg-stone-200 rounded w-1/3 animate-pulse" />
              <div className="h-10 bg-stone-100 rounded-xl animate-pulse" />
              <div className="h-10 bg-stone-100 rounded-xl animate-pulse" />
              <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-100 pb-32">
      {/* HEADER - Modern Gradient */}
      <header className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 border-b border-emerald-700/20 shadow-xl shadow-emerald-500/10 sticky top-0 z-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-wrap justify-between items-center gap-4 relative">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all border border-white/20 backdrop-blur-sm group"
            >
              <ChevronLeft className="w-5 h-5 text-white group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hidden sm:block">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight drop-shadow-lg flex items-center gap-2">
                    Review Submission
                    <StatusBadge status={form.status} />
                  </h1>
                  <p className="text-sm text-emerald-100/80 italic">{form.scientificName || "Unnamed Species"}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
             <button 
               onClick={() => submit("pending")} 
               className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white/90 hover:text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all backdrop-blur-sm flex items-center gap-2"
             >
               <Save className="w-4 h-4" />
               <span className="hidden sm:inline">Save Draft</span>
               <span className="sm:hidden">Save</span>
             </button>
             <button 
               onClick={() => submit("reject")} 
               className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-red-600 bg-white hover:bg-red-50 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 border border-red-100"
             >
               <XCircle className="w-4 h-4" />
               <span className="hidden sm:inline">Reject</span>
             </button>
             <button 
               onClick={() => submit("approve")} 
               className="px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2 border border-emerald-100"
             >
               <CheckCircle className="w-4 h-4" />
               <span className="hidden sm:inline">Approve Species</span>
               <span className="sm:hidden">Approve</span>
             </button>
             <button 
               onClick={handleDeleteClick} 
               className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all border border-white/20"
               title="Delete this submission permanently"
             >
               <Trash2 className="w-4 h-4" />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: IMAGES */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide">
                    Submission Images
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                {mushroom.images?.length > 0 ? (
                    mushroom.images.map((img, idx) => (
                        <div key={img.publicId || idx} className="group relative overflow-hidden rounded-2xl border-2 border-stone-200 bg-white p-2 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <img 
                                src={img.url} 
                                className="rounded-xl w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105" 
                                alt="Mushroom" 
                            />
                            {/* Image number badge */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                              {idx + 1} / {mushroom.images.length}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-200 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 gap-3">
                        <ImageIcon className="w-12 h-12" />
                        <span className="font-medium">No images provided</span>
                    </div>
                )}
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CORE INFO */}
            <section className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 border-2 border-stone-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-5 border-b border-stone-100 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="font-black text-slate-800 uppercase tracking-wide text-sm">Taxonomy & Description</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2 relative">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Common Name</label>
                  <input
                    ref={commonNameInputRef}
                    value={form.commonName}
                    onChange={(e) => setForm({ ...form, commonName: e.target.value })}
                    onFocus={() => commonNameSuggestions.length > 0 && setShowCommonNameSuggestions(true)}
                    className="w-full text-lg font-semibold bg-transparent border-b-2 border-stone-200 py-3 focus:border-emerald-500 outline-none transition-colors placeholder:text-stone-300"
                    placeholder="e.g. Fly Agaric"
                  />
                  
                  {/* Common Name Suggestions Dropdown */}
                  {showCommonNameSuggestions && commonNameSuggestions.length > 0 && (
                    <div
                      ref={commonNameSuggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-2"
                    >
                      {commonNameSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleCommonNameSelect(suggestion)}
                          className="w-full px-4 py-2.5 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-slate-800">
                              {suggestion.commonName}
                            </span>
                            {suggestion.scientificName && (
                              <span className="text-xs italic text-green-600">
                                {suggestion.scientificName}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Scientific Name</label>
                  <input
                    ref={scientificNameInputRef}
                    value={form.scientificName}
                    onChange={(e) => setForm({ ...form, scientificName: e.target.value })}
                    onFocus={() => scientificNameSuggestions.length > 0 && setShowScientificNameSuggestions(true)}
                    className="w-full text-lg font-semibold bg-transparent border-b-2 border-stone-200 py-3 focus:border-emerald-500 outline-none transition-colors italic placeholder:text-stone-300 placeholder:not-italic"
                    placeholder="e.g. Amanita muscaria"
                  />
                  
                  {/* Scientific Name Suggestions Dropdown */}
                  {showScientificNameSuggestions && scientificNameSuggestions.length > 0 && (
                    <div
                      ref={scientificNameSuggestionsRef}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-2"
                    >
                      {scientificNameSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleScientificNameSelect(suggestion)}
                          className="w-full px-4 py-2.5 text-left hover:bg-green-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm italic font-bold text-green-600">
                              {suggestion.scientificName}
                            </span>
                            {suggestion.commonName && (
                              <span className="text-xs text-slate-700">
                                {suggestion.commonName}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-gray-50/50 border border-gray-200 p-4 rounded-xl h-40 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all leading-relaxed"
                    placeholder="Detailed characteristics..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                      <Sprout className="w-3 h-3" /> Ecological Role
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ECOLOGICAL_ROLES.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                            form.ecologicalRole.includes(role) 
                              ? "bg-green-50 border-green-600 text-green-700" 
                              : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                          }`}
                        >
                          {role.replace(/-/g, " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Select label="Texture" icon={<Info className="w-3 h-3" />} value={form.texture} set={(v)=>setForm({...form, texture:v})} options={TEXTURES} />
                  <Select label="Underside" icon={<MapIcon className="w-3 h-3" />} value={form.underside} set={(v)=>setForm({...form, underside:v})} options={UNDERSIDES} />
                  <Select label="Fruiting Surface" icon={<MapIcon className="w-3 h-3" />} value={form.fruitingSurface} set={(v)=>setForm({...form, fruitingSurface:v})} options={FRUITING_SURFACES} />
                  <Select label="Stem Presence" icon={<Info className="w-3 h-3" />} value={form.stemPresence} set={(v)=>setForm({...form, stemPresence:v})} options={STEM_PRESENCE} />
                </div>
              </div>
            </section>

            {/* TAGS */}
            <section className="bg-white rounded-2xl shadow-lg shadow-stone-200/50 border-2 border-stone-200 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sprout className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="text-sm font-black text-slate-700 uppercase tracking-wide">Properties & Uses</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {COMMON_USES.map((use) => (
                  <button
                    key={use}
                    onClick={() => toggleUse(use)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 hover:-translate-y-0.5 ${
                      form.commonUses.includes(use) 
                        ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md shadow-emerald-100" 
                        : "bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:shadow-md"
                    }`}
                  >
                    {use.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </section>

            {/* REVIEW BOX */}
            <section className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 overflow-hidden shadow-lg shadow-amber-100/50">
              <div className="p-5 bg-gradient-to-r from-amber-100 to-orange-100 border-b border-amber-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-700" />
                </div>
                <h2 className="font-black text-amber-800 text-sm uppercase tracking-wide">Administrative Review</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-black text-amber-700/80 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Internal Notes (Private)
                  </label>
                  <textarea
                    value={form.adminNotes}
                    onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                    className="w-full mt-2 border-2 border-amber-200 p-4 rounded-xl h-28 bg-white/80 focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 outline-none transition-all"
                    placeholder="Log internal thoughts here..."
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-red-600/80 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    Rejection Reason (Publicly visible to submitter)
                  </label>
                  <textarea
                    value={form.rejectionReason}
                    onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
                    className="w-full mt-2 border-2 border-red-200 p-4 rounded-xl h-28 bg-white/80 focus:ring-2 focus:ring-red-500/30 focus:border-red-400 outline-none transition-all"
                    placeholder="Explain why this was rejected..."
                  />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Submission"
        message={`Are you sure you want to delete "${mushroom?.commonName || "this mushroom"}"? This action cannot be undone.${
          mushroom?.status === "approved"
            ? "\n\nNote: This will also remove the point from the submitter."
            : ""
        }`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmColor="red"
      />
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-emerald-100 text-emerald-700 border-emerald-300 shadow-emerald-100",
    rejected: "bg-red-100 text-red-700 border-red-300 shadow-red-100",
    pending: "bg-amber-100 text-amber-700 border-amber-300 shadow-amber-100",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${styles[status] || styles.pending}`}>
      {status || "pending"}
    </span>
  );
}

function Select({ label, value, set, options, icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </label>
      <div className="relative">
        <select 
          value={value} 
          onChange={(e) => set(e.target.value)} 
          className="w-full appearance-none bg-gray-50 border border-gray-200 p-2.5 px-4 rounded-xl text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer"
        >
          <option value="">Select Option</option>
          {options.map((o) => (
            <option key={o} value={o}>{o.replace(/-/g, " ")}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    </div>
  );
}