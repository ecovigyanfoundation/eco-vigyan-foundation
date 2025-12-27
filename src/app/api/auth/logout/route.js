import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear the cookie by setting it to expire
    const cookieString = "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict";

    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        headers: {
          "Set-Cookie": cookieString,
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to logout" },
      { status: 500 }
    );
  }
}





