import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
        dbName: "humanityos"
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB Error:", error.message);
  }
};
