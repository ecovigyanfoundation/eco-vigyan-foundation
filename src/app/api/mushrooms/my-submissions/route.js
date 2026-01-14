import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    const { user, error } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    /* ================= QUERY ================= */

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // optional filter: pending, approved, rejected

    const query = { submittedBy: user._id };

    if (status && ["pending", "approved", "rejected"].includes(status)) {
      query.status = status;
    }

    const mushrooms = await Mushroom.find(query)
      .select(
        "commonName images location status submittedBy createdAt photoDateTime ecologicalRole texture underside fruitingSurface stemPresence commonUses scientificName description rejectionReason approvedAt"
      )
      .sort({ createdAt: -1 });

    // Get counts for each status
    const pendingCount = await Mushroom.countDocuments({
      submittedBy: user._id,
      status: "pending",
    });
    const approvedCount = await Mushroom.countDocuments({
      submittedBy: user._id,
      status: "approved",
    });
    const rejectedCount = await Mushroom.countDocuments({
      submittedBy: user._id,
      status: "rejected",
    });

    return NextResponse.json(
      {
        mushrooms,
        counts: {
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          all: pendingCount + approvedCount + rejectedCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User submissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}
