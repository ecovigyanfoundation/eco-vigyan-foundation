import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 per page
    const skip = (page - 1) * limit;

    // Get total count of users with points
    const totalContributors = await User.countDocuments({
      points: { $gt: 0 },
      isBanned: false,
    });

    const totalPages = Math.ceil(totalContributors / limit);

    // Fetch contributors for current page sorted by points (descending)
    const topContributors = await User.find({
      points: { $gt: 0 }, // Only users with points > 0
      isBanned: false, // Exclude banned users
    })
      .select("name username email dp points")
      .sort({ points: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(
      {
        contributors: topContributors,
        total: totalContributors,
        currentPage: page,
        totalPages: totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
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


