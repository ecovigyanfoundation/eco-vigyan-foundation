"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function Leaderboard() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContributors, setTotalContributors] = useState(0);
  const ITEMS_PER_PAGE = 12;
 
  const ProfileImage = ({ src, name, username }) => {
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
      return (
        <div className="w-full h-full bg-emerald-200 flex items-center justify-center">
          <UserIcon className="w-12 h-12 text-emerald-600" />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={name || username}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    );
  };

  useEffect(() => {
    fetchLeaderboard(currentPage);
  }, [currentPage]);

  const fetchLeaderboard = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?page=${page}&limit=${ITEMS_PER_PAGE}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch leaderboard");
      }

      setContributors(data.contributors || []);
      setTotalPages(data.totalPages || 1);
      setTotalContributors(data.total || 0);
      setError(null);
    } catch (err) {
      setError(err.message);
      setContributors([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Shimmer skeleton component - Grid version
  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-[32px] text-center border border-white shadow-lg">
      {/* Rank badge skeleton */}
      <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-emerald-100 animate-pulse" />
      
      {/* Avatar skeleton */}
      <div className="relative mb-6 mx-auto w-24 h-24">
        <div className="absolute inset-0 bg-emerald-100 rounded-full scale-110 animate-pulse" />
        <div className="relative rounded-full w-full h-full bg-emerald-200 animate-pulse border-4 border-white" />
      </div>
      
      {/* Name skeleton */}
      <div className="h-5 bg-emerald-100 rounded-lg w-32 mx-auto mb-2 animate-pulse shimmer-effect" />
      
      {/* Role skeleton */}
      <div className="h-3 bg-emerald-100 rounded-lg w-24 mx-auto mb-4 animate-pulse shimmer-effect" />
      
      {/* Points pill skeleton */}
      <div className="bg-emerald-50 py-2 px-4 rounded-xl inline-block">
        <div className="h-6 bg-emerald-200 rounded w-16 animate-pulse shimmer-effect" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 flex-1 min-h-full h-full overflow-y-auto bg-stone-50 custom-scrollbar">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-stone-200 pb-8">
            <div className="space-y-2">
              <div className="h-3 bg-stone-200 rounded w-32 animate-pulse shimmer-effect" />
              <div className="h-8 bg-stone-200 rounded w-52 animate-pulse shimmer-effect" />
              <div className="h-4 bg-stone-200 rounded w-72 animate-pulse shimmer-effect" />
            </div>
            <div className="h-10 bg-stone-200 rounded-full w-40 animate-pulse shimmer-effect" />
          </div>

          {/* Grid Skeleton */}
          <div className="bg-emerald-50 rounded-[48px] p-8 md:p-12">
            <div className="text-center mb-16">
              <div className="h-8 bg-emerald-200 rounded w-48 mx-auto mb-4 animate-pulse shimmer-effect" />
              <div className="h-4 bg-emerald-200 rounded w-64 mx-auto animate-pulse shimmer-effect" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Shimmer animation styles */}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          :global(.shimmer-effect) {
            position: relative;
            overflow: hidden;
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.4) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex-1 min-h-full h-full overflow-y-auto bg-stone-50 custom-scrollbar flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 flex-1 min-h-full h-full overflow-y-auto bg-stone-50 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        {/* LEADERBOARD GRID */}
        {contributors.length === 0 ? (
          <div className="bg-emerald-50 rounded-[48px] p-12">
            <div className="bg-white rounded-[32px] border border-emerald-100 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="text-emerald-600" size={32} />
                </div>
                <h3 className="text-lg font-black text-emerald-950 mb-2">
                  No contributors yet
                </h3>
                <p className="text-sm text-emerald-800/60">
                  Be the first to submit an approved mushroom observation!
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 rounded-[48px] p-8 md:p-12">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-serif text-emerald-950 mb-4">
                Top Contributors
              </h2>
              <p className="text-emerald-800/60">
                Fueling our scientific database.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contributors.map((contributor, index) => {
                // Calculate global rank based on current page
                const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
                const userRole = contributor.role || "Contributor";
                
                return (
                  <Link
                    key={contributor._id || contributor.id}
                    href={`/user/${contributor._id || contributor.id}`}
                    className="bg-white p-6 rounded-[32px] text-center border border-white shadow-lg relative cursor-pointer hover:shadow-2xl hover:scale-105 transition-all group"
                  >
                    {/* Rank badge - top left */}
                    <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center font-bold text-emerald-600 text-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      #{rank}
                    </div>

                    {/* Avatar with background decoration */}
                    <div className="relative mb-6 mx-auto w-24 h-24">
                      <div className="absolute inset-0 bg-emerald-100 rounded-full scale-110 group-hover:bg-emerald-200 transition-colors" />
                      <div className="relative rounded-full w-full h-full overflow-hidden border-4 border-white">
                        <ProfileImage 
                          src={contributor.dp?.url} 
                          name={contributor.name} 
                          username={contributor.username} 
                        />
                      </div>
                    </div>

                    {/* Name and role */}
                    <h4 className="font-bold text-emerald-950 mb-1 group-hover:text-emerald-700 transition-colors truncate">
                      {contributor.name || contributor.username || "Anonymous"}
                    </h4>
                    <p className="text-emerald-600 text-xs font-bold mb-4 truncate">
                      {userRole}
                    </p>

                    {/* Observations pill */}
                    <div className="bg-emerald-50 py-2 px-4 rounded-xl inline-block group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <span className="text-lg font-bold text-emerald-900 group-hover:text-white">
                        {contributor.observationCount || 0}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-900/40 uppercase ml-1 group-hover:text-white/80">
                        Observations
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                currentPage === 1
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                // Show first, last, current and adjacent pages
                const showPage =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - currentPage) <= 1;

                if (!showPage) {
                  // Show dots for skipped pages (only once)
                  if (
                    (pageNum === 2 && currentPage > 3) ||
                    (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={pageNum}
                        className="px-2 text-stone-400 font-bold"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      pageNum === currentPage
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                currentPage === totalPages
                  ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                  : "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300 shadow-sm"
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* INFO FOOTER */}
        <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <p className="text-sm text-emerald-800 font-medium text-center">
            <span className="font-black">How to earn points:</span> Submit mushroom
            observations and earn 1 point for each approved submission. Points are
            awarded when an admin approves your submission.
          </p>
        </div>
      </div>
    </div>
  );
}


