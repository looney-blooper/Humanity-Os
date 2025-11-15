// models/WaterAlert.js
import mongoose from "mongoose";

const waterAlertSchema = new mongoose.Schema(
  {
    waterSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaterSource",
      required: true
    },
    
    alertType: {
      type: String,
      enum: ["high_pollution", "contamination", "unsafe", "severe_degradation"],
      required: true
    },
    
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      required: true
    },
    
    message: { type: String, required: true },
    
    affectedRadius: { type: Number, default: 5000 }, // meters
    
    isActive: { type: Boolean, default: true },
    
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("WaterAlert", waterAlertSchema);
