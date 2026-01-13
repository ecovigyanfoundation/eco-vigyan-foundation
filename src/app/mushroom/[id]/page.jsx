"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, User, Loader2 } from "lucide-react";
import MushroomBadge from "@/components/MushroomBadge";

const MiniMap = dynamic(() => import("@/components/MiniMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-stone-100">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
  ),
});

export default function MushroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [mushroom, setMushroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMushroom = async () => {
      try {
        const res = await fetch("/api/mushrooms");
        if (!res.ok) throw new Error("Failed to fetch mushrooms");
        
        const data = await res.json();
        const foundMushroom = data.mushrooms?.find(
          (m) => (m._id || m.id) === params.id
        );

        if (!foundMushroom) {
          setError("Mushroom not found");
        } else {
          setMushroom(foundMushroom);
        }
      } catch (err) {
        console.error("Error fetching mushroom:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMushroom();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-stone-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium">Loading mushroom details...</p>
        </div>
      </div>
    );
  }

  if (error || !mushroom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black text-stone-800 mb-2">
            {error || "Mushroom Not Found"}
          </h1>
          <p className="text-stone-600 mb-6">
            The mushroom you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/explore?view=grid")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
          >
            Back to Explore
          </button>
        </div>
      </div>
    );
  }

  const mushroomData = {
    latitude: mushroom.location?.latitude || mushroom.latitude,
    longitude: mushroom.location?.longitude || mushroom.longitude,
    name: mushroom.commonName || mushroom.name || "Unknown Mushroom",
    image: mushroom.images?.[0]?.url || mushroom.image,
    category: mushroom.ecologicalRole || mushroom.category || "Unknown",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-stone-50">
      {/* HEADER */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT COLUMN - Image and Basic Info */}
          <div className="space-y-6">
            {/* Image */}
            <div className="aspect-square bg-stone-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative">
              {mushroomData.image ? (
                <img
                  src={mushroomData.image}
                  alt={mushroomData.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
                  <MapPin size={60} strokeWidth={1} />
                  <span className="text-sm font-black uppercase tracking-wider mt-4">
                    No Photo Available
                  </span>
                </div>
              )}
              
              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <MushroomBadge
                  category={mushroomData.category}
                  use={mushroom.use || mushroom.commonUses?.[0] || "Unknown"}
                />
              </div>
            </div>

            {/* Contributor Info */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-200">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
                Contributed By
              </h3>
              <Link
                href={`/user/${mushroom.submittedBy?._id || mushroom.submittedBy?.id || ""}`}
                className="flex items-center gap-4 hover:bg-emerald-50 -m-2 p-2 rounded-2xl transition-colors"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-md flex-shrink-0">
                  {mushroom.submittedBy?.dp?.url ? (
                    <img
                      src={mushroom.submittedBy.dp.url}
                      alt={mushroom.submittedBy.name || "Contributor"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-stone-800 truncate">
                    {mushroom.submittedBy?.name || mushroom.submittedBy?.username || "Anonymous"}
                  </p>
                  <p className="text-xs text-stone-500 font-medium">
                    ID: {mushroom.submittedBy?._id?.slice(-8) || "Unknown"}
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* RIGHT COLUMN - Details */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-black text-emerald-900 mb-2 uppercase tracking-tight">
                {mushroom.commonName || mushroom.name || "Unknown Species"}
              </h1>
              {mushroom.scientificName && (
                <p className="text-xl italic text-emerald-600 font-semibold">
                  {mushroom.scientificName}
                </p>
              )}
            </div>

            {/* Observation Date */}
            <div className="flex items-center gap-2 text-stone-600">
              <Calendar size={18} className="text-emerald-600" />
              <span className="text-sm font-medium">
                Observed on {new Date(mushroom.photoDateTime || mushroom.createdAt || Date.now()).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Classification Details */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-200">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
                Classification
              </h3>
              <div className="space-y-3">
                {mushroom.ecologicalRole && (
                  <DetailRow label="Ecological Role" value={
                    Array.isArray(mushroom.ecologicalRole)
                      ? mushroom.ecologicalRole.join(", ")
                      : mushroom.ecologicalRole
                  } />
                )}
                {mushroom.texture && <DetailRow label="Texture" value={mushroom.texture} />}
                {mushroom.underside && <DetailRow label="Underside" value={mushroom.underside} />}
                {mushroom.fruitingSurface && <DetailRow label="Fruiting Surface" value={mushroom.fruitingSurface} />}
                {mushroom.stemPresence && <DetailRow label="Stem" value={mushroom.stemPresence} />}
                {mushroom.commonUses && mushroom.commonUses.length > 0 && (
                  <DetailRow 
                    label="Common Uses" 
                    value={mushroom.commonUses.join(", ")} 
                  />
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-stone-200">
              <h3 className="text-xs font-black uppercase tracking-widest text-stone-500 mb-4">
                Location
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-stone-700">
                  <MapPin size={18} className="text-emerald-600" />
                  <span className="text-sm font-medium">
                    {mushroomData.latitude?.toFixed(6)}, {mushroomData.longitude?.toFixed(6)}
                  </span>
                </div>
                
                {/* Mini Map */}
                <div className="h-64 rounded-2xl overflow-hidden border-2 border-stone-200">
                  <MiniMap
                    latitude={mushroomData.latitude}
                    longitude={mushroomData.longitude}
                    name={mushroomData.name}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-stone-100 last:border-b-0">
      <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm font-semibold text-stone-800 capitalize">
        {value}
      </span>
    </div>
  );
}
