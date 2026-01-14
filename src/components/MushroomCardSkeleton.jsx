"use client";

// Shimmer skeleton loading component
export function MushroomCardSkeleton() {
  return (
    <div className="group bg-white border border-stone-200 rounded-[2.5rem] p-3 relative">
      {/* IMAGE SKELETON with shimmer */}
      <div className="aspect-square animate-shimmer rounded-[2rem] mb-4 overflow-hidden relative shadow-inner">
        {/* Category badge skeleton */}
        <div className="absolute top-3 left-3 w-16 h-6 bg-stone-300/30 rounded-lg" />
      </div>

      {/* INFO SKELETON */}
      <div className="px-3 pb-2">
        {/* Title skeleton */}
        <div className="h-4 animate-shimmer rounded-lg mb-2 w-3/4" />
        
        {/* Subtitle skeleton */}
        <div className="h-2 animate-shimmer rounded mb-2 w-1/2" />

        {/* Footer skeleton */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-pulse" />
            <div className="h-2 animate-shimmer rounded w-16" />
          </div>
          <div className="w-2 h-2 bg-stone-200/50 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Grid of skeleton loaders
export function MushroomGridSkeleton({ count = 30 }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <MushroomCardSkeleton key={index} />
      ))}
    </div>
  );
}
