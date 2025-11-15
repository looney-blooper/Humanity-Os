import express from "express";
import { 
  waterStatus, 
  addWaterSource, 
  getWaterSources,
  deleteWaterSource,
  updateWaterSource 
} from "../controllers/waterController.js";
import { body, validationResult } from "express-validator";
import { protect } from '../middlewares/authmiddlewares.js'; // Fixed path

const router = express.Router();

// Public route to check water status
router.post("/", waterStatus);

// Protected routes - require authentication
router.post("/add", protect, addWaterSource);

router.get("/sources", protect, getWaterSources);

router.delete("/sources/:id", protect, deleteWaterSource);

router.put("/sources/:id", protect, updateWaterSource);

export default router;