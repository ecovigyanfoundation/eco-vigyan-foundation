"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{
        top: 40,
      }}
      toastOptions={{
        duration: 4000,
        // Base Style
        style: {
          background: "hsl(var(--background, 0 0% 100%))", // Respects your app's theme if using Shadcn/Tailwind
          color: "#1f2937",
          padding: "12px 18px",
          borderRadius: "14px",
          fontSize: "14px",
          fontWeight: "500",
          letterSpacing: "-0.01em",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: `
            0 4px 6px -1px rgba(0, 0, 0, 0.05), 
            0 10px 15px -3px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(0, 0, 0, 0.02)
          `,
          maxWidth: "400px",
        },
        // Success Theme: Subtle green border & glow
        success: {
          style: {
            border: "1px solid rgba(16, 185, 129, 0.2)",
            background: "linear-gradient(to right, #ffffff, #f0fdf4)",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#fff",
          },
        },
        // Error Theme: Subtle red border & glow
        error: {
          style: {
            border: "1px solid rgba(244, 63, 94, 0.2)",
            background: "linear-gradient(to right, #ffffff, #fff1f2)",
          },
          iconTheme: {
            primary: "#f43f5e",
            secondary: "#fff",
          },
        },
        // Loading Theme
        loading: {
          style: {
            border: "1px solid rgba(0, 0, 0, 0.05)",
            background: "#ffffff",
          },
        },
      }}
    />
  );
}