"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle,
  User as UserIcon,
  Award,
  Image as ImageIcon,
  ExternalLink,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import MushroomBadge from "@/components/MushroomBadge";

export default function UserProfilePage() {
  const params = useParams();
  const { user: currentUser } = useAuth();
  const userId = params?.id;
  const isOwnProfile = currentUser && currentUser.id === userId;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      setProfileData(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  if (loading) return <LoadingSkeleton />;
  if (error || !profileData) return <ErrorState error={error} />;

  const { user, mushrooms, submissionCount } = profileData;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* TOP NAVIGATION */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/explore"
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-all"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold tracking-tight uppercase">Back to Discovery</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT SIDEBAR: USER DETAILS */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200/60 overflow-hidden relative">
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 z-0" />
              
              <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left">
                {/* Avatar */}
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-300">
                    {user.dp?.url ? (
                      <img src={user.dp.url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                        <UserIcon className="w-12 h-12 text-white" />
                      </div>
                    )}
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg border-2 border-white">
                      <CheckCircle className="w-5 h-5 fill-current" />
                    </div>
                  )}
                </div>

                {/* Identity */}
                <div className="flex items-center justify-between w-full mb-2">
                  <h1 className="text-3xl font-black text-slate-900 leading-tight">
                    {user.name}
                  </h1>
                  {isOwnProfile && (
                    <Link
                      href="/account"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                      title="Account Settings"
                    >
                      <Settings className="w-5 h-5 text-emerald-600" />
                    </Link>
                  )}
                </div>
                <p className="text-emerald-600 font-bold text-sm mb-3">@{user.username}</p>
                
                {/* Role Badge */}
                {user.role && (
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
                      user.role === "admin" 
                        ? "bg-red-100 text-red-700 border-red-200" 
                        : user.role === "writer"
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-emerald-100 text-emerald-700 border-emerald-200"
                    }`}>
                      {user.role === "admin" && "👑"}
                      {user.role === "writer" && "✍️"}
                      {user.role === "user" && "🌱"}
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                )}
                
                {/* Bio */}
                <div className="mb-6">
                  {user.bio ? (
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-slate-400 text-sm italic">
                      No bio available
                    </p>
                  )}
                </div>

                <div className="w-full h-px bg-stone-100 mb-6" />

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 w-full">
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-1">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Posts</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{submissionCount}</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Points</span>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{user.points || 0}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
            
            {/* Encouragement Card */}
            <div className="bg-emerald-900 rounded-3xl p-6 text-white shadow-lg shadow-emerald-900/20">
              <h4 className="font-bold mb-1">Community Expert</h4>
              <p className="text-emerald-200 text-xs leading-relaxed">
                Contributing to local biodiversity helps scientists track fungal health worldwide.
              </p>
            </div>
          </aside>

          {/* RIGHT SIDE: SUBMISSIONS */}
          <section className="lg:col-span-8">
            <div className="flex items-end justify-between mb-8 px-2">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Submissions</h2>
                <p className="text-slate-500 font-medium">Verified field observations</p>
              </div>
              <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                {submissionCount} Total
              </div>
            </div>

            {mushrooms.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {mushrooms.map((mushroom) => (
                  <MushroomCard key={mushroom._id} mushroom={mushroom} formatDate={formatDate} />
                ))}
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
}

/* HELPER COMPONENTS FOR CLEANER CODE */

function MushroomCard({ mushroom, formatDate }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg hover:shadow-emerald-900/5 transition-all duration-300 group">
      <div className="aspect-square relative overflow-hidden">
        {mushroom.images?.[0]?.url ? (
          <img
            src={mushroom.images[0].url}
            alt={mushroom.commonName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-stone-300" />
          </div>
        )}
        <div className="absolute top-2 left-2 scale-75 origin-top-left">
          <MushroomBadge
            category={mushroom.ecologicalRole}
            use={mushroom.commonUses?.[0]}
          />
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-black text-sm text-slate-900 mb-0.5 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {mushroom.commonName || "Unknown Species"}
        </h3>
        {mushroom.scientificName && (
          <p className="text-xs font-medium text-emerald-700 italic mb-2 line-clamp-1">
            {mushroom.scientificName}
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-50">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
              {formatDate(mushroom.approvedAt || mushroom.createdAt)}
            </span>
          </div>
          <button className="p-1.5 bg-stone-50 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ExternalLink size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 p-20 text-center">
      <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-300">
        <ImageIcon size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-800">No findings yet</h3>
      <p className="text-slate-500">This researcher's field journal is currently empty.</p>
    </div>
  );
}

function ErrorState({ error }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Profile Unreachable</h2>
                <p className="text-slate-500 mb-6">{error}</p>
                <Link href="/explore" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">Return Home</Link>
            </div>
        </div>
    )
}