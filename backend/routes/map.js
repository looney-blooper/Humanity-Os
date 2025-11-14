import express from "express";
import { addPin, getPins } from "../controllers/mapController.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

router.get("/", getPins);
router.post(
  "/",
  [
    body("lat").isFloat(),
    body("lng").isFloat(),
    body("type").isString(),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  addPin
);


export default router;
