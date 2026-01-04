import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Trail from "@/models/Trail";
import User from "@/models/User";

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

// GET - Get all trails
// Normal users: only trails created by admins
// Admins: all trails
export async function GET(req) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let trails;
    
    if (user.role === "admin") {
      // Admins can see all trails
      trails = await Trail.find()
        .populate("user", "name username")
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Normal users can only see trails created by admins
      const adminUsers = await User.find({ role: "admin" }).select("_id");
      const adminIds = adminUsers.map(u => u._id);
      
      trails = await Trail.find({ user: { $in: adminIds } })
        .populate("user", "name username")
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ trails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trails:", error);
    return NextResponse.json(
      { error: "Failed to fetch trails" },
      { status: 500 }
    );
  }
}

// POST - Create a new trail (admin only)
export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create trails
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create trails" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, location, mushrooms } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Trail name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "Trail name must be 50 characters or less" },
        { status: 400 }
      );
    }

    if (!mushrooms || !Array.isArray(mushrooms) || mushrooms.length === 0) {
      return NextResponse.json(
        { error: "Trail must have at least one mushroom" },
        { status: 400 }
      );
    }

    const trail = await Trail.create({
      name: name.trim(),
      user: user._id,
      location: location || {},
      mushrooms: mushrooms,
    });

    const trailData = trail.toObject();
    return NextResponse.json({ trail: trailData }, { status: 201 });
  } catch (error) {
    console.error("Error creating trail:", error);
    return NextResponse.json(
      { error: "Failed to create trail" },
      { status: 500 }
    );
  }
}

