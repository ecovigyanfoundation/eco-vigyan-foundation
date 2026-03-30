import { NextResponse } from "next/server";
import { Resend } from "resend";
import { connectDB } from "@/lib/mongodb";
import JoinUsApplication from "@/models/JoinUsApplication";

// Check if API key is available
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set in environment variables");
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Simple in-memory rate limiter
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 20; // 20 requests per hour (increased for testing/production)

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

    // Connect to database
    await connectDB();

    // Check if Resend is configured (allow testing without it)
    const emailEnabled = resend && process.env.RESEND_API_KEY;
    
    if (!emailEnabled) {
      console.warn("⚠️  RESEND_API_KEY is not configured - email will be skipped but data will be saved");
    }

    const body = await req.json();
    const {
      type,
      name,
      email,
      phone,
      currentStatus,
      duration,
      interest,
      message,
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !type) {
      return NextResponse.json(
        {
          error:
            "Missing required fields. Please fill in Name, Email, Phone, and select an application type.",
        },
        { status: 400 }
      );
    }

    // Save to database FIRST (so data is never lost even if email fails)
    let savedApplication;
    try {
      savedApplication = await JoinUsApplication.create({
        type,
        name,
        email,
        phone,
        currentStatus,
        duration,
        interest,
        message,
        status: "pending",
        emailSent: false,
      });

      console.log("✅ Application saved to database:", savedApplication._id);
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        {
          error: "Failed to save application",
          details: dbError.message,
        },
        { status: 500 }
      );
    }

    // Determine subject and type label
    const typeLabels = {
      volunteer: "Volunteer Application",
      intern: "Internship Application",
      "eco-scientist": "Eco वैज्ञानिक Application",
    };
    const subject = typeLabels[type] || "Join Us Application";

    // Create email content
    let emailContent = `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
    
    <div style="background-color: #059669; padding: 32px 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.025em;">
        ${subject}
      </h1>
    </div>

    <div style="padding: 32px 24px;">
      <p style="margin-top: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">
        Applicant Details
      </p>
      
      <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding-bottom: 12px;">
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

    <div style="background-color: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
      This is an automated notification from your Application Portal.
    </div>
  </div>
`;

    if (type === "intern") {
      emailContent += `
    <div style="background-color: #f8fafc; border-left: 4px solid #059669; margin-top: 12px; padding: 16px; border-radius: 4px;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%">
        ${
          currentStatus
            ? `
        <tr>
          <td style="padding-bottom: 12px;">
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Current Status</div>
            <div style="font-size: 15px; color: #1f2937;">${currentStatus}</div>
          </td>
        </tr>`
            : ""
        }
        
        ${
          duration
            ? `
        <tr>
          <td style="padding-top: ${currentStatus ? "12px" : "0"}; ${
                currentStatus ? "border-top: 1px solid #e5e7eb;" : ""
              }">
            <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">Duration (Weeks)</div>
            <div style="font-size: 15px; color: #1f2937;">${duration} weeks</div>
          </td>
        </tr>`
            : ""
        }
      </table>
    </div>
  `;
    }

    if (interest) {
      emailContent += `
    <div style="margin-top: 20px;">
      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px;">Primary Interest / City</div>
      <div style="font-size: 16px; color: #111827; background: #fdfcfb; border: 1px solid #fed7aa; padding: 12px; border-radius: 8px;">
        ${interest}
      </div>
    </div>
  `;
    }

    if (message) {
      emailContent += `
    <div style="margin-top: 24px;">
      <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 8px;">
        Message / Availability
      </div>
      <div style="background-color: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; border-left: 4px solid #059669; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <p style="color: #4b5563; line-height: 1.7; font-size: 15px; margin: 0; white-space: pre-wrap; font-style: italic;">
          "${message}"
        </p>
      </div>
    </div>
  `;
    }
    
    emailContent += `
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px dotted #d1d5db; text-align: center;">
      <p style="color: #6b7280; font-size: 13px; margin: 0; line-height: 1.5;">
        This submission was received via the 
        <span style="color: #059669; font-weight: 600;">Eco Vigyan Foundation</span> 
        Join Us page.
      </p>
      <p style="color: #9ca3af; font-size: 11px; margin-top: 8px;">
        © ${new Date().getFullYear()} Eco Vigyan Foundation. All rights reserved.
      </p>
    </div>
  </div>`;

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

    // Send email only if configured
    if (emailEnabled) {
      const toEmail =
        process.env.RESEND_TO_EMAIL || "ecovigyanfoundation@gmail.com";

      console.log("Sending email from:", fromEmail, "to:", toEmail);

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        subject: subject,
        html: emailContent,
        replyTo: email, // Allow replying directly to applicant
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

        // Update database with email error but don't fail the request
        await JoinUsApplication.findByIdAndUpdate(savedApplication._id, {
          emailSent: false,
          emailError: errorMessage,
        });

        console.warn("⚠️  Email failed but application was saved to database");
        
        // Return success since data was saved, just note email failed
        return NextResponse.json(
          {
            message: "Application submitted successfully (email notification failed)",
            applicationId: savedApplication._id,
            emailSent: false,
          },
          { status: 200 }
        );
      }

      console.log("✅ Email sent successfully:", data?.id);
      
      // Update database to mark email as sent
      await JoinUsApplication.findByIdAndUpdate(savedApplication._id, {
        emailSent: true,
      });
    } else {
      // Testing mode - log the application instead of sending email
      console.log("\n📝 ===== APPLICATION RECEIVED (Saved to DB - No Email) =====");
      console.log("Application ID:", savedApplication._id);
      console.log("Type:", type);
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Phone:", phone);
      if (currentStatus) console.log("Status:", currentStatus);
      if (duration) console.log("Duration:", duration, "weeks");
      if (interest) console.log("Interest:", interest);
      if (message) console.log("Message:", message);
      console.log("=========================================================\n");
      
      // Mark that email was not sent
      await JoinUsApplication.findByIdAndUpdate(savedApplication._id, {
        emailSent: false,
        emailError: "RESEND_API_KEY not configured",
      });
    }

    return NextResponse.json(
      { 
        message: "Application submitted successfully",
        applicationId: savedApplication._id,
        emailSent: emailEnabled,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Join us API error:", error);
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
