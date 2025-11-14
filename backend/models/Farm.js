import mongoose from "mongoose";

const farmSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  fieldName: { type: String, required: true },
  plantType: { type: String, required: true },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },

  wateringLogs: [
    {
      amount: Number,     // liters
      date: { type: Date, default: Date.now }
    }
  ],

  activityLogs: [
    {
      action: String,      // "fertilized", "weed removed", etc
      notes: String,
      date: { type: Date, default: Date.now }
    }
  ],

  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

farmSchema.index({ location: "2dsphere" }); // geospatial indexing

export default mongoose.model("Farm", farmSchema);
