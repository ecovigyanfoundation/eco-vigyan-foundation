import mongoose from "mongoose";

const pointLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    action: {
      type: String,
      enum: [
        "MUSHROOM_SUBMITTED",
        "MUSHROOM_APPROVED",
        "ARTICLE_PUBLISHED",
        "BONUS",
      ],
      required: true,
    },

    points: {
      type: Number,
      required: true,
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

export default mongoose.models.PointLog ||
  mongoose.model("PointLog", pointLogSchema);
