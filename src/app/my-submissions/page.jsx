"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Image as ImageIcon,
  ArrowLeft,
  Filter,
} from "lucide-react";

export default function MySubmissionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mushrooms, setMushrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    all: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    fetchSubmissions();
  }, [statusFilter, user, router]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url =
        statusFilter === "all"
          ? "/api/mushrooms/my-submissions"
          : `/api/mushrooms/my-submissions?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to fetch submissions");
      }

      setMushrooms(data.mushrooms || []);
      if (data.counts) {
        setCounts(data.counts);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      setMushrooms([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
          <Clock size={12} />
          Pending Review
        </span>
      ),
      approved: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
          <CheckCircle size={12} />
          Approved
        </span>
      ),
      rejected: (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <XCircle size={12} />
          Rejected
        </span>
      ),
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-bold mb-2"
              >
                <ArrowLeft size={16} />
                Back to Explore
              </Link>
              <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight">
                My <span className="text-emerald-600">Submissions</span>
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View and track your mushroom observations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* STATUS FILTERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { value: "all", label: "All", icon: Filter },
            { value: "pending", label: "Pending", icon: Clock },
            { value: "approved", label: "Approved", icon: CheckCircle },
            { value: "rejected", label: "Rejected", icon: XCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = statusFilter === tab.value;
            const count =
              tab.value === "all"
                ? counts.all
                : counts[tab.value] || 0;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600"
                }`}
              >
                <Icon size={18} />
                {tab.label}
                {count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm font-bold text-red-800">{error}</p>
          </div>
        )}

        {/* MUSHROOMS LIST */}
        {mushrooms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">
                No submissions found
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {statusFilter === "all"
                  ? "You haven't submitted any mushrooms yet. Start contributing to the database!"
                  : `You don't have any ${statusFilter} submissions.`}
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors"
              >
                Submit Your First Mushroom
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mushrooms.map((mushroom) => (
              <div
                key={mushroom._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 hover:shadow-xl transition-all"
              >
                {/* IMAGE */}
                <div className="aspect-video bg-gray-100 relative overflow-hidden">
                  {mushroom.images && mushroom.images.length > 0 ? (
                    <img
                      src={mushroom.images[0].url}
                      alt={mushroom.commonName || "Mushroom"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="text-gray-300" size={48} />
                    </div>
                  )}
                  {/* STATUS BADGE OVERLAY */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(mushroom.status)}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-5">
                  <h3 className="font-black text-lg text-gray-900 mb-3 line-clamp-1">
                    {mushroom.commonName || "Unnamed Mushroom"}
                  </h3>

                  {/* METADATA */}
                  <div className="space-y-2 text-sm mb-4">
                    {mushroom.location && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="font-medium">
                          {mushroom.location.latitude.toFixed(4)},{" "}
                          {mushroom.location.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="font-medium">
                        Submitted: {formatDate(mushroom.createdAt)}
                      </span>
                    </div>

                    {mushroom.photoDateTime && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="font-medium">
                          Photo taken: {formatDate(mushroom.photoDateTime)}
                        </span>
                      </div>
                    )}

                    {mushroom.status === "approved" && mushroom.approvedAt && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle size={14} />
                        <span className="font-medium">
                          Approved: {formatDate(mushroom.approvedAt)}
                        </span>
                      </div>
                    )}

                    {mushroom.status === "rejected" && mushroom.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-xs font-bold text-red-800 mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-xs text-red-700">
                          {mushroom.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CLASSIFICATION INFO (if available) */}
                  {(mushroom.ecologicalRole ||
                    mushroom.texture ||
                    mushroom.underside ||
                    mushroom.fruitingSurface ||
                    mushroom.stemPresence ||
                    (mushroom.commonUses && mushroom.commonUses.length > 0)) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Classification
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        {mushroom.ecologicalRole && (
                          <p>
                            <span className="font-bold">Role:</span>{" "}
                            {mushroom.ecologicalRole}
                          </p>
                        )}
                        {mushroom.texture && (
                          <p>
                            <span className="font-bold">Texture:</span>{" "}
                            {mushroom.texture}
                          </p>
                        )}
                        {mushroom.underside && (
                          <p>
                            <span className="font-bold">Underside:</span>{" "}
                            {mushroom.underside}
                          </p>
                        )}
                        {mushroom.fruitingSurface && (
                          <p>
                            <span className="font-bold">Surface:</span>{" "}
                            {mushroom.fruitingSurface}
                          </p>
                        )}
                        {mushroom.stemPresence && (
                          <p>
                            <span className="font-bold">Stem:</span>{" "}
                            {mushroom.stemPresence}
                          </p>
                        )}
                        {mushroom.commonUses && mushroom.commonUses.length > 0 && (
                          <p>
                            <span className="font-bold">Uses:</span>{" "}
                            {mushroom.commonUses.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {mushroom.scientificName && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Scientific Name
                      </p>
                      <p className="text-sm font-medium text-emerald-700 italic">
                        {mushroom.scientificName}
                      </p>
                    </div>
                  )}

                  {mushroom.description && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Description
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-3">
                        {mushroom.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

