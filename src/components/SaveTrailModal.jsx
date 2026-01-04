"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

export default function SaveTrailModal({ isOpen, onClose, onSave, mushroomCount }) {
  const [trailName, setTrailName] = useState("");
  const [error, setError] = useState("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTrailName(`Trail ${new Date().toLocaleDateString()}`);
      setError("");
    } else {
      setTrailName("");
      setError("");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedName = trailName.trim();
    if (!trimmedName) {
      setError("Please enter a trail name");
      return;
    }

    if (trimmedName.length > 50) {
      setError("Trail name must be 50 characters or less");
      return;
    }

    onSave(trimmedName);
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
        <div className="flex items-center justify-between p-6 border-b border-blue-100">
          <h2 className="text-xl font-black text-blue-950 uppercase tracking-wider">
            Save Trail
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-blue-50 text-blue-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="trail-name" className="block text-sm font-bold text-blue-900 mb-2">
                Trail Name
              </label>
              <input
                id="trail-name"
                type="text"
                value={trailName}
                onChange={(e) => {
                  setTrailName(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter trail name"
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-blue-900 font-medium"
                autoFocus
                maxLength={50}
              />
              {error && (
                <p className="mt-2 text-xs text-red-600 font-semibold">{error}</p>
              )}
              <p className="mt-2 text-xs text-blue-600/70">
                {mushroomCount} {mushroomCount === 1 ? 'mushroom' : 'mushrooms'} will be saved
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              <span>Save Trail</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

