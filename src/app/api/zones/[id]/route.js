import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Zone from "@/models/Zone";
import User from "@/models/User";
import mongoose from "mongoose";

// Helper function to get authenticated user
async function getAuthenticatedUser(req) {
  let token = null;
  try {
    const cookieStore = await cookies();
    token = cookieStore.get("token")?.value;
  } catch (err) {
    console.error("Error reading cookies:", err);
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
    return null;
  }

  try {
    const decodedToken = decodeURIComponent(token);
    const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return null;
    }
    return user;
  } catch (err) {
    console.error("JWT verification error:", err);
    return null;
  }
}

// GET - Get a specific zone
export async function GET(req, { params }) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid zone ID" },
        { status: 400 }
      );
    }

    const zone = await Zone.findById(id)
      .populate("user", "name username role")
      .lean();

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    return NextResponse.json({ zone }, { status: 200 });
  } catch (error) {
    console.error("Error fetching zone:", error);
    return NextResponse.json(
      { error: "Failed to fetch zone" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a zone (admin only)
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can delete zones
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can delete zones" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid zone ID" },
        { status: 400 }
      );
    }

    const zone = await Zone.findById(id);

    if (!zone) {
      return NextResponse.json({ error: "Zone not found" }, { status: 404 });
    }

    await Zone.deleteOne({ _id: id });

    return NextResponse.json(
      { message: "Zone deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting zone:", error);
    return NextResponse.json(
      { error: "Failed to delete zone" },
      { status: 500 }
    );
  }
}

