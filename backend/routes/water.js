
import express from "express";
import { waterStatus, addWaterSource, getWaterSources } from "../controllers/waterController.js";
import { body, validationResult } from "express-validator";
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router();
router.post("/", waterStatus);
router.post("/add", protect, addWaterSource);
router.get("/sources", protect, getWaterSources);
export default router;
