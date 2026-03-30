import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    image: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    // New optional fields for enhanced artwork information
    title: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: String,
      enum: ["Nature Art", "Recycled Materials", "Paintings", "Posters", "Collage", "Mixed Media", ""],
      default: "",
    },
    program: {
      type: String,
      trim: true,
      default: "",
    },
    year: {
      type: String,
      trim: true,
      default: "",
    },
    theme: {
      type: String,
      trim: true,
      default: "",
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
gallerySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);

