import { NextResponse } from "next/server";
import { Resend } from "resend";

// Check if API key is available
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set in environment variables");
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 * 24; // 1 day
const MAX_REQUESTS = 1; // 1 request per day per IP

// Clean up old entries periodically (every hour)
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimit.entries()) {
    if (now - data.startTime > RATE_LIMIT_WINDOW) {
      rateLimit.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW);

export async function POST(req) {
  try {
    // 1. Rate Limiting Check
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    
    // Get existing data or initialize
    const rateData = rateLimit.get(ip) || { count: 0, startTime: now };
    
    // Check if window has expired, reset if so
    if (now - rateData.startTime > RATE_LIMIT_WINDOW) {
      rateData.count = 1;
      rateData.startTime = now;
    } else {
      rateData.count++;
    }
    
    // Update map
    rateLimit.set(ip, rateData);
    
    // Check if limit exceeded
    if (rateData.count > MAX_REQUESTS) {
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
        },
        { status: 429 }
      );
    }

    // Check if Resend is configured
    if (!resend || !process.env.RESEND_API_KEY) {
      console.error("Resend API key is not configured");
      return NextResponse.json(
        {
          error:
            "Email service is not configured. Please contact the administrator.",
          details: "RESEND_API_KEY environment variable is missing",
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { name, email, phone, program, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !program) {
      return NextResponse.json(
        {
          error:
            "Missing required fields. Please fill in Name, Email, Phone, and Program.",
        },
        { status: 400 }
      );
    }

    // Validate email format using regex
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // Validate Indian phone number format
    // Accepts: +919876543210, 919876543210, or 9876543210 (10 digits starting with 6-9)
    const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
    const cleanPhone = phone.replace(/[\s-]/g, ""); // Remove spaces and hyphens
    if (!phoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Indian phone number (10 digits starting with 6-9, optionally prefixed with +91 or 91).",
        },
        { status: 400 }
      );
    }

    const subject = `Program Registration: ${program}`;

    // Create email content
    const emailContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    
    <div style="background-color: #059669; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.025em;">
        ${subject}
      </h1>
    </div>

    <div style="padding: 32px 24px;">
      <p style="margin-top: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">
        Registration Details
      </p>
      
      <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 12px;">
              <span style="display: block; font-size: 12px; color: #9ca3af; text-transform: uppercase;">Program</span>
              <span style="font-size: 16px; font-weight: 600; color: #059669;">${program}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
              <span style="display: block; font-size: 12px; color: #9ca3af; text-transform: uppercase;">Full Name</span>
              <span style="font-size: 16px; font-weight: 600; color: #111827;">${name}</span>
            </td>
          </tr>
          <tr>
            <td style="padding-bottom: 12px; border-top: 1px solid #f3f4f6; padding-top: 12px;">
              <span style="display: block; font-size: 12px; color: #9ca3af; text-transform: uppercase;">Email Address</span>
              <a href="mailto:${email}" style="font-size: 16px; color: #059669; text-decoration: none; font-weight: 500;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="border-top: 1px solid #f3f4f6; padding-top: 12px;">
              <span style="display: block; font-size: 12px; color: #9ca3af; text-transform: uppercase;">Phone Number</span>
              <span style="font-size: 16px; font-weight: 600; color: #111827;">${phone}</span>
            </td>
          </tr>
        </table>
      </div>
    </div>

    ${
      message
        ? `
    <div style="padding: 0 24px 24px 24px;">
      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">
        Additional Message
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; border-left: 4px solid #059669; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <p style="color: #4b5563; line-height: 1.7; font-size: 15px; margin: 0; white-space: pre-wrap; font-style: italic;">
          "${message}"
        </p>
      </div>
    </div>
    `
        : ""
    }

    <div style="padding: 24px; border-top: 1px dotted #d1d5db; text-align: center;">
      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
        This submission was received via the 
        <span style="color: #059669; font-weight: 600;">Eco Vigyan Foundation</span> 
        Programs page.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">
        © ${new Date().getFullYear()} Eco Vigyan Foundation. All rights reserved.
      </p>
    </div>
  </div>
`;

    // Send email using Resend
    let fromEmail;

    if (process.env.RESEND_FROM_EMAIL) {
      // Custom domain provided - extract email if in "Name <email>" format
      fromEmail = process.env.RESEND_FROM_EMAIL;
      if (fromEmail.includes("<") && fromEmail.includes(">")) {
        const emailMatch = fromEmail.match(/<([^>]+)>/);
        if (emailMatch) {
          fromEmail = emailMatch[1];
        }
      }
      console.warn(
        "Using custom domain. Ensure it's verified at https://resend.com/domains"
      );
    } else {
      // Use Resend test domain (no verification required)
      fromEmail = "onboarding@resend.dev";
      console.log(
        "Using Resend test domain (onboarding@resend.dev) - no verification needed"
      );
    }

    const toEmail =
      process.env.RESEND_TO_EMAIL || "ecovigyanfoundation@gmail.com";

    console.log("Sending email from:", fromEmail, "to:", toEmail);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: subject,
      html: emailContent,
      replyTo: email, // Allow replying directly to registrant
    });

    if (error) {
      console.error("Resend API error:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));

      // Provide more helpful error messages
      let errorMessage = "Failed to send email";
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "object") {
        errorMessage = JSON.stringify(error);
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: "Please check your Resend API key and domain configuration.",
        },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data?.id);

    return NextResponse.json(
      { message: "Registration submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Program registration API error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error.message ||
          "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
