import { NextResponse } from "next/server";
import { Resend } from "resend";

// Check if API key is available
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set in environment variables");
}

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req) {
  try {
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
        { error: "Missing required fields. Please fill in Name, Email, Phone, and select an application type." },
        { status: 400 }
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
      <h2 style="color: #059669; font-size: 24px; margin-bottom: 16px;">${subject}</h2>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="color: #1f2937; margin-bottom: 12px;">Applicant Information</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>Phone:</strong> ${phone}</p>
      </div>
    `;

    if (type === "intern") {
      if (currentStatus) {
        emailContent += `<p><strong>Current Status:</strong> ${currentStatus}</p>`;
      }
      if (duration) {
        emailContent += `<p><strong>Duration (Weeks):</strong> ${duration}</p>`;
      }
    }

    if (interest) {
      emailContent += `<p><strong>Primary Interest/City:</strong> ${interest}</p>`;
    }

    if (message) {
      emailContent += `
        <div style="background-color: #ffffff; padding: 16px; border-radius: 8px; margin-top: 16px; border-left: 4px solid #059669;">
          <h3 style="color: #1f2937; margin-bottom: 8px;">Message/Availability</h3>
          <p style="color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
      `;
    }

    emailContent += `
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px;">
          This email was sent from the Eco Vigyan Foundation Join Us page.
        </p>
      </div>
    `;

    // Send email using Resend
    // IMPORTANT: For testing, use "onboarding@resend.dev" (no verification needed)
    // For production, verify your domain at https://resend.com/domains and use RESEND_FROM_EMAIL
    
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
      console.warn("Using custom domain. Ensure it's verified at https://resend.com/domains");
    } else {
      // Use Resend test domain (no verification required)
      fromEmail = "onboarding@resend.dev";
      console.log("Using Resend test domain (onboarding@resend.dev) - no verification needed");
    }
    
    const toEmail = process.env.RESEND_TO_EMAIL || "ecovigyanfoundation@gmail.com";
    
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
      } else if (typeof error === 'object') {
        errorMessage = JSON.stringify(error);
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: "Please check your Resend API key and domain configuration."
        },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data?.id);

    return NextResponse.json(
      { message: "Application submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Join us API error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error.message || "An unexpected error occurred. Please try again later."
      },
      { status: 500 }
    );
  }
}

