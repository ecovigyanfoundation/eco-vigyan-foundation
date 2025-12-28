import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";

export async function GET(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */

    // Get token from cookies - await cookies() in Next.js 15+
    let token = null;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch (err) {
      console.error("Error reading cookies:", err);
      // Fallback: try reading from request headers
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const cookieObj = cookieHeader.split(";").reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split("=");
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {});
        token = cookieObj.token;
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      // Handle URL-encoded token
      const decodedToken = decodeURIComponent(token);
      decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    /* ================= QUERY ================= */

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // optional filter: pending, approved, rejected

    const query = { submittedBy: decoded.id };

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
      submittedBy: decoded.id,
      status: "pending",
    });
    const approvedCount = await Mushroom.countDocuments({
      submittedBy: decoded.id,
      status: "approved",
    });
    const rejectedCount = await Mushroom.countDocuments({
      submittedBy: decoded.id,
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

