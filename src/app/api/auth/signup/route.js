import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name")?.trim();
    const username = formData.get("username")?.trim().toLowerCase();
    const email = formData.get("email")?.trim().toLowerCase();
    const password = formData.get("password");
    const dp = formData.get("dp");

    /* ---------------- VALIDATION ---------------- */
    if (!name || !username || !email || !password || !dp) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 6 characters)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Validate username (alphanumeric and underscore, 3-20 chars)
    const usernameRegex = /^[a-z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters and contain only lowercase letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    // Validate name (2-50 characters)
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    /* ---------------- CHECK USER ---------------- */
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 409 }
      );
    }

    /* ---------------- UPLOAD DP ---------------- */
    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables." },
        { status: 500 }
      );
    }

    // Validate image file
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    
    // Check if dp is a valid File object
    if (!dp || !(dp instanceof File)) {
      return NextResponse.json(
        { error: "Profile picture is required and must be a valid image file" },
        { status: 400 }
      );
    }

    if (dp.size === 0 || dp.size > maxFileSize) {
      return NextResponse.json(
        { error: "Image file size must be between 1 byte and 5MB" },
        { status: 400 }
      );
    }

    // Check file type - handle mobile browsers that might send different MIME types
    const fileType = dp.type ? dp.type.toLowerCase() : "";
    const fileName = dp.name ? dp.name.toLowerCase() : "";
    
    // Check if type is in allowed list, or if filename has valid extension (for mobile browsers that might not set MIME type correctly)
    const hasValidExtension = fileName.match(/\.(jpg|jpeg|png|webp)$/);
    const isValidType = allowedTypes.includes(fileType) || 
                       (fileType.startsWith("image/") && hasValidExtension) ||
                       (!fileType && hasValidExtension); // Fallback for browsers that don't set MIME type
    
    if (!isValidType) {
      return NextResponse.json(
        { error: "Image must be in JPEG, PNG, or WebP format" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await dp.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "users",
          resource_type: "image",
        },
        (err, result) => {
          if (err) {
            console.error("Cloudinary upload error:", err);
            reject(new Error(`Image upload failed: ${err.message || "Unknown error"}`));
            return;
          }
          if (!result) {
            reject(new Error("Image upload failed: No result returned"));
            return;
          }
          resolve(result);
        }
      );

      uploadStream.end(buffer);
    });

    /* ---------------- HASH PASSWORD ---------------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------------- CREATE USER ---------------- */
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      authProvider: "credentials",
      role: "user",
      points: 0,
      dp: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    /* ---------------- JWT ---------------- */
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ---------------- RESPONSE WITH COOKIE ---------------- */
    const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
    const isProduction = process.env.NODE_ENV === "production";
    
    // Use Next.js 15 cookies() function for better mobile compatibility
    try {
      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax", // Changed from Strict to Lax for better mobile compatibility
        maxAge: maxAge,
        path: "/",
      });
    } catch (cookieError) {
      console.error("Error setting cookie:", cookieError);
      // Fallback to manual cookie setting if cookies() fails
      const encodedToken = encodeURIComponent(token);
      const cookieString = `token=${encodedToken}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
      
      const response = NextResponse.json(
        {
          message: "Signup successful",
          user: {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
          },
        },
        { 
          status: 201,
          headers: {
            "Set-Cookie": cookieString,
          },
        }
      );
      return response;
    }
    
    const response = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    return response;
  } catch (error) {
    console.error("Signup Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    // Return appropriate status code based on error type
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { 
        error: error.message || "Something went wrong",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: statusCode }
    );
  }
}
