import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { connectDB } from "@/lib/mongodb";
import Mushroom from "@/models/Mushroom";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    /* AUTH */
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const formData = await req.formData();

    const name = formData.get("name");
    const category = formData.get("category");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");
    const image = formData.get("image");

    if (!name || !image || !latitude || !longitude) {
      return NextResponse.json(
        { message: "Missing fields" },
        { status: 400 }
      );
    }

    /* IMAGE UPLOAD */
    const buffer = Buffer.from(await image.arrayBuffer());

    const upload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "mushrooms" },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    /* CREATE MUSHROOM */
    await Mushroom.create({
      name,
      category,
      location: {
        latitude,
        longitude,
      },
      images: [
        {
          public_id: upload.public_id,
          url: upload.secure_url,
        },
      ],
      contributor: decoded.id,
      status: "pending",
    });

    return NextResponse.json(
      { message: "Mushroom submitted for review" },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
