import express from "express";
import { waterStatus } from "../controllers/waterController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.post("/", waterStatus);
export default router;
