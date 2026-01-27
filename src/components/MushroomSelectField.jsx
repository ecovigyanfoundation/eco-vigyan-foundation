"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { getMushroomImage, getDisplayName } from "./mushroomImageMap";

export default function MushroomSelectField({ label, value, onChange, options, showIcons = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const formatLabel = (val) => {
    return getDisplayName(val);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedLabel = value ? formatLabel(value) : "— Select (Optional) —";
  const selectedIcon = value ? getMushroomImage(value) : null;

  return (
    <div className="block">
      <span className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
        {label}
      </span>
      
      <div className="relative" ref={dropdownRef}>
        {/* Custom Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-stone-100 border border-stone-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium text-stone-800 text-sm flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            {showIcons && selectedIcon && (
              <img src={selectedIcon} alt="" className="w-5 h-5 object-contain" />
            )}
            <span className={value ? "" : "text-stone-500"}>{selectedLabel}</span>
          </div>
          <ChevronDown 
            size={16} 
            className={`text-stone-400 transition-transform ${isOpen ? "rotate-180" : ""}`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-stone-200 rounded-xl shadow-xl max-h-64 overflow-y-auto">
            {/* Empty option */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors text-sm ${
                !value ? "bg-emerald-50 text-emerald-700 font-medium" : "text-stone-500"
              }`}
            >
              — Select (Optional) —
            </button>
            
            {/* Options with icons */}
            {options.map((o) => {
              const icon = showIcons ? getMushroomImage(o) : null;
              const isSelected = value === o;
              
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => handleSelect(o)}
                  className={`w-full px-4 py-3 text-left hover:bg-emerald-50 transition-colors text-sm flex items-center gap-2 ${
                    isSelected ? "bg-emerald-50 text-emerald-700 font-medium" : "text-stone-800"
                  }`}
                >
                  {icon && (
                    <img src={icon} alt="" className="w-5 h-5 object-contain" />
                  )}
                  <span>{formatLabel(o)}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
