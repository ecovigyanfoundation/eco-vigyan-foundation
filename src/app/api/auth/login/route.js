import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      );
    }

    // Trim the input
    const trimmedInput = email.trim();
    
    // Determine if input is email or username
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmail = emailRegex.test(trimmedInput.toLowerCase());
    
    // Build query - check either email or username
    let user;
    if (isEmail) {
      // If it's an email, search by email
      user = await User.findOne({ email: trimmedInput.toLowerCase() }).select("+password");
    } else {
      // If it's not an email, search by username (convert to lowercase since schema has lowercase: true)
      user = await User.findOne({ username: trimmedInput.toLowerCase() }).select("+password");
    }
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // ✅ SET HTTP-ONLY COOKIE
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const isProduction = process.env.NODE_ENV === "production";
    
    // URL encode token to handle special characters safely
    const encodedToken = encodeURIComponent(token);
    const cookieString = `token=${encodedToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict${isProduction ? "; Secure" : ""}`;
    
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        dp: user.dp,
        username: user.username,
      },
    }, {
      headers: {
        "Set-Cookie": cookieString,
      },
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
