"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { 
  CheckCircle, XCircle, Clock, Save, 
  ChevronLeft, Info, FlaskConical, Map, Sprout, Trash2
} from "lucide-react";
import ConfirmDialog from "@/components/ConfirmDialog";

/* ================= OPTIONS ================= */
const ECOLOGICAL_ROLES = ["decomposer", "symbiont", "parasite"];
const TEXTURES = ["soft-to-touch", "hard-to-touch", "jelly-like", "leathery"];
const UNDERSIDES = ["gills", "pores", "teeth", "ball-with-no-distinctive-bottom", "cup-with-no-distinctive-bottom", "star-with-no-distinctive-bottom", "jelly-with-no-distinctive-bottom", "sponge-with-no-distinctive-bottom"];
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

  const submit = async (action) => {
    if (action === "reject" && !form.rejectionReason?.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
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
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading submission data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  Review Submission
                </h1>
                <StatusBadge status={form.status} />
              </div>
              <p className="text-sm text-gray-500 italic">{form.scientificName || "Unnamed Species"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={() => submit("pending")} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-all border">
               Save Draft
             </button>
             <button onClick={() => submit("reject")} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 border border-red-200 transition-all">
               <XCircle className="w-4 h-4" /> Reject
             </button>
             <button onClick={() => submit("approve")} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 shadow-md shadow-green-200 transition-all">
               <CheckCircle className="w-4 h-4" /> Approve Species
             </button>
             <button 
               onClick={handleDeleteClick} 
               className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 shadow-md shadow-red-200 transition-all"
               title="Delete this submission permanently"
             >
               <Trash2 className="w-4 h-4" /> Delete
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: IMAGES */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Submission Images
                </h2>
                <div className="grid grid-cols-1 gap-4">
                {mushroom.images?.length > 0 ? (
                    mushroom.images.map((img, idx) => (
                        <div key={img.publicId || idx} className="group relative overflow-hidden rounded-2xl border bg-white p-2 shadow-sm">
                            <img 
                                src={img.url} 
                                className="rounded-xl w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" 
                                alt="Mushroom" 
                            />
                        </div>
                    ))
                ) : (
                    <div className="aspect-square bg-gray-100 rounded-2xl border-2 border-dashed flex items-center justify-center text-gray-400">
                        No images provided
                    </div>
                )}
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DATA */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* CORE INFO */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                <FlaskConical className="w-5 h-5 text-green-600" />
                <h2 className="font-bold text-gray-800">Taxonomy & Description</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Common Name</label>
                  <input
                    value={form.commonName}
                    onChange={(e) => setForm({ ...form, commonName: e.target.value })}
                    className="w-full text-lg font-medium bg-transparent border-b border-gray-200 py-2 focus:border-green-500 outline-none transition-colors"
                    placeholder="e.g. Fly Agaric"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Scientific Name</label>
                  <input
                    value={form.scientificName}
                    onChange={(e) => setForm({ ...form, scientificName: e.target.value })}
                    className="w-full text-lg font-medium bg-transparent border-b border-gray-200 py-2 focus:border-green-500 outline-none transition-colors"
                    placeholder="e.g. Amanita muscaria"
                  />
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
                  <Select label="Underside" icon={<Map className="w-3 h-3" />} value={form.underside} set={(v)=>setForm({...form, underside:v})} options={UNDERSIDES} />
                  <Select label="Fruiting Surface" icon={<Map className="w-3 h-3" />} value={form.fruitingSurface} set={(v)=>setForm({...form, fruitingSurface:v})} options={FRUITING_SURFACES} />
                  <Select label="Stem Presence" icon={<Info className="w-3 h-3" />} value={form.stemPresence} set={(v)=>setForm({...form, stemPresence:v})} options={STEM_PRESENCE} />
                </div>
              </div>
            </section>

            {/* TAGS */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Properties & Uses</h2>
              <div className="flex flex-wrap gap-2">
                {COMMON_USES.map((use) => (
                  <button
                    key={use}
                    onClick={() => toggleUse(use)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border-2 ${
                      form.commonUses.includes(use) 
                        ? "bg-green-50 border-green-600 text-green-700" 
                        : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {use.replace(/-/g, " ")}
                  </button>
                ))}
              </div>
            </section>

            {/* REVIEW BOX */}
            <section className="bg-[#FFFBEB] rounded-2xl border border-amber-200 overflow-hidden">
              <div className="p-4 bg-amber-100/50 border-b border-amber-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700" />
                <h2 className="font-bold text-amber-800 text-sm">Administrative Review</h2>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="text-xs font-bold text-amber-700/60 uppercase">Internal Notes (Private)</label>
                  <textarea
                    value={form.adminNotes}
                    onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                    className="w-full mt-1 border-amber-200 p-3 rounded-xl h-24 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                    placeholder="Log internal thoughts here..."
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-red-700/60 uppercase">Rejection Reason (Publicly visible to submitter)</label>
                  <textarea
                    value={form.rejectionReason}
                    onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
                    className="w-full mt-1 border-red-100 p-3 rounded-xl h-24 bg-white focus:ring-2 focus:ring-red-500/20 outline-none"
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
    approved: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
    pending: "bg-amber-100 text-amber-700 border-amber-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter border ${styles[status] || styles.pending}`}>
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