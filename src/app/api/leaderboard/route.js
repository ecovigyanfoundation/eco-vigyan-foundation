import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10; // Default to 10 per page
    const skip = (page - 1) * limit;

    // Aggregate to count approved observations per user
    const aggregationPipeline = [
      // Match only approved mushroom observations
      {
        $match: {
          status: "approved",
        },
      },
      // Group by submittedBy (user) and count observations
      {
        $group: {
          _id: "$submittedBy",
          observationCount: { $sum: 1 },
        },
      },
      // Lookup user details
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      // Unwind user details
      {
        $unwind: "$userDetails",
      },
      // Filter out banned users
      {
        $match: {
          "userDetails.isBanned": false,
        },
      },
      // Project only needed fields
      {
        $project: {
          _id: "$userDetails._id",
          name: "$userDetails.name",
          username: "$userDetails.username",
          email: "$userDetails.email",
          dp: "$userDetails.dp",
          role: "$userDetails.role",
          observationCount: 1,
        },
      },
      // Sort by observation count (descending)
      {
        $sort: { observationCount: -1 },
      },
    ];

    // Get total count of contributors
    const totalResult = await Mushroom.aggregate([
      ...aggregationPipeline,
      { $count: "total" },
    ]);
    const totalContributors = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(totalContributors / limit);

    // Get paginated contributors
    const topContributors = await Mushroom.aggregate([
      ...aggregationPipeline,
      { $skip: skip },
      { $limit: limit },
    ]);

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


