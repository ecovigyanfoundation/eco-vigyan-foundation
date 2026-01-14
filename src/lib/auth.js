import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

/**
 * Get the authenticated user from NextAuth session or legacy JWT token
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export async function getAuthenticatedUser() {
  try {
    await connectDB();
    
    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const user = await User.findById(session.user.id);
      if (user && !user.isBanned) {
        return { user, error: null };
      }
    }

    // Fallback to legacy JWT token
    let token = null;
    try {
      const cookieStore = await cookies();
      token = cookieStore.get("token")?.value;
    } catch (err) {
      // Ignore cookie errors
    }

    if (token && process.env.JWT_SECRET) {
      try {
        const decodedToken = decodeURIComponent(token);
        const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && !user.isBanned) {
          return { user, error: null };
        }
      } catch (err) {
        // Token verification failed
      }
    }

    return { user: null, error: "Unauthorized" };
  } catch (error) {
    console.error("Auth error:", error);
    return { user: null, error: "Authentication failed" };
  }
}
