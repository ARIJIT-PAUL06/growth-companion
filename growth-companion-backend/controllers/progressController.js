import {
  recallMemory,
} from "../services/cogneeServices.js";

import {
  generateMemoryInsights,
} from "../services/analyticsService.js";

import ProgressSnapshot from "../models/ProgressSnapshot.js";
import PDFDocument from "pdfkit";
import { predictBurnout } from "../services/burnoutEngine.js";
import AIAnalysis from "../models/AIAnalysis.js";

const formatPoint = (snapshot) => ({
  date: snapshot.createdAt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }),
  emotionalHealth: snapshot.coreMetrics.emotionalHealth,
  anxiety: snapshot.coreMetrics.anxiety,
  confidence: snapshot.coreMetrics.confidence,
  energy: snapshot.coreMetrics.energy,
});

const averageSnapshots = (snapshots, bucketSize = 7) => {
  const aggregated = [];

  for (let i = 0; i < snapshots.length; i += bucketSize) {
    const chunk = snapshots.slice(i, i + bucketSize);

    aggregated.push({
      date: chunk[chunk.length - 1].createdAt.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      emotionalHealth:
        chunk.reduce((sum, s) => sum + s.coreMetrics.emotionalHealth, 0) /
        chunk.length,
      anxiety:
        chunk.reduce((sum, s) => sum + s.coreMetrics.anxiety, 0) /
        chunk.length,
      confidence:
        chunk.reduce((sum, s) => sum + s.coreMetrics.confidence, 0) /
        chunk.length,
      energy:
        chunk.reduce((sum, s) => sum + s.coreMetrics.energy, 0) /
        chunk.length,
    });
  }

  return aggregated;
};

// ---------------- HISTORY ----------------

export const getProgressHistory = async (req, res) => {
  try {
    const snapshots = await ProgressSnapshot.find({
      userId: "demo-user",
    }).sort({ createdAt: 1 });

    res.json(snapshots.map(formatPoint));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ---------------- DASHBOARD ----------------
export const getDashboardData = async (req, res) => {
  try {
    const range = req.query.range || "7d";

    // Fetch progress snapshots
    const snapshots = await ProgressSnapshot.find({
      userId: "demo-user",
    }).sort({ createdAt: 1 });

    // Fetch cached AI analysis
    const aiAnalysis = await AIAnalysis.findOne({
      userId: "demo-user",
    });

    if (!snapshots.length) {
      return res.json({
        history: [],
        latestSnapshot: null,
        topSignals: {},
        summary: "",
        memoryInsights: aiAnalysis?.memoryInsights || null,
        burnout: aiAnalysis?.burnout || null,
      });
    }

    let history = [];

    if (range === "7d") {
      history = snapshots.map(formatPoint);
    } else if (range === "30d") {
      history = averageSnapshots(snapshots, 3);
    } else {
      history = averageSnapshots(snapshots, 7);
    }

    const latest = snapshots[snapshots.length - 1];

    res.json({
      history,
      latestSnapshot: latest.coreMetrics,
      topSignals: Object.fromEntries(latest.signals),
      summary: latest.summary,

      // Cached AI Analysis
      memoryInsights: aiAnalysis?.memoryInsights || null,
      burnout: aiAnalysis?.burnout || null,
      lastUpdated: aiAnalysis?.lastUpdated || null,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};
/// ---------------- BURNOUT PREDICTION ----------------

export const getBurnoutPrediction = async (req, res) => {
  try {
    const snapshots = await ProgressSnapshot.find({
      userId: "demo-user",
    }).sort({ createdAt: 1 });

    if (!snapshots.length) {
      return res.status(404).json({
        error: "No snapshots found",
      });
    }

    const history = snapshots.map(formatPoint);

    const latest = snapshots[snapshots.length - 1];

    const memories = await recallMemory(
  "Summarize the user's long-term stress patterns, recurring themes, burnout indicators, emotional behaviour, coping strategies and positive growth."
);

const memoryInsights =
  await generateMemoryInsights(memories);
    // -----------------------------
    // Burnout prediction
    // -----------------------------
const prediction = predictBurnout({
  latestSnapshot: latest.coreMetrics,
  history,
  topSignals: Object.fromEntries(latest.signals),
  memoryInsights,
});

    res.json(prediction);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};
// ---------------- MEMORY INSIGHTS ----------------

export const getMemoryInsights = async (req, res) => {
  try {

    const memories = await recallMemory(
      "Summarize the user's recurring themes, emotional patterns, personal goals, stressors, positive growth and long-term behaviour."
    );

    const insights = await generateMemoryInsights(memories);

    res.json(insights);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      recurringThemes: [],
      behaviorPattern: "Unable to analyze memories.",
      positiveGrowth: "Unavailable.",
      memorySummary: "Memory insights unavailable.",
    });

  }
};

export const refreshAIAnalysis = async (req, res) => {
  try {
    const snapshots = await ProgressSnapshot.find({
      userId: "demo-user",
    }).sort({ createdAt: 1 });

    if (!snapshots.length) {
      return res.status(404).json({
        error: "No snapshots found",
      });
    }

    const latest = snapshots[snapshots.length - 1];
    const history = snapshots.map(formatPoint);

    // ONE Cognee Recall
    const memories = await recallMemory(
      "Summarize the user's recurring themes, emotional patterns, personal goals, stressors, positive growth and long-term behaviour."
    );

    const memoryInsights =
      await generateMemoryInsights(memories);

    const burnout = predictBurnout({
      latestSnapshot: latest.coreMetrics,
      history,
      topSignals: Object.fromEntries(latest.signals),
      memoryInsights,
    });

    // Save cache
    await AIAnalysis.findOneAndUpdate(
      { userId: "demo-user" },
      {
        memoryInsights,
        burnout,
        lastUpdated: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      memoryInsights,
      burnout,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
};

// ---------------- PDF REPORT ----------------
const progressBar = (value) => {
  const filled = Math.round(value / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
};

const metricArrow = (change) => {
  if (change > 0) return "↑";
  if (change < 0) return "↓";
  return "→";
};

export const generatePdfReport = async (req, res) => {
  try {
    const snapshots = await ProgressSnapshot.find({
      userId: "demo-user",
    }).sort({ createdAt: 1 });

    if (!snapshots.length) {
      return res.status(404).json({
        error: "No progress snapshots found.",
      });
    }

    const first = snapshots[0];
    const latest = snapshots[snapshots.length - 1];

    const metrics = latest.coreMetrics;
    const signals = Object.fromEntries(latest.signals);

    const burnoutPrediction = predictBurnout({
      latestSnapshot: metrics,
      history: snapshots.map(formatPoint),
      topSignals: signals,
    });

    const change = {
      emotional:
        metrics.emotionalHealth - first.coreMetrics.emotionalHealth,
      anxiety:
        metrics.anxiety - first.coreMetrics.anxiety,
      confidence:
        metrics.confidence - first.coreMetrics.confidence,
      energy:
        metrics.energy - first.coreMetrics.energy,
    };

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=GrowthCompanion-Report.pdf"
    );

    res.setHeader("Content-Type", "application/pdf");

    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    doc.pipe(res);

    // ===============================
    // TITLE
    // ===============================

    doc
  .fontSize(30)
  .font("Helvetica-Bold")
      .fillColor("#2563EB")
      .text("Growth Companion", {
        align: "center",
      });

    doc
  .fontSize(16)
  .font("Helvetica")
      .fillColor("black")
      .text("Mental Wellness Report", {
        align: "center",
      });

    doc.moveDown();

    doc
      .fontSize(9)
.fillColor("#6B7280")
      .text(
        `Generated on ${new Date().toLocaleString("en-IN")}`,
        { align: "center" }
      );

    doc.moveDown(2);

    // ===============================
// EXECUTIVE SUMMARY
// ===============================

doc
  .fontSize(17)
.font("Helvetica-Bold")
  .fillColor("#2563EB")
  .text("Executive Summary");

doc.moveDown();

const strongestMetric = Object.entries(metrics).sort(
  (a, b) => b[1] - a[1]
)[0];

const strongestSignal =
  Object.entries(signals).sort(
    (a, b) => b[1] - a[1]
  )[0];

doc.fontSize(11)
.font("Helvetica").fillColor("black");

doc.text(
  `Overall Cognitive Status : ${
    metrics.emotionalHealth >= 70
      ? "Healthy"
      : metrics.emotionalHealth >= 45
      ? "Stable"
      : "Needs Attention"
  }`
);

doc.text(
  `Strongest Metric : ${strongestMetric[0]} (${Math.round(
    strongestMetric[1]
  )})`
);

doc.text(
  `Primary Stressor : ${
    strongestSignal
      ? strongestSignal[0].replace(/_/g, " ")
      : "None"
  }`
);

doc.text(
  `Snapshots Analysed : ${snapshots.length}`
);

doc.moveDown(2);

    // ===============================
    // CURRENT METRICS
    // ===============================

    doc
      .fontSize(17)
      .font("Helvetica-Bold")
      .text("Current Cognitive Metrics");

    doc.moveDown();

    const metric = (name, value, delta) => {
      const sign = delta >= 0 ? "+" : "";

      doc
        .fontSize(11)
.font("Helvetica")
        .fillColor("black")
        .text(
          `${name}: ${Math.round(value)}   (${sign}${Math.round(delta)})`
        );
    };

    metric(
      "Emotional Health",
      metrics.emotionalHealth,
      change.emotional
    );

    metric(
      "Anxiety",
      metrics.anxiety,
      change.anxiety
    );

    metric(
      "Confidence",
      metrics.confidence,
      change.confidence
    );

    metric(
      "Energy",
      metrics.energy,
      change.energy
    );

    doc.moveDown(2);

    // ===============================
    // STRESS SIGNALS
    // ===============================

    doc
      .fontSize(17)
      .font("Helvetica-Bold")
      .text("Dominant Stress Signals");

    doc.moveDown();

    Object.entries(signals).forEach(([key, value]) => {
      doc.fontSize(13).text(
        `${key.replace(/_/g, " ")} : ${Math.round(value)}`
      );
    });

    doc.moveDown(2);

    // ===============================
    // AI SUMMARY
    // ===============================

    doc
      .fontSize(17)
.font("Helvetica-Bold")
      .text("AI Cognitive Summary");

    doc.moveDown();

    doc
      .fontSize(13)
      .text(latest.summary, {
        lineGap: 5,
      });

    doc.moveDown(2);

    // ===============================
    // BURNOUT PREDICTION
    // ===============================

    if (burnoutPrediction.status === "ready") {

  doc.fontSize(20).fillColor("#DC2626")
     .text("Burnout Prediction");

  doc.moveDown();

  doc.fillColor("black");

  doc.text(`Risk Score: ${burnoutPrediction.score}/100`);
  doc.text(`Risk Level: ${burnoutPrediction.risk}`);
  doc.text(
    `Prediction Confidence: ${burnoutPrediction.confidence}%`
  );
  doc.text(
    `Estimated Time: ${burnoutPrediction.daysToBurnout} days`
  );

  doc.moveDown();

  doc.text(`Evidence:`);

  burnoutPrediction.evidence.forEach((item) => {
    doc.text(`• ${item}`);
  });

} else {

  doc.fontSize(20)
     .fillColor("#2563EB")
     .text("Burnout Prediction");

  doc.moveDown();

  doc.fillColor("black");

  doc.text("Status: Collecting Behavioural Evidence");

  doc.moveDown();

  doc.text(
    burnoutPrediction.message
  );

  doc.moveDown();

  doc.text(
    `Snapshots collected: ${burnoutPrediction.progress.snapshots}/${burnoutPrediction.progress.requiredSnapshots}`
  );

  doc.text(
    `Cognee Memory: ${burnoutPrediction.progress.cogneeMemory}`
  );
}

    // ===============================
    // RECOMMENDATIONS
    // ===============================

    doc
      .fontSize(20)
      .fillColor("#16A34A")
      .text("Recommendations");

    doc.moveDown();

    doc
      .fontSize(13)
      .fillColor("black")
      .text("• Maintain a consistent sleep schedule.")
      .text("• Schedule recovery breaks every 90–120 minutes.")
      .text("• Reduce excessive workload during high anxiety periods.")
      .text("• Continue activities that improve confidence.")
      .text("• Review this report weekly to monitor progress.");

    doc.moveDown(2);

    // ===============================
    // FOOTER
    // ===============================

    doc
      .fontSize(10)
      .fillColor("gray")
      .text(
        "Generated by Growth Companion using AI-powered cognitive analysis.",
        {
          align: "center",
        }
      );

    doc.end();
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};