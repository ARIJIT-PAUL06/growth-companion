import mongoose from "mongoose";

const aiAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },

    memoryInsights: {
      type: Object,
      default: {},
    },

    burnout: {
      type: Object,
      default: {},
    },

    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("AIAnalysis", aiAnalysisSchema);