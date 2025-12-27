import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET - Fetch a single article by ID
export async function GET(req, { params }) {
  try {
    await connectDB();

    // In Next.js 15+, params is a Promise that must be awaited
    const { id } = await params;

    // Validate ObjectId format
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

    // Convert to plain object to ensure proper JSON serialization
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
      { 
        error: error.message || "Failed to fetch article",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update article
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

    // Validate ObjectId format
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
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    let updatedImages = [...article.images];

    // Remove images if requested
    if (removeImage1 && updatedImages.length > 0) {
      const imageToRemove = updatedImages[0];
      try {
        await cloudinary.uploader.destroy(imageToRemove.public_id);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
      updatedImages = updatedImages.slice(1);
    }

    if (removeImage2 && updatedImages.length > 1) {
      const imageToRemove = updatedImages[1];
      try {
        await cloudinary.uploader.destroy(imageToRemove.public_id);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
      updatedImages = updatedImages.slice(0, 1);
    }

    // Add new images (ensure max 2 total)
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
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "articles",
            resource_type: "image",
          },
          (err, result) => {
            if (err) {
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

      if (updatedImages.length === 0) {
        updatedImages.push({
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        });
      } else {
        // Replace first image
        try {
          await cloudinary.uploader.destroy(updatedImages[0].public_id);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
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
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "articles",
            resource_type: "image",
          },
          (err, result) => {
            if (err) {
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

      if (updatedImages.length === 0) {
        updatedImages.push({
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        });
      } else if (updatedImages.length === 1) {
        updatedImages.push({
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        });
      } else {
        // Replace second image
        try {
          await cloudinary.uploader.destroy(updatedImages[1].public_id);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
        }
        updatedImages[1] = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
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

    // Validate ObjectId format
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
        // Continue with database deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
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
