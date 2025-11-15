import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    phone: { type: String, default: "" },

    age: { type: Number, default: null },

    bio: { type: String, default: "" },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    // User location (GeoJSON)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    // Preferences (UI or app behavior)
    preferences: {
      theme: { type: String, default: "light" },
      notifications: { type: Boolean, default: true },
    },

    // Useful metrics for AI modules
    metrics: {
      emotionalScore: { type: Number, default: 0 },
      carbonFootprint: { type: Number, default: 0 },
      farmingImpact: { type: Number, default: 0 },
    },

    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true } // handles createdAt + updatedAt automatically
);

export default mongoose.model("User", userSchema);
