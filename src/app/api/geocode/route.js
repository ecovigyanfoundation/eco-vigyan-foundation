import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    if (!city) {
      return NextResponse.json(
        { error: "City is required" },
        { status: 400 }
      );
    }

    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?format=json` +
      `&q=${encodeURIComponent(city)}` +
      `&limit=5` +
      `&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "EcoVigyan/1.0 (contact@ecovigyan.org)",
        "Accept": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Geocoding failed" },
        { status: 500 }
      );
    }

    const data = await res.json();
    if (!data.length) {
      return NextResponse.json({ result: null }, { status: 200 });
    }

    const best =
      data.find(d => d.type === "city") ||
      data.find(d => d.type === "town") ||
      data.find(d => d.class === "boundary") ||
      data[0];

    return NextResponse.json({
      result: {
        latitude: Number(best.lat),
        longitude: Number(best.lon),
        name: best.display_name,
      },
    });
  } catch (err) {
    console.error("Geocode API error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
