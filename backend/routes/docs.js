import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "../apiDocs.json");
  const raw = fs.readFileSync(filePath);
  const docs = JSON.parse(raw);
  res.json(docs);
});

export default router;
