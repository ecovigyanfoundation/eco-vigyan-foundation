import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";

// Check if API key is available
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set in environment variables");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
    await connectDB();

    // Check if Resend is configured
    if (!resend || !process.env.RESEND_API_KEY) {
      console.error("Resend API key is not configured");
      return NextResponse.json(
        { 
          error: "Email service is not configured. Please contact the administrator.",
          details: "RESEND_API_KEY environment variable is missing"
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // For security, don't reveal if email exists or not
    // Always return success message
    if (!user) {
      // Still return success to prevent email enumeration
      return NextResponse.json(
        { message: "If an account with that email exists, a password reset link has been sent." },
        { status: 200 }
      );
    }

    // Check if user is banned
    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Save reset token to user
    await User.findByIdAndUpdate(user._id, {
      resetToken,
      resetTokenExpiry,
    });

    // Create reset URL
    let baseUrl;
    if (process.env.NEXT_PUBLIC_BASE_URL) {
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    } else if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    } else {
      baseUrl = "http://localhost:3000";
    }
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    // Determine from email
    let fromEmail;
    if (process.env.RESEND_FROM_EMAIL) {
      fromEmail = process.env.RESEND_FROM_EMAIL;
      if (fromEmail.includes("<") && fromEmail.includes(">")) {
        const emailMatch = fromEmail.match(/<([^>]+)>/);
        if (emailMatch) {
          fromEmail = emailMatch[1];
        }
      }
    } else {
      fromEmail = "onboarding@resend.dev";
    }

    // Create email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #059669; font-size: 24px; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
          Hello ${user.name || "User"},
        </p>
        <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">
          You requested to reset your password for your Eco Vigyan Foundation account. Click the button below to reset your password:
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a 
            href="${resetUrl}" 
            style="display: inline-block; background-color: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;"
          >
            Reset Password
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          Or copy and paste this link into your browser:
        </p>
        <p style="color: #059669; font-size: 14px; word-break: break-all;">
          ${resetUrl}
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
          This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            © 2025 Eco Vigyan Foundation. All rights reserved.
          </p>
        </div>
      </div>
    `;

    // Send email
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject: "Reset Your Password - Eco Vigyan Foundation",
      html: emailContent,
    });

    if (error) {
      console.error("Resend API error:", error);
      return NextResponse.json(
        { 
          error: "Failed to send password reset email. Please try again later.",
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log("Password reset email sent successfully:", data?.id);

    return NextResponse.json(
      { message: "If an account with that email exists, a password reset link has been sent." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message || "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    );
  }
}

