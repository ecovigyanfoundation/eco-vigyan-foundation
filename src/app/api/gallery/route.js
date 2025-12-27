import { connectDB } from "@/lib/mongodb";
import Gallery from "@/models/Gallery";
import { NextResponse } from "next/server";

// GET - Fetch all active gallery images
export async function GET() {
  try {
    await connectDB();

    const images = await Gallery.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate("uploadedBy", "name username")
      .select("-__v");

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Gallery fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

