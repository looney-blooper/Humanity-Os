import express from "express";
import { carePlaceholder } from "../controllers/careController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.post("/", carePlaceholder);  // AI team will replace logic later

export default router;
