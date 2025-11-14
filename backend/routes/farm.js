import express from "express";
import {
  createFarm,
  getMyFarms,
  addWaterLog,
  addActivityLog,
  getFarmSuggestions,
} from "../controllers/farmController.js";
import { protect } from "../middlewares/authmiddlewares.js";

const router = express.Router();

// Create a farm field
router.post("/", protect, createFarm);

// Get all farms of the logged-in user
router.get("/", protect, getMyFarms);

// Add logs
router.post("/:farmId/water", protect, addWaterLog);
router.post("/:farmId/activity", protect, addActivityLog);

// Suggestions
router.get("/:farmId/suggestions", protect, getFarmSuggestions);

export default router;
