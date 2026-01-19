"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, Award, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function Leaderboard() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContributors, setTotalContributors] = useState(0);
  const ITEMS_PER_PAGE = 10;

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

  const getRankIcon = (rank) => {
    if (rank === 1) {
      return <Trophy className="w-6 h-6 text-yellow-500" />;
    } else if (rank === 2) {
      return <Medal className="w-6 h-6 text-gray-400" />;
    } else if (rank === 3) {
      return <Award className="w-6 h-6 text-amber-600" />;
    }
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <span className="text-xs font-black text-emerald-400">{rank}</span>
      </div>
    );
  };

  const getRankBadge = (rank) => {
    if (rank === 1) {
      return "bg-gradient-to-r from-yellow-500 to-yellow-600";
    } else if (rank === 2) {
      return "bg-gradient-to-r from-gray-400 to-gray-500";
    } else if (rank === 3) {
      return "bg-gradient-to-r from-amber-600 to-amber-700";
    }
    return "bg-gray-800";
  };

  // Shimmer skeleton component
  const SkeletonCard = ({ rank }) => (
    <div
      className={`bg-white rounded-2xl border-2 border-stone-200 overflow-hidden ${
        rank <= 3 ? "shadow-lg" : "shadow-sm"
      }`}
    >
      <div
        className={`${
          rank === 1
            ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
            : rank === 2
            ? "bg-gradient-to-r from-gray-400 to-gray-500"
            : rank === 3
            ? "bg-gradient-to-r from-amber-600 to-amber-700"
            : "bg-gray-800"
        } px-6 py-4 flex items-center gap-4`}
      >
        {/* Rank Icon Skeleton */}
        <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse shrink-0" />

        {/* Profile Picture Skeleton */}
        <div className="w-14 h-14 rounded-full bg-white/20 animate-pulse shrink-0" />

        {/* User Info Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 bg-white/20 rounded-lg w-32 animate-pulse shimmer-effect" />
          <div className="h-3 bg-white/20 rounded-lg w-20 animate-pulse shimmer-effect" />
        </div>

        {/* Points Skeleton */}
        <div className="shrink-0">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
            <div className="h-3 bg-white/30 rounded w-10 mb-2 animate-pulse shimmer-effect" />
            <div className="h-7 bg-white/30 rounded w-12 animate-pulse shimmer-effect" />
          </div>
        </div>
      </div>

      {/* Badge area skeleton for top 3 */}
      {rank <= 3 && (
        <div className="px-6 py-2 bg-stone-50 border-t border-stone-200">
          <div className="h-4 bg-stone-200 rounded w-36 animate-pulse shimmer-effect" />
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 flex-1 min-h-full h-full overflow-y-auto bg-stone-50 custom-scrollbar">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-stone-200 pb-8">
            <div className="space-y-2">
              <div className="h-3 bg-stone-200 rounded w-32 animate-pulse shimmer-effect" />
              <div className="h-8 bg-stone-200 rounded w-52 animate-pulse shimmer-effect" />
              <div className="h-4 bg-stone-200 rounded w-72 animate-pulse shimmer-effect" />
            </div>
            <div className="h-10 bg-stone-200 rounded-full w-40 animate-pulse shimmer-effect" />
          </div>

          {/* Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((rank) => (
              <SkeletonCard key={rank} rank={rank} />
            ))}
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
      <div className="max-w-4xl mx-auto">
        {/* SECTION HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-b border-stone-200 pb-8">
          <div>
            <span className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Community Recognition
            </span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
              Top <span className="text-emerald-600">Contributors</span>
            </h2>
            <p className="text-stone-500 text-sm mt-2">
              Earn points for each approved mushroom submission
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-stone-200 bg-white shadow-sm">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="text-stone-400 font-bold text-xs uppercase tracking-widest">
              {totalContributors} Contributors
            </span>
          </div>
        </div>

        {/* LEADERBOARD LIST */}
        {contributors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="text-stone-400" size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                No contributors yet
              </h3>
              <p className="text-sm text-gray-600">
                Be the first to submit an approved mushroom observation!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {contributors.map((contributor, index) => {
              // Calculate global rank based on current page
              const rank = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;
              return (
                <div
                  key={contributor._id || contributor.id}
                  className={`bg-white rounded-2xl border-2 border-stone-200 overflow-hidden transition-all hover:shadow-xl ${
                    rank <= 3 ? "shadow-lg" : "shadow-sm"
                  }`}
                >
                  <div
                    className={`${getRankBadge(
                      rank
                    )} px-6 py-4 flex items-center gap-4`}
                  >
                    {/* RANK ICON */}
                    <div className="shrink-0">{getRankIcon(rank)}</div>

                    {/* PROFILE PICTURE AND USER INFO - Clickable */}
                    <Link
                      href={`/user/${contributor._id || contributor.id}`}
                      className="flex items-center gap-4 flex-1 min-w-0 hover:opacity-90 transition-opacity"
                    >
                      {/* PROFILE PICTURE */}
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/50 shadow-lg shrink-0">
                        {contributor.dp?.url ? (
                          <img
                            src={contributor.dp.url}
                            alt={contributor.name || contributor.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center">
                            <UserIcon className="w-7 h-7 text-white" />
                          </div>
                        )}
                      </div>

                      {/* USER INFO */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-white text-lg truncate">
                          {contributor.name || contributor.username || "Anonymous"}
                        </h3>
                        <p className="text-white/80 text-xs font-medium truncate">
                          @{contributor.username || "user"}
                        </p>
                      </div>
                    </Link>

                    {/* POINTS */}
                    <div className="shrink-0 text-right">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mb-1">
                          Points
                        </p>
                        <p className="text-2xl font-black text-white">
                          {contributor.points || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BADGE FOR TOP 3 */}
                  {rank <= 3 && (
                    <div className="px-6 py-2 bg-stone-50 border-t border-stone-200">
                      <div className="flex items-center gap-2">
                        {rank === 1 && (
                          <span className="text-xs font-black text-yellow-600 uppercase tracking-wider">
                            🏆 Gold Medal Winner
                          </span>
                        )}
                        {rank === 2 && (
                          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                            🥈 Silver Medal Winner
                          </span>
                        )}
                        {rank === 3 && (
                          <span className="text-xs font-black text-amber-600 uppercase tracking-wider">
                            🥉 Bronze Medal Winner
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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


