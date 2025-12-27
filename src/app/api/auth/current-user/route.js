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

    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    // Decode URL-encoded token
    const decodedToken = decodeURIComponent(token);
    const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    
    // Check if user exists and is not banned
    if (!user || user.isBanned) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Current user error:", error.message);
    return NextResponse.json({ user: null });
  }
}
