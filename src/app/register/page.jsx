"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";

const RegisterContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const programParam = searchParams.get("program");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    program: "",
    message: "",
  });

  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  // Map program IDs to display names
  const programNames = {
    "mushroom-walk": "Guided Mushroom Walk",
    "grow-mushrooms": "Grow Your Own Mushrooms",
    "demystify-fungi": "Demystify Your Local Fungi",
    "wipro-earthian": "Wipro Earthian Program",
    "chemical-free": "Chemical Free Living Series",
    "waste-management": "Mastering Solid Waste Management",
  };

  // Set program from URL parameter
  useEffect(() => {
    if (programParam && programNames[programParam]) {
      setFormData((prev) => ({
        ...prev,
        program: programNames[programParam],
      }));
    }
  }, [programParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/programs/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit registration");
      }

      setStatus("success");
      // Reset form after 3 seconds
      setTimeout(() => {
        router.push("/programs");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  return (
    <section className="bg-stone-50 min-h-screen py-24">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => router.push("/programs")}
          className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-500 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Programs
        </button>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-emerald-100"
        >
          {/* Header */}
          <div className="bg-emerald-600 p-8 text-center">
            <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">
              Program Registration
            </h1>
            {formData.program && (
              <p className="text-emerald-100 mt-2 text-lg font-medium">
                {formData.program}
              </p>
            )}
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-12">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-20 h-20 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-emerald-900 mb-2">
                  Registration Successful!
                </h2>
                <p className="text-stone-600">
                  Thank you for registering. We'll get back to you soon.
                </p>
                <p className="text-stone-500 text-sm mt-4">
                  Redirecting to programs page...
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="your.email@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide"
                  >
                    Phone Number * (Indian)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="(\+91|91)?[6-9]\d{9}"
                    title="Enter a valid 10-digit Indian phone number (optionally with +91 or 91 prefix)"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:outline-none transition-colors"
                    placeholder="+91 9876543210 or 9876543210"
                  />
                </div>

                {/* Program (Read-only, hidden from user choice) */}
                <input type="hidden" name="program" value={formData.program} />

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wide"
                  >
                    Additional Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                    placeholder="Any questions or special requirements?"
                  />
                </div>

                {/* Error Message */}
                {status === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-900 font-bold text-sm">
                        Registration Failed
                      </p>
                      <p className="text-red-700 text-sm mt-1">
                        {errorMessage}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading" || !formData.program}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {status === "loading" ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration <Send className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Required Fields Note */}
                <p className="text-stone-500 text-sm text-center">
                  * Required fields
                </p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-stone-600">Loading registration form...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
