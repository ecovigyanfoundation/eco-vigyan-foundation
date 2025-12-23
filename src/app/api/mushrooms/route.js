import { mushrooms as fallbackMushrooms } from "@/data/mushrooms";
import { getMongoDb } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

const STATIC_IMAGE_PATH = "/uploads/mushroom.jpg";

const withFallbackImage = (items = []) =>
  items.map((item) => ({
    ...item,
    image: item.image || STATIC_IMAGE_PATH
  }));

const mergeStaticAndDynamic = (dynamicItems = []) => {
  const staticEntries = withFallbackImage(fallbackMushrooms);
  const seen = new Set(
    staticEntries.map(
      (item) => `${item.latitude}-${item.longitude}-${item.name}`.toLowerCase()
    )
  );

  const normalizedDynamic = withFallbackImage(dynamicItems);

  const combined = [...staticEntries];
  normalizedDynamic.forEach((item) => {
    const key = `${item.latitude}-${item.longitude}-${item.name}`.toLowerCase();
    if (!seen.has(key)) {
      combined.push(item);
      seen.add(key);
    }
  });

  return combined;
};

async function extractPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const payload = {
      name: formData.get("name"),
      contributor: formData.get("contributor"),
      category: formData.get("category"),
      use: formData.get("use"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude")
    };

    const file = formData.get("image");
    return { payload, file };
  }

  const payload = await request.json();
  return { payload, file: null };
}

function sanitizePayload(payload = {}, imagePath) {
  const trimmed = {
    name: payload.name?.trim(),
    contributor: payload.contributor?.trim(),
    category: payload.category?.trim(),
    use: payload.use?.trim(),
    image: imagePath || payload.image?.trim(),
    latitude: Number(payload.latitude),
    longitude: Number(payload.longitude)
  };

  const requiredText = ["name", "contributor", "category", "use"];
  for (const key of requiredText) {
    if (!trimmed[key]) {
      return { error: `${key} is required` };
    }
  }

  if (Number.isNaN(trimmed.latitude) || Number.isNaN(trimmed.longitude)) {
    return { error: "latitude and longitude must be valid numbers" };
  }

  if (trimmed.image && !/^\/uploads\//.test(trimmed.image) && !/^https?:\/\//i.test(trimmed.image)) {
    return { error: "image must be a valid URL (http/https) or the stored upload path" };
  }

  return { data: trimmed };
}

export async function GET() {
  try {
    const db = await getMongoDb();
    const data = await db
      .collection("mushrooms")
      .find({})
      .project({ _id: 0 })
      .toArray();

    return NextResponse.json(mergeStaticAndDynamic(data));
  } catch (error) {
    console.error("Failed to fetch mushrooms from MongoDB:", error);
    return NextResponse.json(withFallbackImage(fallbackMushrooms));
  }
}

export async function POST(request) {
  let payload;
  let file;

  try {
    const extracted = await extractPayload(request);
    payload = extracted.payload;
    file = extracted.file;
  } catch {
    return NextResponse.json(
      { message: "Invalid payload" },
      { status: 400 }
    );
  }

  let storedImagePath = payload.image?.trim();

  if (file && typeof file === "object" && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const safeName = file.name?.replace(/[^\w.-]/g, "_") || "upload";
      const fileName = `${Date.now()}-${safeName}`;
      const fullPath = path.join(uploadsDir, fileName);
      await fs.writeFile(fullPath, buffer);
      storedImagePath = `/uploads/${fileName}`;
    } catch (err) {
      console.error("Failed to store uploaded image:", err);
      return NextResponse.json(
        { message: "Failed to store image" },
        { status: 500 }
      );
    }
  }

  const { data, error } = sanitizePayload(payload, storedImagePath);
  if (error) {
    return NextResponse.json({ message: error }, { status: 400 });
  }

  try {
    const db = await getMongoDb();
    await db.collection("mushrooms").insertOne({
      ...data,
      createdAt: new Date()
    });

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Failed to insert mushroom:", err);
    return NextResponse.json(
      { message: "Failed to save mushroom entry", detail: err?.message },
      { status: 500 }
    );
  }
}
