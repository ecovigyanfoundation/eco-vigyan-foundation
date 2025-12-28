"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

  // Initialize with empty strings, never null
  const [form, setForm] = useState({
    scientificName: "",
    description: "",
    ecologicalRole: "",
    texture: "",
    underside: "",
    fruitingSurface: "",
    stemPresence: "",
    commonUses: [],
    adminNotes: "",
    rejectionReason: "",
    status: "",
  });

  /* ================= FETCH MUSHROOM ================= */
  useEffect(() => {
    const fetchMushroom = async () => {
      try {
        const res = await fetch(`/api/admin/mushrooms/${id}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            toast.error("Unauthorized. Redirecting...");
            router.push("/login");
            return;
          }
          throw new Error(data.error || "Failed to fetch");
        }

        const m = data.mushroom;
        setMushroom(m);

        // FIX: The Nullish Coalescing operator (?? "") 
        // ensures that if a value is null, it becomes an empty string.
        setForm({
          scientificName: m.scientificName ?? "",
          description: m.description ?? "",
          ecologicalRole: m.ecologicalRole ?? "",
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
    
    // FIX: Only include 'id' here to keep the array size constant
  }, [id]); 

  /* ================= HANDLERS ================= */
  const toggleUse = (use) => {
    setForm(prev => ({
      ...prev,
      commonUses: prev.commonUses.includes(use)
        ? prev.commonUses.filter(u => u !== use)
        : [...prev.commonUses, use],
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
      toast.success("Action completed successfully");
      setTimeout(() => router.push("/admin/mushrooms"), 1000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading submission...</div>;
  if (!mushroom) return <div className="p-10 text-center">Mushroom not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* STICKY HEADER */}
      <header className="bg-white border-b sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Reviewing: <span className="italic font-medium text-gray-600">{form.scientificName || "Unnamed Species"}</span></h1>
            <p className="text-xs text-gray-400 font-mono">ID: {id}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
            form.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
            form.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 
            'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            {form.status || "pending"}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* IMAGES */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase">Gallery</h2>
          <div className="grid gap-4">
            {mushroom.images?.map((img) => (
              <img key={img.publicId} src={img.url} className="rounded-xl border shadow-sm w-full h-auto object-cover" alt="Mushroom" />
            ))}
          </div>
        </div>

        {/* DATA FORM */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Core Information</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Scientific Name</label>
              <input
                value={form.scientificName}
                onChange={(e) => setForm({ ...form, scientificName: e.target.value })}
                className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-2.5 rounded-lg h-32 focus:ring-2 focus:ring-green-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="Ecological Role" value={form.ecologicalRole} set={(v)=>setForm({...form, ecologicalRole:v})} options={ECOLOGICAL_ROLES} />
              <Select label="Texture" value={form.texture} set={(v)=>setForm({...form, texture:v})} options={TEXTURES} />
              <Select label="Underside" value={form.underside} set={(v)=>setForm({...form, underside:v})} options={UNDERSIDES} />
              <Select label="Fruiting Surface" value={form.fruitingSurface} set={(v)=>setForm({...form, fruitingSurface:v})} options={FRUITING_SURFACES} />
              <Select label="Stem Presence" value={form.stemPresence} set={(v)=>setForm({...form, stemPresence:v})} options={STEM_PRESENCE} />
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-bold text-gray-800 border-b pb-2">Common Uses</h2>
            <div className="flex flex-wrap gap-2">
              {COMMON_USES.map((use) => (
                <button
                  key={use}
                  onClick={() => toggleUse(use)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    form.commonUses.includes(use) ? "bg-green-600 border-green-600 text-white" : "bg-white text-gray-600 hover:border-green-300"
                  }`}
                >
                  {use.replace(/-/g, " ")}
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl border border-amber-200 bg-amber-50/30 space-y-4">
            <h2 className="font-bold text-amber-800 border-b border-amber-200 pb-2">Admin Review</h2>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Internal Admin Notes</label>
              <textarea
                value={form.adminNotes}
                onChange={(e) => setForm({ ...form, adminNotes: e.target.value })}
                className="w-full border p-2.5 rounded-lg h-24 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-red-500 uppercase">Rejection Reason (Public)</label>
              <textarea
                value={form.rejectionReason}
                onChange={(e) => setForm({ ...form, rejectionReason: e.target.value })}
                className="w-full border p-2.5 rounded-lg h-24 bg-white"
              />
            </div>
          </section>
        </div>
      </main>

      {/* ACTION BAR */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t p-4">
        <div className="max-w-6xl mx-auto flex gap-4">
          <button onClick={() => submit("approve")} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition">Approve</button>
          <button onClick={() => submit("reject")} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">Reject</button>
          <button onClick={() => submit("pending")} className="px-6 py-3 border font-bold rounded-xl hover:bg-gray-50">Reset to Pending</button>
        </div>
      </footer>
    </div>
  );
}

function Select({ label, value, set, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={(e) => set(e.target.value)} className="border p-2 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-green-500">
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o} value={o}>{o.replace(/-/g, " ")}</option>
        ))}
      </select>
    </div>
  );
}