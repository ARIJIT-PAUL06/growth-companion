import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  emotion: {
    type: String
  },
  trigger: {
    type: String
  },
  topic: {
    type: String
  },
  intensity: {
    type: Number
  }
}, { timestamps: true });

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;