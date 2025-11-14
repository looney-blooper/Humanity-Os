import express from "express";
import { calculateCarbon } from "../controllers/carbonController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.post("/", calculateCarbon);
export default router;
