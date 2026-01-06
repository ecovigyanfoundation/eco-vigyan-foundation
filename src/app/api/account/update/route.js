import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
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

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      const decodedToken = decodeURIComponent(token);
      decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error("JWT verification error:", err);
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    /* ================= FORM DATA ================= */
    const formData = await req.formData();
    const bio = formData.get("bio")?.trim() || "";
    const dp = formData.get("dp");

    const updateData = {};

    // Update bio if provided
    if (bio !== undefined) {
      updateData.bio = bio;
    }

    // Update display picture if provided
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













