"use client";

import { getMushroomImage, getDisplayName } from "@/components/mushroomImageMap";

export default function MushroomBadge({ category, use, variant = "small" }) {
  // Safely convert category to string (handles arrays like ecologicalRole)
  const categoryStr = Array.isArray(category) 
    ? category[0] 
    : (typeof category === 'string' ? category : null);
  
  const useStr = Array.isArray(use) 
    ? use[0] 
    : (typeof use === 'string' ? use : null);
  
  // Get the icon for the ecological role (category)
  const categoryIcon = categoryStr ? getMushroomImage(categoryStr.toLowerCase()) : null;
  // Get the icon for the common use
  const useIcon = useStr ? getMushroomImage(useStr.toLowerCase()) : null;
  
  // Determine which icon to display (prioritize use, fallback to category)
  const iconSrc = useIcon || categoryIcon;
  
  // Format category for display
  const displayCategory = categoryStr 
    ? getDisplayName(categoryStr) 
    : "Unknown";

  return (
    <div
      className={`flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-full ${
        variant === "small" ? "px-2 py-0.5" : "px-4 py-2"
      }`}
    >
      {iconSrc ? (
        <img 
          src={iconSrc} 
          alt={displayCategory}
          className={`object-contain ${variant === "small" ? "w-4 h-4" : "w-6 h-6"}`}
        />
      ) : (
        <div className={`rounded-full bg-emerald-500/50 ${variant === "small" ? "w-3 h-3" : "w-5 h-5"}`} />
      )}
      <span
        className={`font-black uppercase tracking-tighter text-white ${
          variant === "small" ? "text-[9px]" : "text-xs"
        }`}
      >
        {displayCategory}
      </span>
    </div>
  );
}
