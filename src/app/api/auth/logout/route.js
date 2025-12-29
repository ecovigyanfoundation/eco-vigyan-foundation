import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    
    // Delete the token cookie - use SameSite=Lax for better mobile compatibility
    // Also set expires to past date to ensure it's deleted
    const expiresDate = new Date(0).toUTCString();
    
    try {
      const cookieStore = await cookies();
      cookieStore.set("token", "", {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax", // Changed from Strict to Lax for better mobile compatibility
        path: "/",
        maxAge: 0,
        expires: new Date(0), // Set to past date to ensure deletion
      });
    } catch (cookieError) {
      console.error("Error clearing cookie with cookies() API:", cookieError);
    }
    
    // Always return Set-Cookie header to ensure cookie is cleared on mobile
    // Use multiple cookie clearing strategies for better mobile compatibility
    const cookieString = `token=; HttpOnly; Path=/; Max-Age=0; Expires=${expiresDate}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
    
    return NextResponse.json(
      { message: "Logged out successfully" },
      {
        status: 200,
        headers: {
          "Set-Cookie": cookieString,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
