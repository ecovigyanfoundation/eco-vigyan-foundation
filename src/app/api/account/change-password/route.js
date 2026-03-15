import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    let user = null;

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      user = await User.findById(session.user.id).select("+password");
    }

    // Fallback to legacy JWT token
    if (!user) {
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

      if (token && process.env.JWT_SECRET) {
        try {
          const decodedToken = decodeURIComponent(token);
          const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
          user = await User.findById(decoded.id).select("+password");
        } catch (err) {
          console.error("JWT verification error:", err);
        }
      }
    }

    if (!user || user.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ================= VALIDATION ================= */
    
    // Check if user signed in with Google (cannot change password)
    if (user.authProvider === "google") {
      return NextResponse.json(
        { error: "Cannot change password for Google accounts" },
        { status: 400 }
      );
    }

    // Check if user has a password (credential-based users)
    if (!user.password) {
      return NextResponse.json(
        { error: "No password set for this account" },
        { status: 400 }
      );
    }

    /* ================= PASSWORD CHANGE ================= */
    const body = await req.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old password and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password change error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}
