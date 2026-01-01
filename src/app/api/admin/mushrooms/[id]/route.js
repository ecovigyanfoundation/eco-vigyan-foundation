import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";
import User from "@/models/User";

export async function GET(req, { params }) {
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

    /* ================= FETCH ================= */

    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;
    
    const mushroom = await Mushroom.findById(id)
      .populate("submittedBy", "name username email");

    if (!mushroom) {
      return NextResponse.json(
        { error: "Mushroom not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ mushroom }, { status: 200 });
  } catch (error) {
    console.error("Admin get mushroom error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mushroom" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
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

    /* ================= FETCH MUSHROOM ================= */

    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;
    
    const mushroom = await Mushroom.findById(id);
    if (!mushroom) {
      return NextResponse.json(
        { error: "Mushroom not found" },
        { status: 404 }
      );
    }

    /* ================= PARSE BODY ================= */

    const body = await req.json();
    const {
      commonName,
      scientificName,
      description,
      ecologicalRole,
      texture,
      underside,
      fruitingSurface,
      stemPresence,
      commonUses,
      adminNotes,
      action,
      rejectionReason,
    } = body;

    /* ================= UPDATE FIELDS ================= */

    const updateData = {};

    if (commonName !== undefined) {
      updateData.commonName = commonName || null;
    }
    if (scientificName !== undefined) {
      updateData.scientificName = scientificName || null;
    }
    if (description !== undefined) {
      updateData.description = description || null;
    }
    if (ecologicalRole !== undefined) {
      updateData.ecologicalRole = ecologicalRole || null;
    }
    if (texture !== undefined) {
      updateData.texture = texture || null;
    }
    if (underside !== undefined) {
      updateData.underside = underside || null;
    }
    if (fruitingSurface !== undefined) {
      updateData.fruitingSurface = fruitingSurface || null;
    }
    if (stemPresence !== undefined) {
      updateData.stemPresence = stemPresence || null;
    }
    if (commonUses !== undefined) {
      updateData.commonUses = Array.isArray(commonUses) ? commonUses : [];
    }
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes || null;
    }

    /* ================= HANDLE STATUS ================= */

    if (action === "approve") {
      const wasApproved = mushroom.status === "approved";
      updateData.status = "approved";
      updateData.reviewedBy = admin._id;
      updateData.approvedAt = new Date();
      updateData.rejectionReason = null;
      
      // Award points to the submitter if this is the first time being approved
      // (only if it wasn't already approved)
      if (!wasApproved && mushroom.submittedBy) {
        await User.findByIdAndUpdate(mushroom.submittedBy, {
          $inc: { points: 1 }, // Increment points by 1
        });
      }
    } else if (action === "reject") {
      const wasApproved = mushroom.status === "approved";
      updateData.status = "rejected";
      updateData.reviewedBy = admin._id;
      updateData.rejectionReason = rejectionReason || null;
      
      // Remove points if previously approved and now being rejected
      if (wasApproved && mushroom.submittedBy) {
        await User.findByIdAndUpdate(mushroom.submittedBy, {
          $inc: { points: -1 }, // Decrement points by 1
        });
      }
    } else if (action === "pending") {
      const wasApproved = mushroom.status === "approved";
      updateData.status = "pending";
      updateData.rejectionReason = null;
      
      // Remove points if previously approved and now set back to pending
      if (wasApproved && mushroom.submittedBy) {
        await User.findByIdAndUpdate(mushroom.submittedBy, {
          $inc: { points: -1 }, // Decrement points by 1
        });
      }
    }

    /* ================= SAVE ================= */

    Object.assign(mushroom, updateData);
    await mushroom.save();

    return NextResponse.json(
      { message: "Mushroom updated successfully", mushroom },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin update mushroom error:", error);
    return NextResponse.json(
      { error: "Failed to update mushroom" },
      { status: 500 }
    );
  }
}