import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const token = cookies().get("token")?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
