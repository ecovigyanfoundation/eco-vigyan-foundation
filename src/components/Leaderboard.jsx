"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Award, User as UserIcon } from "lucide-react";

export default function Leaderboard() {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/leaderboard?limit=20");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch leaderboard");
      }

      setContributors(data.contributors || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      setContributors([]);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="p-8 h-full overflow-y-auto bg-stone-50 custom-scrollbar flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 h-full overflow-y-auto bg-stone-50 custom-scrollbar flex items-center justify-center">
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
    <div className="p-8 h-full overflow-y-auto bg-stone-50 custom-scrollbar">
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
              {contributors.length} Contributors
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
              const rank = index + 1;
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

