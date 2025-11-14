import express from "express";
import docs from "../apiDocs.json" assert { type: "json" };

const router = express.Router();

router.get("/", (req, res) => {
  res.json(docs);
});

export default router;
