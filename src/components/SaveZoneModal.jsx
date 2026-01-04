"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function SaveZoneModal({ isOpen, onClose, onSave, zoneData }) {
  const [zoneName, setZoneName] = useState("");
  const [category, setCategory] = useState("decomposer");
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoneName("");
      setCategory("decomposer");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = zoneName.trim();
    if (!trimmedName) {
      setError("Please enter a zone name");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Zone name must be 100 characters or less");
      return;
    }

    if (!category) {
      setError("Please select a category");
      return;
    }

    onSave({
      name: trimmedName,
      category,
      boundary: zoneData?.boundary,
      center: zoneData?.center,
      shapeType: zoneData?.type,
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-emerald-100">
          <h2 className="text-xl font-black text-emerald-950 uppercase tracking-wider">
            Save Zone
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="zone-name" className="block text-sm font-bold text-emerald-900 mb-2">
                Zone Name
              </label>
              <input
                id="zone-name"
                type="text"
                value={zoneName}
                onChange={(e) => {
                  setZoneName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter zone name"
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-emerald-900 font-medium"
                autoFocus
                maxLength={100}
              />
              {error && (
                <p className="mt-2 text-xs text-red-600 font-semibold">{error}</p>
              )}
            </div>

            <div>
              <label htmlFor="zone-category" className="block text-sm font-bold text-emerald-900 mb-2">
                Category
              </label>
              <select
                id="zone-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setError("");
                }}
                className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-emerald-900 font-medium bg-white"
              >
                <option value="decomposer">Decomposer</option>
                <option value="symbiont">Symbiont</option>
                <option value="parasitic">Parasitic</option>
              </select>
              <p className="mt-2 text-xs text-emerald-600/70">
                Select the ecological role category for this zone
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>Save Zone</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

