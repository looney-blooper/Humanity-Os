import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  name: String,
  carbonOffset: Number,
  description: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Event", eventSchema);
