import dotenv from "dotenv";
dotenv.config();

import connectDB from "./configs/db.js";
import ProgressSnapshot from "./models/ProgressSnapshot.js";

const generateSnapshots = () => {
  const snapshots = [];

  // Starting point (bad mental state)
  let emotionalHealth = 28;
  let anxiety = 88;
  let confidence = 24;
  let energy = 18;

  for (let i = 0; i < 24; i++) {
    // Simulate gradual recovery
    emotionalHealth += Math.random() * 4;
    anxiety -= Math.random() * 3.5;
    confidence += Math.random() * 3.2;
    energy += Math.random() * 3.8;

    emotionalHealth = Math.min(85, emotionalHealth);
    anxiety = Math.max(35, anxiety);
    confidence = Math.min(82, confidence);
    energy = Math.min(80, energy);

    let signals = {};
    let summary = "";

    if (i < 8) {
      signals = {
        burnout: 92 - i,
        academic_pressure: 88 - i,
        self_doubt: 82 - i,
      };

      summary =
        "Severe burnout dominates the user's mental state, driven by intense academic pressure and depleted emotional energy.";
    } else if (i < 16) {
      signals = {
        overthinking: 75 - (i - 8),
        fatigue: 70 - (i - 8),
        resilience: 45 + (i - 8),
      };

      summary =
        "Anxiety remains elevated, but resilience is emerging as the user gradually regains stability and emotional control.";
    } else {
      signals = {
        resilience: 78 + (i - 16),
        consistency: 72 + (i - 16),
        motivation: 68 + (i - 16),
      };

      summary =
        "Recovery is becoming visible. Confidence and energy are improving steadily, indicating stronger emotional resilience and consistency.";
    }

    const date = new Date();
    date.setDate(date.getDate() - (24 - i));

    snapshots.push({
      userId: "demo-user",
      coreMetrics: {
        emotionalHealth: Math.round(emotionalHealth),
        anxiety: Math.round(anxiety),
        confidence: Math.round(confidence),
        energy: Math.round(energy),
      },
      signals,
      summary,
      createdAt: date,
      updatedAt: date,
    });
  }

  return snapshots;
};

const seed = async () => {
  try {
    await connectDB();

    console.log("Connected to DB");

    await ProgressSnapshot.deleteMany({
      userId: "demo-user",
    });

    console.log("Old snapshots deleted");

    const snapshots = generateSnapshots();

    await ProgressSnapshot.insertMany(snapshots);

    console.log(
      `${snapshots.length} demo snapshots inserted`
    );

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();