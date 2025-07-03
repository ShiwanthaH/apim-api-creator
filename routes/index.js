import express from "express";
import { createApis } from "../controllers/index.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("API is working!");
});

router.post("/create", createApis);

export default router;
