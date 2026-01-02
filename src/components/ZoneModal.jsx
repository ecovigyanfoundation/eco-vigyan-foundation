"use client";

import { useState } from "react";
import { X, MapPin, Square, Circle, Search, Loader2 } from "lucide-react";
import { getCityBoundary } from "@/lib/geocoding";
import { useAuth } from "@/context/AuthContext";

export default function ZoneModal({ isOpen, onClose, onZoneSelect, onDrawingModeSelect }) {
  const { user } = useAuth();
  const isAdmin = user && user.role === "admin";
  const [cityName, setCityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("city"); // "city" or "draw"

  const handleCitySearch = async () => {
    if (!cityName.trim()) {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const boundary = await getCityBoundary(cityName.trim());
      
      if (boundary) {
        onZoneSelect(boundary);
        onClose();
      } else {
        setError("Could not find geographical boundary for this city. Please try a different city name or use the Draw Area option to manually draw a boundary.");
      }
    } catch (err) {
      setError("Failed to fetch city boundary. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawRectangle = () => {
    onDrawingModeSelect("rectangle");
    onClose();
  };

  const handleDrawCircle = () => {
    onDrawingModeSelect("circle");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
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
            Select Zone
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-emerald-100">
          <button
            onClick={() => setActiveTab("city")}
            className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wide transition-colors ${
              activeTab === "city"
                ? "text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50"
                : "text-emerald-600/60 hover:text-emerald-700 hover:bg-emerald-50/30"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MapPin size={16} />
              <span>Search City</span>
            </div>
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("draw")}
              className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wide transition-colors ${
                activeTab === "draw"
                  ? "text-emerald-700 border-b-2 border-emerald-500 bg-emerald-50/50"
                  : "text-emerald-600/60 hover:text-emerald-700 hover:bg-emerald-50/30"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Square size={16} />
                <span>Draw Area</span>
              </div>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "city" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-emerald-900 mb-2">
                  Enter City Name
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400"
                    />
                    <input
                      type="text"
                      value={cityName}
                      onChange={(e) => setCityName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleCitySearch();
                        }
                      }}
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-emerald-900 placeholder:text-emerald-300"
                    />
                  </div>
                  <button
                    onClick={handleCitySearch}
                    disabled={loading}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                )}
              </div>
              <p className="text-xs text-emerald-600/70">
                The map will zoom to the city and highlight its geographical boundary.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-emerald-900 font-medium mb-4">
                Choose a drawing tool to create a custom zone on the map:
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleDrawRectangle}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Square size={24} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    Rectangle
                  </span>
                  <span className="text-xs text-emerald-600/70 text-center">
                    Click and drag to draw a rectangular area
                  </span>
                </button>
                <button
                  onClick={handleDrawCircle}
                  className="flex flex-col items-center gap-3 p-6 border-2 border-emerald-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <div className="w-12 h-12 flex items-center justify-center bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Circle size={24} className="text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-emerald-900 uppercase tracking-wide">
                    Circle
                  </span>
                  <span className="text-xs text-emerald-600/70 text-center">
                    Click center and drag to set radius
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-emerald-100 bg-emerald-50/30">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

