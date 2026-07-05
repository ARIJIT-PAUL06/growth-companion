import express from "express";

import {
  getProgressHistory,
  getDashboardData,
  generatePdfReport,
  getBurnoutPrediction,
  getMemoryInsights,
  refreshAIAnalysis,
} from "../controllers/progressController.js";

const router = express.Router();

router.get("/history", getProgressHistory);
router.get("/dashboard", getDashboardData);
router.get("/memory-insights", getMemoryInsights);
router.get("/burnout", getBurnoutPrediction);
router.get("/refresh-ai", refreshAIAnalysis);
router.get("/report", generatePdfReport);

export default router;