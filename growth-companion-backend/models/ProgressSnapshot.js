import mongoose from "mongoose";

const progressSnapshotSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    coreMetrics: {
      emotionalHealth: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      anxiety: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
      energy: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
      },
    },

    signals: {
      type: Map,
      of: Number,
      default: {},
    },

    summary: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const ProgressSnapshot = mongoose.model(
  "ProgressSnapshot",
  progressSnapshotSchema
);

export default ProgressSnapshot;