import mongoose from "mongoose";

const pinSchema = new mongoose.Schema({
  type: { type: String, required: true }, // "hazard", "safe", "donor", "receiver"
  lat: Number,
  lng: Number,
  message: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Pin", pinSchema);
