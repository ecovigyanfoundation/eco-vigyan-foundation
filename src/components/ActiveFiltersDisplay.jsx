"use client";

export default function ActiveFiltersDisplay({
  speciesSearchTerm,
  selectedZone,
  filteredCount
}) {
  return (
    <div className="bg-gradient-to-r from-emerald-50 to-purple-50 border border-emerald-200 rounded-xl p-3 space-y-2">
      <div className="text-[10px] font-bold text-emerald-900/60 uppercase tracking-widest mb-2">
        Active Filters
      </div>
      
      {speciesSearchTerm && (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-emerald-900 font-medium">
            Species: {speciesSearchTerm}
          </span>
        </div>
      )}
      
      {selectedZone && (
        <div className="flex items-center gap-2 text-xs">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <span className="text-purple-900 font-medium">
            Location: {selectedZone.name || 'Custom Zone'}
          </span>
        </div>
      )}
      
      <div className="text-xs font-bold text-emerald-700 pt-1 border-t border-emerald-200/50">
        {filteredCount} observation{filteredCount !== 1 ? 's' : ''} found
      </div>
    </div>
  );
}
