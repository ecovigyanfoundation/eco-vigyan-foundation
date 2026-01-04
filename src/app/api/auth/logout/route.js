import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete the token cookie with better mobile compatibility
    const isProduction = process.env.NODE_ENV === "production";
    const pastDate = new Date(0);
    
    // Create response first
    const response = NextResponse.json({ message: "Logged out successfully" });
    
    // Clear cookie using cookieStore (primary method) - must match login cookie attributes exactly
    try {
      cookieStore.set("token", "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax", // Must match login cookie
        path: "/", // Must match login cookie
        maxAge: 0,
        expires: pastDate,
      });
    } catch (cookieError) {
      console.error("Error setting cookie via cookieStore:", cookieError);
    }
    
    // Also set cookie in response headers for additional browser support
    // Match the exact attributes from login cookie
    const cookieClearString = `token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=${pastDate.toUTCString()}${isProduction ? "; Secure" : ""}`;
    response.headers.set("Set-Cookie", cookieClearString);

    // Add cache control headers to prevent caching
    response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even on error, try to return a response that clears cookies
    const errorResponse = NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    errorResponse.headers.set(
      "Set-Cookie",
      `token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=${new Date(0).toUTCString()}`
    );
    return errorResponse;
  }
}
