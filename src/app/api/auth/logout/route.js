import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    
    // Delete the token cookie - use SameSite=Lax for better mobile compatibility
    try {
      const cookieStore = await cookies();
      cookieStore.set("token", "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax", // Changed from Strict to Lax for better mobile compatibility
        path: "/",
        maxAge: 0,
      });
    } catch (cookieError) {
      console.error("Error clearing cookie with cookies() API:", cookieError);
      // Fallback: manually set cookie to expire
      const cookieString = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProduction ? "; Secure" : ""}`;
      
      return NextResponse.json(
        { message: "Logged out successfully" },
        {
          status: 200,
          headers: {
            "Set-Cookie": cookieString,
          },
        }
      );
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
