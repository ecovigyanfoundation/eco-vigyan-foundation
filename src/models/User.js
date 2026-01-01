import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ---------------- BASIC INFO ---------------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // IMPORTANT: never return password
    },

    /* ---------------- PROFILE ---------------- */
    dp: {
      public_id: String,
      url: String,
    },

    bio: {
      type: String,
      default: "",
    },

    /* ---------------- ROLE SYSTEM ---------------- */
    role: {
      type: String,
      enum: ["user", "writer", "admin"],
      default: "user",
    },

    /* ---------------- GAMIFICATION ---------------- */
    points: {
      type: Number,
      default: 0,
    },

    /* ---------------- TRUST / MODERATION ---------------- */
    isVerified: {
      type: Boolean,
      default: false,
    },

    isBanned: {
      type: Boolean,
      default: false,
    },

    /* ---------------- META ---------------- */
    lastLogin: Date,

    /* ---------------- PASSWORD RESET ---------------- */
    resetToken: {
      type: String,
      select: false,
    },
    resetTokenExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- SAFE EXPORT ---------------- */
export default mongoose.models.User ||
  mongoose.model("User", userSchema);
