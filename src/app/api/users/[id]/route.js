import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Mushroom from "@/models/Mushroom";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await connectDB();

    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Convert to string and validate ObjectId format
    const userIdString = String(id).trim();
    
    // Check if it's a valid MongoDB ObjectId (24 hex characters)
    if (!mongoose.Types.ObjectId.isValid(userIdString)) {
      console.error("Invalid user ID format:", {
        id,
        type: typeof id,
        stringValue: userIdString,
        length: userIdString.length
      });
      return NextResponse.json(
        { 
          error: "Invalid user ID format",
          details: `Received ID: ${userIdString} (length: ${userIdString.length})`
        },
        { status: 400 }
      );
    }

    // Find user by ID (use the validated string)
    const user = await User.findById(userIdString).select("-password -resetToken -resetTokenExpiry");

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is banned (don't show profile if banned)
    if (user.isBanned) {
      return NextResponse.json(
        { error: "User profile is not available" },
        { status: 403 }
      );
    }


    // Find all approved mushrooms submitted by this user
    const mushrooms = await Mushroom.find({
      submittedBy: userIdString,
      status: "approved",
    })
      .select(
        "commonName scientificName description ecologicalRole texture underside fruitingSurface stemPresence commonUses images location approvedAt createdAt"
      )
      .sort({ approvedAt: -1, createdAt: -1 });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          dp: user.dp,
          bio: user.bio,
          role: user.role,
          points: user.points,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        mushrooms,
        submissionCount: mushrooms.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("User profile API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}

