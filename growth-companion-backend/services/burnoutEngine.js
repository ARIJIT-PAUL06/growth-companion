export const predictBurnout = ({
  latestSnapshot,
  history = [],
  topSignals = {},
  memoryInsights = null,
}) => {
  const MIN_HISTORY = 15;
  const MIN_MEMORIES = 5;

  // -----------------------------
  // Wait until enough evidence exists
  // -----------------------------
  if (
  !latestSnapshot ||
  history.length < MIN_HISTORY ||
  !memoryInsights
) {
    return {
      status: "collecting_data",

     progress: {
  snapshots: history.length,
  requiredSnapshots: MIN_HISTORY,

  cogneeMemory:
    memoryInsights ? "Available" : "Not Available",
},

      message:
        "Collecting sufficient long-term behavioural evidence before making a burnout prediction.",
    };
  }

  const {
    anxiety = 50,
    energy = 50,
    emotionalHealth = 50,
    confidence = 50,
  } = latestSnapshot;

  // -----------------------------
  // Base burnout score
  // -----------------------------
  let score =
    anxiety * 0.35 +
    (100 - energy) * 0.30 +
    (100 - emotionalHealth) * 0.20 +
    (100 - confidence) * 0.15;

  // -----------------------------
  // Psychological signal boosts
  // -----------------------------
  score += (topSignals.burnout || 0) * 0.08;
  score += (topSignals.exhaustion || 0) * 0.06;
  score += (topSignals.academic_pressure || 0) * 0.05;
  score += (topSignals.self_doubt || 0) * 0.05;
  score += (topSignals.overthinking || 0) * 0.04;

  // -----------------------------
  // Long-term trend analysis
  // -----------------------------
  const old = history[Math.max(0, history.length - 10)];
  const latest = history[history.length - 1];

  score += (old.energy - latest.energy) * 0.8;
  score += (latest.anxiety - old.anxiety) * 0.6;
  score += (old.confidence - latest.confidence) * 0.4;

  // -----------------------------
  // Cognee Memory Intelligence
  // -----------------------------
  const evidence = [];

  if (memoryInsights) {
    const text = JSON.stringify(memoryInsights).toLowerCase();

    if (text.includes("academic")) {
      score += 4;
      evidence.push("Persistent academic pressure");
    }

    if (text.includes("comparison")) {
      score += 3;
      evidence.push("Recurring self-comparison");
    }

    if (text.includes("sleep")) {
      score += 5;
      evidence.push("Repeated sleep-related concerns");
    }

    if (text.includes("exhaust")) {
      score += 5;
      evidence.push("Repeated exhaustion");
    }

    if (text.includes("burnout")) {
      score += 6;
      evidence.push("Long-term burnout indicators");
    }

    if (text.includes("stress")) {
      score += 3;
      evidence.push("Persistent stress pattern");
    }

    if (text.includes("fear")) {
      score += 2;
      evidence.push("Recurring fear-based thoughts");
    }
  }

  // -----------------------------
  // Clamp score
  // -----------------------------
  score = Math.max(0, Math.min(100, Math.round(score)));

  let risk;
  let daysToBurnout;

  if (score >= 85) {
    risk = "Critical";
    daysToBurnout = 3;
  } else if (score >= 70) {
    risk = "High";
    daysToBurnout = 7;
  } else if (score >= 50) {
    risk = "Moderate";
    daysToBurnout = 14;
  } else {
    risk = "Low";
    daysToBurnout = 30;
  }

  // -----------------------------
  // Prediction Confidence
  // -----------------------------
  let predictionConfidence = 50;

  predictionConfidence += Math.min(history.length, 30);

  if (memoryInsights) {
  predictionConfidence += 15;
}

  predictionConfidence += Math.min(evidence.length * 3, 10);

  predictionConfidence = Math.min(
    predictionConfidence,
    95
  );

  return {
    status: "ready",

    score,

    risk,

    confidence: predictionConfidence,

    daysToBurnout,

    evidence,

    reason:
      evidence.length > 0
        ? evidence.join(", ")
        : "Prediction based on long-term behavioural trends.",
  };
};