import express from "express";
import { getQuestions, submitAnswers } from "../controllers/careController.js";
import { body, validationResult } from "express-validator";
import multer from "multer";

const router = express.Router();

// AI team will replace logic later

router.get("/questions", getQuestions);
router.post(
  "/submit-answers",
  multer().single("file"),
  submitAnswers
);


export default router;
