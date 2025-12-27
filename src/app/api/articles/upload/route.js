import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    // Authentication check
    if (!process.env.JWT_SECRET) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Get token from cookies - read from request headers first
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

    // Get user and check role
    const user = await User.findById(decoded.id);
    if (!user || user.isBanned) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is writer or admin
    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can upload articles" },
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
    const title = formData.get("title")?.trim();
    const content = formData.get("content")?.trim();
    const image1 = formData.get("image1");
    const image2 = formData.get("image2");

    // Validation
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Validate title
    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 5 and 200 characters" },
        { status: 400 }
      );
    }

    // Validate content
    if (content.length < 50 || content.length > 10000) {
      return NextResponse.json(
        { error: "Content must be between 50 and 10000 characters" },
        { status: 400 }
      );
    }

    // Validate images (at most 2)
    const images = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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
      images.push(image1);
    }

    if (image2 && image2 instanceof File && image2.size > 0) {
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
      images.push(image2);
    }

    // Upload images to Cloudinary
    const uploadedImages = [];
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "articles",
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

      uploadedImages.push({
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      });
    }

    // Create article entry
    const article = await Article.create({
      title,
      content,
      images: uploadedImages,
      uploadedBy: user._id,
      status: "active",
    });

    // Populate uploadedBy for response
    await article.populate("uploadedBy", "name username dp");

    return NextResponse.json(
      {
        message: "Article uploaded successfully",
        article: {
          id: article._id.toString(),
          title: article.title,
          content: article.content,
          images: article.images,
          uploadedBy: article.uploadedBy,
          createdAt: article.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Article upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload article" },
      { status: 500 }
    );
  }
}


