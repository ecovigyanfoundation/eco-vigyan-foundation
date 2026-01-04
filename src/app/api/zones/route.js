import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Zone from "@/models/Zone";
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

// GET - Get all zones (filtered by category if provided)
// Normal users: can view all zones
// Admins: can view all zones
export async function GET(req) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category"); // decomposer, symbiont, or parasitic

    let query = {};
    if (category && ["decomposer", "symbiont", "parasitic"].includes(category)) {
      query.category = category;
    }

    const zones = await Zone.find(query)
      .populate("user", "name username")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ zones }, { status: 200 });
  } catch (error) {
    console.error("Error fetching zones:", error);
    return NextResponse.json(
      { error: "Failed to fetch zones" },
      { status: 500 }
    );
  }
}

// POST - Create a new zone (admin only)
export async function POST(req) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only admins can create zones
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Only admins can create zones" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, category, boundary, center, shapeType } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Zone name is required" },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { error: "Zone name must be 100 characters or less" },
        { status: 400 }
      );
    }

    if (!category || !["decomposer", "symbiont", "parasitic"].includes(category)) {
      return NextResponse.json(
        { error: "Valid category is required (decomposer, symbiont, or parasitic)" },
        { status: 400 }
      );
    }

    if (!boundary || !Array.isArray(boundary) || boundary.length === 0) {
      return NextResponse.json(
        { error: "Zone boundary is required" },
        { status: 400 }
      );
    }

    if (!shapeType || !["rectangle", "circle", "polygon", "city"].includes(shapeType)) {
      return NextResponse.json(
        { error: "Valid shape type is required" },
        { status: 400 }
      );
    }

    const zone = await Zone.create({
      name: name.trim(),
      category,
      user: user._id,
      location: {
        type: "zone",
        center: center || {},
        boundary: boundary,
      },
      shapeType,
    });

    const zoneData = zone.toObject();
    return NextResponse.json({ zone: zoneData }, { status: 201 });
  } catch (error) {
    console.error("Error creating zone:", error);
    return NextResponse.json(
      { error: "Failed to create zone" },
      { status: 500 }
    );
  }
}

