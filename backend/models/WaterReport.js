// models/WaterReport.js
import mongoose from "mongoose";

const waterReportSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    
    waterSourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WaterSource",
      default: null
    },
    
    // Report Details
    reportType: {
      type: String,
      enum: ["new_source", "quality_update", "pollution_alert", "cleanup_update"],
      required: true
    },
    
    // Location of the report
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    
    // Water Quality Observations
    observations: {
      waterColor: { type: String },
      odor: { type: String },
      visiblePollution: { type: Boolean, default: false },
      pollutionType: [{ type: String }], // ["plastic", "chemical", "sewage"]
      estimatedPurity: { type: Number, min: 0, max: 100 },
    },
    
    // Media
    photos: [{ type: String }], // URLs to uploaded photos
    
    description: { type: String, required: true },
    
    // Status
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending"
    },
    
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    
    verifiedAt: { type: Date, default: null },
    
    // Community Engagement
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    
    // Admin Notes
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Indexes
waterReportSchema.index({ location: "2dsphere" });
waterReportSchema.index({ userId: 1 });
waterReportSchema.index({ status: 1 });
waterReportSchema.index({ createdAt: -1 });

export default mongoose.model("WaterReport", waterReportSchema);
