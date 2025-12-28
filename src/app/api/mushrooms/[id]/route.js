import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req, { params }) {
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

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    /* ================= AUTHORIZATION ================= */

    // Check if user is the owner or an admin
    const isOwner = mushroom.submittedBy.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: You can only delete your own submissions" },
        { status: 403 }
      );
    }

    /* ================= REMOVE POINTS IF APPROVED ================= */

    // If the mushroom was approved, remove the point from the submitter
    if (mushroom.status === "approved" && mushroom.submittedBy) {
      await User.findByIdAndUpdate(mushroom.submittedBy, {
        $inc: { points: -1 }, // Decrement points by 1
      });
    }

    /* ================= DELETE IMAGES FROM CLOUDINARY ================= */

    if (mushroom.images && mushroom.images.length > 0) {
      for (const image of mushroom.images) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (cloudinaryError) {
          console.error("Cloudinary delete error:", cloudinaryError);
          // Continue with database deletion even if Cloudinary deletion fails
        }
      }
    }

    /* ================= DELETE FROM DATABASE ================= */

    await Mushroom.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Mushroom deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete mushroom error:", error);
    return NextResponse.json(
      { error: "Failed to delete mushroom" },
      { status: 500 }
    );
  }
}

