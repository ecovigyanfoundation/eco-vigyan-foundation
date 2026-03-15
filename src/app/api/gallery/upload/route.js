import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    // Authentication check
    const { user, error } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    // Check if user is writer or admin
    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can upload gallery images" },
        { status: 403 }
      );
    }

    // Validate Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Cloudinary is not configured" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image");
    const studentName = formData.get("studentName")?.trim();
    const schoolName = formData.get("schoolName")?.trim();
    const description = formData.get("description")?.trim() || "";
    
    // New optional fields
    const title = formData.get("title")?.trim() || "";
    const category = formData.get("category")?.trim() || "";
    const program = formData.get("program")?.trim() || "";
    const year = formData.get("year")?.trim() || "";
    const theme = formData.get("theme")?.trim() || "";

    // Validation
    if (!image || !studentName || !schoolName) {
      return NextResponse.json(
        { error: "Image, student name, and school name are required" },
        { status: 400 }
      );
    }

    // Validate image file
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (image.size > maxFileSize) {
      return NextResponse.json(
        { error: "Image file size must be less than 10MB" },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        { error: "Image must be in JPEG, PNG, or WebP format" },
        { status: 400 }
      );
    }

    // Validate text fields
    if (studentName.length < 2 || studentName.length > 100) {
      return NextResponse.json(
        { error: "Student name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (schoolName.length < 2 || schoolName.length > 100) {
      return NextResponse.json(
        { error: "School name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description must be less than 500 characters" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const buffer = Buffer.from(await image.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gallery",
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

    // Create gallery entry
    const galleryItem = await Gallery.create({
      image: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
      studentName,
      schoolName,
      description,
      title,
      category,
      program,
      year,
      theme,
      uploadedBy: user._id,
      status: "active",
    });

    // Populate uploadedBy for response
    await galleryItem.populate("uploadedBy", "name username");

    return NextResponse.json(
      {
        message: "Image uploaded successfully",
        galleryItem: {
          id: galleryItem._id.toString(),
          image: galleryItem.image,
          studentName: galleryItem.studentName,
          schoolName: galleryItem.schoolName,
          description: galleryItem.description,
          uploadedBy: galleryItem.uploadedBy,
          createdAt: galleryItem.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Gallery upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
