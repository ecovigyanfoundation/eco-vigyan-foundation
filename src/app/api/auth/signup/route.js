import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const formData = await req.formData();

    const name = formData.get("name");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const dp = formData.get("dp");

    /* ---------------- VALIDATION ---------------- */
    if (!name || !username || !email || !password || !dp) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    /* ---------------- CHECK USER ---------------- */
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    /* ---------------- UPLOAD DP ---------------- */
    const buffer = Buffer.from(await dp.arrayBuffer());

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "users" },
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      ).end(buffer);
    });

    /* ---------------- HASH PASSWORD ---------------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* ---------------- CREATE USER ---------------- */
    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: "user",
      points: 0,
      dp: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      },
    });

    /* ---------------- JWT ---------------- */
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    /* ---------------- RESPONSE + COOKIE ---------------- */
    const res = NextResponse.json(
      {
        message: "Signup successful",
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
