import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    let user = null;

    // Try NextAuth session first
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      user = await User.findById(session.user.id);
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
          user = await User.findById(decoded.id);
        } catch (err) {
          console.error("JWT verification error:", err);
        }
      }
    }

    if (!user || user.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ================= FORM DATA ================= */
    const formData = await req.formData();
    const bio = formData.get("bio")?.trim() || "";
    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const avatarUrl = formData.get("avatarUrl")?.trim();
    const dp = formData.get("dp");

    const updateData = {};

    // Update name if provided
    if (name) {
      updateData.name = name;
    }

    // Update email if provided (check uniqueness)
    if (email && email !== user.email) {
      // Prevent email changes for Google users
      if (user.authProvider === "google") {
        return NextResponse.json(
          { error: "Cannot change email for Google accounts" },
          { status: 400 }
        );
      }

      // Check if email is already taken
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase();
    }

    // Update bio if provided
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Update display picture from URL if provided
    if (avatarUrl && !dp) {
      // Delete old image from Cloudinary if exists (only if Cloudinary is configured)
      if (user.dp?.public_id && cloudinary?.uploader) {
        try {
          await cloudinary.uploader.destroy(user.dp.public_id);
        } catch (err) {
          console.error("Error deleting old image:", err);
          // Continue even if deletion fails
        }
      }

      updateData.dp = {
        public_id: "", // URL-based avatars don't have Cloudinary IDs
        url: avatarUrl,
      };
    }

    // Update display picture from file if provided
    if (dp && dp instanceof File && dp.size > 0) {
      // Validate file size (max 5MB)
      const maxFileSize = 5 * 1024 * 1024;
      if (dp.size > maxFileSize) {
        return NextResponse.json(
          { error: "Image must be under 5MB" },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(dp.type)) {
        return NextResponse.json(
          { error: "Invalid image format. Please use JPEG, PNG, or WebP." },
          { status: 400 }
        );
      }

      // Check if Cloudinary is configured
      if (!cloudinary?.uploader) {
        return NextResponse.json(
          { error: "Image upload is not configured. Please use avatar URL option instead." },
          { status: 503 }
        );
      }

      // Delete old image from Cloudinary if exists
      if (user.dp?.public_id) {
        try {
          await cloudinary.uploader.destroy(user.dp.public_id);
        } catch (err) {
          console.error("Error deleting old image:", err);
          // Continue even if deletion fails
        }
      }

      // Upload new image to Cloudinary
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

      updateData.dp = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -resetToken -resetTokenExpiry");

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id.toString(),
          name: updatedUser.name,
          username: updatedUser.username,
          email: updatedUser.email,
          dp: updatedUser.dp,
          bio: updatedUser.bio,
          role: updatedUser.role,
          points: updatedUser.points,
          isVerified: updatedUser.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Account update error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "An unexpected error occurred.",
      },
      { status: 500 }
    );
  }
}













