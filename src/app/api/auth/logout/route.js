import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete the token cookie with better mobile compatibility
    const isProduction = process.env.NODE_ENV === "production";
    
    // Clear cookie with lax sameSite for better mobile compatibility
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax", // Changed from "strict" to "lax" for better mobile compatibility
      path: "/",
      maxAge: 0,
      expires: new Date(0), // Set expiration to past date
    });

    // Create response with additional cookie clearing headers for mobile browsers
    const response = NextResponse.json({ message: "Logged out successfully" });
    
    // Also set cookie in response headers for additional mobile browser support
    response.headers.set(
      "Set-Cookie",
      `token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=${new Date(0).toUTCString()}${isProduction ? "; Secure" : ""}`
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
