import mongoose from "mongoose";

const approvalLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetType: {
      type: String,
      enum: ["MUSHROOM", "ARTICLE"],
      required: true,
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      required: true,
    },

    reason: String,
  },
  { timestamps: true }
);

export default mongoose.models.ApprovalLog ||
  mongoose.model("ApprovalLog", approvalLogSchema);
