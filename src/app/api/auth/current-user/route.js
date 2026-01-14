import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // First try NextAuth session
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
      await connectDB();
      const user = await User.findById(session.user.id).select("-password");
      
      if (user && !user.isBanned) {
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
      }
    }

    // Fallback to legacy JWT token (backward compatibility)
    if (process.env.JWT_SECRET) {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;

      if (token) {
        const decodedToken = decodeURIComponent(token);
        const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);

        await connectDB();
        const user = await User.findById(decoded.id).select("-password");

        if (user && !user.isBanned) {
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
        }
      }
    }

    return NextResponse.json({ user: null });
  } catch (error) {
    console.error("Current user error:", error);
    return NextResponse.json({ user: null });
  }
}
