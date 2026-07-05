import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "New Conversation",
    },

    // Has Gemini generated an AI title yet?
    titleGenerated: {
      type: Boolean,
      default: false,
    },

    // Number of messages when the title was last generated
    titleMessageCount: {
      type: Number,
      default: 0,
    },

    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;