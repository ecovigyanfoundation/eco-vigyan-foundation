"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Layers, Navigation } from "lucide-react";
import SpeciesSearchInput from "./SpeciesSearchInput";
import LocationSearchInput from "./LocationSearchInput";
import ActiveFiltersDisplay from "./ActiveFiltersDisplay";

export default function MapSidebar({
  isOpen,
  onClose,
  // Species search
  speciesSearchTerm,
  onSpeciesSearch,
  autocompleteSuggestions,
  onManualSearch,
  // Location (zone) search
  selectedZone,
  onZoneSelect,
  onZoneClear,
  // Data
  filteredCount,
  totalCount,
  // Actions
  onZonesClick,
  onTrailsClick
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
            className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm z-30 md:hidden" 
          />
          
          {/* Sidebar */}
          <motion.div 
            initial={{ x: -400, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }} 
            exit={{ x: -400, opacity: 0 }} 
            className="absolute md:relative w-[320px] md:w-[400px] bg-white border-r border-emerald-100 flex flex-col z-40 h-full shrink-0"
          >
            
            {/* Header & Content */}
            <div className="p-5 md:p-6 space-y-6 overflow-y-auto scrollbar-hide flex-1">
              {/* Discovery Hub Heading */}
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-emerald-950 text-lg">Discovery Hub</h3>
                <button 
                  onClick={onClose} 
                  className="md:hidden p-2 hover:bg-emerald-50 rounded-xl text-emerald-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Species Search with Autocomplete */}
              <SpeciesSearchInput 
                searchQuery={speciesSearchTerm}
                onSearchChange={onSpeciesSearch}
                suggestions={autocompleteSuggestions}
                onSuggestionClick={onManualSearch}
              />
              
              {/* Location Search with Autocomplete */}
              <LocationSearchInput 
                selectedZone={selectedZone}
                onZoneSelect={onZoneSelect}
                onZoneClear={onZoneClear}
              />
              
              {/* Zones & Trails Actions */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-emerald-900 mb-2">
                  Explore Tools
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={onZonesClick}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 hover:border-emerald-300 transition-all group"
                  >
                    <div className="p-2 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white transition-colors">
                      <Layers size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-emerald-900">Zones</span>
                  </button>
                  
                  <button
                    onClick={onTrailsClick}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 transition-all group"
                  >
                    <div className="p-2 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white transition-colors">
                      <Navigation size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-bold text-blue-900">Trails</span>
                  </button>
                </div>
              </div>
              
              {/* Active Filters Display */}
              {(speciesSearchTerm || selectedZone) && (
                <ActiveFiltersDisplay 
                  speciesSearchTerm={speciesSearchTerm}
                  selectedZone={selectedZone}
                  filteredCount={filteredCount}
                />
              )}
            </div>
            
            {/* Footer */}
            <div className="p-5 border-t border-emerald-100 bg-emerald-50/30 mt-auto">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-900 p-2.5 rounded-xl text-white shadow-lg">
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-emerald-900/40 uppercase tracking-widest leading-tight">
                    Live Observations
                  </div>
                  <div className="text-xs font-bold text-emerald-950 leading-tight">
                    {filteredCount} Data Points Active
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
