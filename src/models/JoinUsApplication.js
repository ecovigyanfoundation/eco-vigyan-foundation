import mongoose from "mongoose";

const joinUsApplicationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["volunteer", "intern", "eco-scientist"],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    currentStatus: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    interest: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "accepted", "rejected"],
      default: "pending",
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailError: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Indexes for searching
joinUsApplicationSchema.index({ email: 1 });
joinUsApplicationSchema.index({ type: 1 });
joinUsApplicationSchema.index({ status: 1 });
joinUsApplicationSchema.index({ createdAt: -1 });

// Delete existing model in development to avoid OverwriteModelError
if (mongoose.models.JoinUsApplication) {
  delete mongoose.models.JoinUsApplication;
}

const JoinUsApplication = mongoose.model(
  "JoinUsApplication",
  joinUsApplicationSchema
);

export default JoinUsApplication;
