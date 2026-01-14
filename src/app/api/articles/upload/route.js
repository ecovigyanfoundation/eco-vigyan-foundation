import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();

    /* ================= AUTH ================= */
    const { user, error } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "writer" && user.role !== "admin") {
      return NextResponse.json(
        { error: "Only writers and admins can upload articles" },
        { status: 403 }
      );
    }

    /* ================= FORM DATA ================= */
    const formData = await req.formData();
    const title = formData.get("title")?.trim();
    const content = formData.get("content")?.trim();
    const image1 = formData.get("image1");
    const image2 = formData.get("image2");

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json(
        { error: "Title must be between 5 and 200 characters" },
        { status: 400 }
      );
    }

    if (content.length < 50 || content.length > 10000) {
      return NextResponse.json(
        { error: "Content must be between 50 and 10000 characters" },
        { status: 400 }
      );
    }

    /* ================= IMAGES ================= */
    const images = [];
    const maxFileSize = 10 * 1024 * 1024;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    for (const img of [image1, image2]) {
      if (!img || !(img instanceof File) || img.size === 0) continue;

      if (img.size > maxFileSize) {
        return NextResponse.json(
          { error: "Each image must be under 10MB" },
          { status: 400 }
        );
      }

      if (!allowedTypes.includes(img.type)) {
        return NextResponse.json(
          { error: "Invalid image format" },
          { status: 400 }
        );
      }

      images.push(img);
    }

    /* ================= CLOUDINARY ================= */
    const uploadedImages = [];

    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "articles" },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        ).end(buffer);
      });

      uploadedImages.push({
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      });
    }

    /* ================= DB ================= */
    const article = await Article.create({
      title,
      content,
      images: uploadedImages,
      uploadedBy: user._id,
      status: "active",
    });

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
      { error: "Failed to upload article" },
      { status: 500 }
    );
  }
}
