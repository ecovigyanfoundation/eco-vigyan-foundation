import mongoose from "mongoose";

const trailSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
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
        enum: ["trail"],
        default: "trail",
      },
      currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
      },
      center: {
        lat: { type: Number },
        lng: { type: Number },
      },
      boundary: {
        type: mongoose.Schema.Types.Mixed, // Can be array of coordinates or null
      },
    },

    mushrooms: [
      {
        type: mongoose.Schema.Types.Mixed, // Store full mushroom data as embedded documents
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
trailSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.Trail ||
  mongoose.model("Trail", trailSchema);

