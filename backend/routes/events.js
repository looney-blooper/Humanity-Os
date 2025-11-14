import express from "express";
import { getEvents } from "../controllers/eventsController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
router.get("/", getEvents);

export default router;
