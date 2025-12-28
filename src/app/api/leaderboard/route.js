import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit")) || 10; // Default to top 10

    // Fetch top contributors sorted by points (descending)
    const topContributors = await User.find({
      points: { $gt: 0 }, // Only users with points > 0
      isBanned: false, // Exclude banned users
    })
      .select("name username email dp points")
      .sort({ points: -1 })
      .limit(limit);

    // Get total count of users with points
    const totalContributors = await User.countDocuments({
      points: { $gt: 0 },
      isBanned: false,
    });

    return NextResponse.json(
      {
        contributors: topContributors,
        total: totalContributors,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

