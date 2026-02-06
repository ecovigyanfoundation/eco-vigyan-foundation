import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    category: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["zone"],
        default: "zone",
      },
      center: {
        lat: { type: Number },
        lng: { type: Number },
      },
      boundary: {
        type: mongoose.Schema.Types.Mixed, // Array of coordinates
        required: true,
      },
    },

    shapeType: {
      type: String,
      enum: ["rectangle", "circle", "polygon", "city"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
zoneSchema.index({ category: 1, createdAt: -1 });
zoneSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Zone || mongoose.model("Zone", zoneSchema);

