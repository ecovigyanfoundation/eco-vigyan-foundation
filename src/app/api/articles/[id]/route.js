import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getAuthenticatedUser } from "@/lib/auth";

// GET - Fetch a single article by ID (public)
export async function GET(req, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid article ID" },
        { status: 400 }
      );
    }

    const article = await Article.findOne({
      _id: id,
      status: "active",
    })
      .populate("uploadedBy", "name username dp")
      .select("-__v");

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const articleData = {
      _id: article._id.toString(),
      title: article.title,
      content: article.content,
      images: article.images,
      uploadedBy: article.uploadedBy,
      status: article.status,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };

    return NextResponse.json({ article: articleData }, { status: 200 });
  } catch (error) {
    console.error("Article fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch article" },
      { status: 500 }
    );
  }
}

// PUT - Update article
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const { user, error } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can perform this action" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid article ID" },
        { status: 400 }
      );
    }

    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("title")?.trim();
    const content = formData.get("content")?.trim();
    const image1 = formData.get("image1");
    const image2 = formData.get("image2");
    const removeImage1 = formData.get("removeImage1") === "true";
    const removeImage2 = formData.get("removeImage2") === "true";

    // Validation
    if (title !== undefined && title !== null) {
      if (!title || title.length < 5 || title.length > 200) {
        return NextResponse.json(
          { error: "Title must be between 5 and 200 characters" },
          { status: 400 }
        );
      }
      article.title = title;
    }

    if (content !== undefined && content !== null) {
      if (!content || content.length < 50 || content.length > 10000) {
        return NextResponse.json(
          { error: "Content must be between 50 and 10000 characters" },
          { status: 400 }
        );
      }
      article.content = content;
    }

    // Handle image updates
    const maxFileSize = 10 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    let updatedImages = [...article.images];

    // Remove images if requested
    if (removeImage1 && updatedImages.length > 0) {
      const imageToRemove = updatedImages[0];
      try {
        await cloudinary.uploader.destroy(imageToRemove.public_id);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
      updatedImages = updatedImages.slice(1);
    }

    if (removeImage2 && updatedImages.length > 1) {
      const imageToRemove = updatedImages[1];
      try {
        await cloudinary.uploader.destroy(imageToRemove.public_id);
      } catch (err) {
        console.error("Error deleting image from Cloudinary:", err);
      }
      updatedImages = updatedImages.slice(0, 1);
    }

    // Add new images
    if (image1 && image1 instanceof File && image1.size > 0) {
      if (image1.size > maxFileSize) {
        return NextResponse.json(
          { error: "Image 1 file size must be less than 10MB" },
          { status: 400 }
        );
      }
      if (!allowedTypes.includes(image1.type)) {
        return NextResponse.json(
          { error: "Image 1 must be in JPEG, PNG, or WebP format" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await image1.arrayBuffer());
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "articles", resource_type: "image" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      if (updatedImages.length === 0) {
        updatedImages.push({
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        });
      } else {
        try {
          await cloudinary.uploader.destroy(updatedImages[0].public_id);
        } catch (err) {
          console.error("Error deleting old image:", err);
        }
        updatedImages[0] = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    }

    if (image2 && image2 instanceof File && image2.size > 0) {
      if (updatedImages.length >= 2) {
        return NextResponse.json(
          { error: "Maximum 2 images allowed" },
          { status: 400 }
        );
      }

      if (image2.size > maxFileSize) {
        return NextResponse.json(
          { error: "Image 2 file size must be less than 10MB" },
          { status: 400 }
        );
      }
      if (!allowedTypes.includes(image2.type)) {
        return NextResponse.json(
          { error: "Image 2 must be in JPEG, PNG, or WebP format" },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await image2.arrayBuffer());
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "articles", resource_type: "image" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      updatedImages.push({
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      });
    }

    article.images = updatedImages;
    await article.save();
    await article.populate("uploadedBy", "name username dp");

    return NextResponse.json({
      message: "Article updated successfully",
      article: {
        id: article._id.toString(),
        title: article.title,
        content: article.content,
        images: article.images,
        uploadedBy: article.uploadedBy,
        updatedAt: article.updatedAt,
      },
    });
  } catch (error) {
    console.error("Article update error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update article" },
      { status: 500 }
    );
  }
}

// DELETE - Delete article
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const { user, error } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can perform this action" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid article ID" },
        { status: 400 }
      );
    }

    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // Delete images from Cloudinary
    for (const image of article.images) {
      try {
        await cloudinary.uploader.destroy(image.public_id);
      } catch (cloudinaryError) {
        console.error("Cloudinary delete error:", cloudinaryError);
      }
    }

    await Article.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Article delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete article" },
      { status: 500 }
    );
  }
}
