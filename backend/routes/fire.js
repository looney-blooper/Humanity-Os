import express from "express";
import { fireRisk } from "../controllers/fireController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.post("/", fireRisk);
export default router;
