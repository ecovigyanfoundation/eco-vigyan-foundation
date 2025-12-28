"use client";

import { X } from "lucide-react";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  { ssr: false }
);

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelect,
  selectedLocation,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white border border-stone-200 w-full max-w-4xl rounded-[2.5rem] p-8 shadow-2xl relative animate-in zoom-in-95 duration-300">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
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
              onSelect(location);
              onClose();
            }}
          />
        </div>

        {/* INFO */}
        {selectedLocation && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-sm font-bold text-emerald-900">
              Selected: {selectedLocation.latitude.toFixed(5)},{" "}
              {selectedLocation.longitude.toFixed(5)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}






