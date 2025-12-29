import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export async function POST(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */

    // Get token from cookies - try multiple methods for better mobile compatibility
    let token = null;
    
    // Method 1: Try reading from request headers first (most reliable for mobile)
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
    
    // Method 2: Fallback to cookies() API if header method didn't work
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get("token")?.value;
      } catch (err) {
        console.error("Error reading cookies:", err);
        // Continue - we already tried headers
      }
    }

    if (!token) {
      console.error("No token found in request. Cookie header:", cookieHeader ? "present" : "missing");
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
    }

    let decoded;
    try {
      // Handle URL-encoded token
      const decodedToken = decodeURIComponent(token);
      decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err);
      return NextResponse.json({ error: "Invalid or expired token - Please log in again" }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      console.error("User not found or banned:", { userId: decoded.id, isBanned: user?.isBanned });
      return NextResponse.json({ error: "Unauthorized - Account issue" }, { status: 401 });
    }

    // Generate Cloudinary upload signature
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "mushrooms";
    
    // Create signature - parameters must be sorted alphabetically
    // Format: param1=value1&param2=value2 + API_SECRET
    const paramsString = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsString + process.env.CLOUDINARY_API_SECRET)
      .digest("hex");

    return NextResponse.json({
      signature,
      timestamp,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Signature generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}

