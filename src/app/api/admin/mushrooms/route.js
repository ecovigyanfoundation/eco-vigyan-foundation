import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";
import User from "@/models/User";

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
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const admin = await User.findById(decoded.id);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    /* ================= QUERY ================= */

    const { searchParams } = new URL(req.url);
    
    // Check if requesting counts only
    const countsOnly = searchParams.get("countsOnly") === "true";
    
    if (countsOnly) {
      // Return counts for all statuses
      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        Mushroom.countDocuments({ status: "pending" }),
        Mushroom.countDocuments({ status: "approved" }),
        Mushroom.countDocuments({ status: "rejected" }),
      ]);

      return NextResponse.json(
        {
          counts: {
            pending: pendingCount,
            approved: approvedCount,
            rejected: rejectedCount,
          },
        },
        { status: 200 }
      );
    }

    const status = searchParams.get("status") || "pending";

    if (!["pending", "approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status filter" },
        { status: 400 }
      );
    }

    const mushrooms = await Mushroom.find({ status })
      .populate("submittedBy", "name username")
      .sort({ createdAt: -1 })
      .select(
        "commonName images location status submittedBy createdAt"
      );

    return NextResponse.json({ mushrooms }, { status: 200 });
  } catch (error) {
    console.error("Admin list mushrooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mushrooms" },
      { status: 500 }
    );
  }
}
