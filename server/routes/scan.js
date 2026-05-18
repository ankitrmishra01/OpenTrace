import express from "express";
import {
  startScan,
  generateAnalysis,
  getScanHistory,
  getScanResult,
} from "../controllers/scanController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/start", protect, startScan);
router.post("/analyze", protect, generateAnalysis);
router.get("/history", protect, getScanHistory);
router.get("/:scanId", protect, getScanResult);

export default router;
