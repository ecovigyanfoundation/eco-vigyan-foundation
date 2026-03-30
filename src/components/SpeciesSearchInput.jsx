"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

export default function SpeciesSearchInput({
  searchQuery,
  onSearchChange,
  suggestions = [],
  onSuggestionClick
}) {
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  const handleInputChange = (e) => {
    onSearchChange(e.target.value);
    setShowAutocomplete(true);
  };

  const handleClear = () => {
    onSearchChange('');
    setShowAutocomplete(false);
  };

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    setShowAutocomplete(false);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowAutocomplete(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow suggestion click to register
    setTimeout(() => setShowAutocomplete(false), 200);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors z-10" size={18} />
          <input 
            type="text" 
            placeholder="Search species (common or scientific name)..." 
            className="w-full bg-emerald-50/50 rounded-2xl py-3 pl-12 pr-10 text-sm focus:outline-none border border-transparent focus:border-emerald-200 focus:bg-white transition-all shadow-inner" 
            value={searchQuery} 
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          {searchQuery && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-100 rounded-lg transition-colors z-10"
            >
              <X size={16} className="text-emerald-400" />
            </button>
          )}
        </div>
        
        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showAutocomplete && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-white rounded-xl border border-emerald-200 shadow-xl overflow-hidden z-50"
            >
              <div className="p-2 space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm text-emerald-900 font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
