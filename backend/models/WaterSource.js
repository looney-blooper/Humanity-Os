// models/WaterSource.js
import mongoose from "mongoose";

const waterSourceSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["river", "lake", "ocean", "reservoir", "pond", "well", "stream"],
      required: true
    },
    
    // GeoJSON Location (for geospatial queries)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    // Water Quality Metrics
    qualityMetrics: {
      purityScore: { type: Number, min: 0, max: 100, default: 0 }, // 0-100
      pollutionLevel: { 
        type: String, 
        enum: ["low", "moderate", "high", "severe"],
        default: "moderate"
      },
      severityScore: { type: Number, min: 0, max: 10, default: 5 }, // 0-10
      
      // Detailed Parameters
      pH: { type: Number, default: null },
      dissolvedOxygen: { type: Number, default: null }, // mg/L
      turbidity: { type: Number, default: null }, // NTU
      temperature: { type: Number, default: null }, // Celsius
      conductivity: { type: Number, default: null }, // µS/cm
      tds: { type: Number, default: null }, // Total Dissolved Solids (mg/L)
      bod: { type: Number, default: null }, // Biochemical Oxygen Demand
      cod: { type: Number, default: null }, // Chemical Oxygen Demand
      nitrate: { type: Number, default: null }, // mg/L
      phosphate: { type: Number, default: null }, // mg/L
      fecalColiform: { type: Number, default: null }, // MPN/100ml
    },

    // Data Source
    dataSource: {
      type: String,
      enum: ["api", "user_reported", "government", "sensor"],
      default: "user_reported"
    },
    
    externalId: { type: String }, // ID from external API
    lastUpdated: { type: Date, default: Date.now },
    
    // Status
    isVerified: { type: Boolean, default: false },
    isSafeForUse: { type: Boolean, default: false },
    
    // User Reports Count
    reportsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Create 2dsphere index for geospatial queries
waterSourceSchema.index({ location: "2dsphere" });
waterSourceSchema.index({ purityScore: -1 });
waterSourceSchema.index({ severityScore: 1 });

export default mongoose.model("WaterSource", waterSourceSchema);
