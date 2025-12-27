import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// PUT - Update gallery item
export async function PUT(req, { params }) {
  try {
    await connectDB();

    // Authentication check
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get token from cookies - read from request headers
    let token = null;
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
    
    // Fallback: try using cookies() API if header method fails
    if (!token) {
      try {
        const cookieStore = cookies();
        if (cookieStore && typeof cookieStore.get === "function") {
          token = cookieStore.get("token")?.value;
        }
      } catch (error) {
        console.error("Error reading cookies:", error);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode URL-encoded token
    const decodedToken = decodeURIComponent(token);
    const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can perform this action" },
        { status: 403 }
      );
    }

    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;
    const galleryItem = await Gallery.findById(id);

    if (!galleryItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { studentName, schoolName, description } = body;

    // Validation
    if (studentName !== undefined) {
      const trimmed = studentName.trim();
      if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
        return NextResponse.json(
          { error: "Student name must be between 2 and 100 characters" },
          { status: 400 }
        );
      }
      galleryItem.studentName = trimmed;
    }

    if (schoolName !== undefined) {
      const trimmed = schoolName.trim();
      if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
        return NextResponse.json(
          { error: "School name must be between 2 and 100 characters" },
          { status: 400 }
        );
      }
      galleryItem.schoolName = trimmed;
    }

    if (description !== undefined) {
      const trimmed = description.trim();
      if (trimmed.length > 500) {
        return NextResponse.json(
          { error: "Description must be less than 500 characters" },
          { status: 400 }
        );
      }
      galleryItem.description = trimmed;
    }

    await galleryItem.save();
    await galleryItem.populate("uploadedBy", "name username");

    return NextResponse.json({
      message: "Gallery item updated successfully",
      galleryItem: {
        id: galleryItem._id.toString(),
        image: galleryItem.image,
        studentName: galleryItem.studentName,
        schoolName: galleryItem.schoolName,
        description: galleryItem.description,
        uploadedBy: galleryItem.uploadedBy,
        updatedAt: galleryItem.updatedAt,
      },
    });
  } catch (error) {
    console.error("Gallery update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update gallery item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete gallery item
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    // Authentication check
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get token from cookies - read from request headers
    let token = null;
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
    
    // Fallback: try using cookies() API if header method fails
    if (!token) {
      try {
        const cookieStore = cookies();
        if (cookieStore && typeof cookieStore.get === "function") {
          token = cookieStore.get("token")?.value;
        }
      } catch (error) {
        console.error("Error reading cookies:", error);
      }
    }

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Decode URL-encoded token
    const decodedToken = decodeURIComponent(token);
    const decoded = jwt.verify(decodedToken, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can perform this action" },
        { status: 403 }
      );
    }

    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;
    const galleryItem = await Gallery.findById(id);

    if (!galleryItem) {
      return NextResponse.json(
        { error: "Gallery item not found" },
        { status: 404 }
      );
    }

    // Delete image from Cloudinary
    try {
      await cloudinary.uploader.destroy(galleryItem.image.public_id);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete error:", cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete gallery item" },
      { status: 500 }
    );
  }
}

