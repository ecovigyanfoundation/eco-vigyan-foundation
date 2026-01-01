import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return NextResponse.json({ user: null });
    }

    // ✅ MUST await cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Decode URL-encoded token (good that you handled this)
    const decodedToken = decodeURIComponent(token);

    const decoded = jwt.verify(
      decodedToken,
      process.env.JWT_SECRET
    );

    await connectDB();

    const user = await User.findById(decoded.id).select("-password");

    // Check if user exists and is not banned
    if (!user || user.isBanned) {
      return NextResponse.json({ user: null });
    }

    // Return user with id field (string) instead of _id (ObjectId) for consistency
    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        dp: user.dp,
        username: user.username,
        bio: user.bio,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Current user error:", error);
    return NextResponse.json({ user: null });
  }
}
