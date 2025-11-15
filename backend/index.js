import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
import careRoutes from "./routes/care.js";
import carbonRoutes from "./routes/carbon.js";
import fireRoutes from "./routes/fire.js";
import mapRoutes from "./routes/map.js";
import eventRoutes from "./routes/events.js";

import { connectDB } from "./config/db.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import docsRoutes from "./routes/docs.js";
import morgan from "morgan";
import authRoutes from "./routes/auth.js";
import farmRoutes from "./routes/farm.js";
import waterRoutes from "./routes/water.js";



app.use(morgan("dev"));
app.use(cors({
  origin: ["http://localhost:5173"], // frontend
  methods: ["GET", "POST"],
}));
app.use("/api/care", careRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/fire", fireRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/docs", docsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/farm", farmRoutes);
app.use("/api/water", waterRoutes);

app.use(errorHandler);

connectDB();

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend running on port 5000");
});
