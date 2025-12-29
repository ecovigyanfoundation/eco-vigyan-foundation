import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";
import User from "@/models/User";

// Configure route to handle larger body sizes (10MB)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;


export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const query = { status: "approved" };

    if (category) {
      query.category = category;
    }

    const mushrooms = await Mushroom.find(query)
      .select(
        "commonName scientificName description ecologicalRole texture underside fruitingSurface stemPresence commonUses images location approvedAt submittedBy createdAt"
      )
      .populate("submittedBy", "name username")
      .sort({ approvedAt: -1 });

    return NextResponse.json(
      { mushrooms },
      { status: 200 }
    );
  } catch (error) {
    console.error("Public mushrooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch mushrooms" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Cookie",
          "Access-Control-Allow-Credentials": "true",
        },
      });
    }

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

    /* ================= FORM DATA ================= */

    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      // Handle body size limit errors (413)
      if (error.message && error.message.includes('body') || error.message && error.message.includes('size')) {
        return NextResponse.json(
          { error: "Request body is too large. The server has a limit of ~4.5MB. Please compress your image or use an image under 4MB." },
          { status: 413 }
        );
      }
      throw error; // Re-throw if it's a different error
    }

    const commonName = formData.get("commonName")?.trim() || "";
    const latitudeStr = formData.get("latitude");
    const longitudeStr = formData.get("longitude");
    const photoDateTimeStr = formData.get("photoDateTime");
    const image1 = formData.get("image1"); // File upload (legacy)
    const image2 = formData.get("image2"); // File upload (legacy)
    const imageUrl = formData.get("imageUrl"); // Direct Cloudinary URL
    const imagePublicId = formData.get("imagePublicId"); // Cloudinary public ID
    
    // Optional classification fields
    const ecologicalRole = formData.get("ecologicalRole")?.trim() || null;
    const texture = formData.get("texture")?.trim() || null;
    const underside = formData.get("underside")?.trim() || null;
    const fruitingSurface = formData.get("fruitingSurface")?.trim() || null;
    const stemPresence = formData.get("stemPresence")?.trim() || null;
    const commonUses = formData.getAll("commonUses").filter(Boolean);

    // Validate location
    if (!latitudeStr || !longitudeStr) {
      return NextResponse.json(
        { error: "Location is required" },
        { status: 400 }
      );
    }

    const latitude = Number(latitudeStr);
    const longitude = Number(longitudeStr);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: "Invalid location coordinates" },
        { status: 400 }
      );
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: "Location coordinates out of valid range" },
        { status: 400 }
      );
    }

    /* ================= IMAGE HANDLING ================= */

    const uploadedImages = [];

    // Check if image is already uploaded to Cloudinary (direct upload)
    if (imageUrl) {
      // Image already uploaded directly to Cloudinary
      uploadedImages.push({
        url: imageUrl,
        publicId: imagePublicId || null,
      });
    } else {
      // Legacy: Upload file to Cloudinary (for backward compatibility)
      const images = [];
      const maxFileSize = 4 * 1024 * 1024; // 4MB (to avoid 413 errors from hosting platform limits)
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      for (const img of [image1, image2]) {
        if (!img || !(img instanceof File) || img.size === 0) continue;

        if (img.size > maxFileSize) {
          return NextResponse.json(
            { error: `Image is too large (${(img.size / 1024 / 1024).toFixed(2)}MB). Please use an image under 4MB. Try compressing the image.` },
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

      if (images.length === 0) {
        return NextResponse.json(
          { error: "At least one image is required" },
          { status: 400 }
        );
      }

      // Upload files to Cloudinary
      for (const image of images) {
        const buffer = Buffer.from(await image.arrayBuffer());

        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: "mushrooms" },
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          ).end(buffer);
        });

        uploadedImages.push({
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        });
      }
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    /* ================= CREATE MUSHROOM ================= */

    const mushroomData = {
      images: uploadedImages,
      location: {
        latitude,
        longitude,
      },
      submittedBy: user._id,
      status: "pending",
    };

    // Add optional fields if provided
    if (commonName) mushroomData.commonName = commonName;
    if (ecologicalRole) mushroomData.ecologicalRole = ecologicalRole;
    if (texture) mushroomData.texture = texture;
    if (underside) mushroomData.underside = underside;
    if (fruitingSurface) mushroomData.fruitingSurface = fruitingSurface;
    if (stemPresence) mushroomData.stemPresence = stemPresence;
    if (commonUses.length > 0) mushroomData.commonUses = commonUses;
    
    // Add photo date/time from EXIF or device if provided
    if (photoDateTimeStr) {
      const photoDate = new Date(photoDateTimeStr);
      if (!isNaN(photoDate.getTime())) {
        mushroomData.photoDateTime = photoDate;
      }
    }

    await Mushroom.create(mushroomData);

    return NextResponse.json(
      { message: "Mushroom submitted for review" },
      { 
        status: 201,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
        },
      }
    );
  } catch (error) {
    console.error("Mushroom submission error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit mushroom" },
      { status: 500 }
    );
  }
}
