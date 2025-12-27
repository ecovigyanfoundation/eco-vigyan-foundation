import mongoose from "mongoose";

const mushroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    scientificName: String,

    description: String,

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    location: {
      latitude: Number,
      longitude: Number,
    },

    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    category: String, // edible, poisonous, medicinal
  },
  { timestamps: true }
);

export default mongoose.models.Mushroom ||
  mongoose.model("Mushroom", mushroomSchema);
