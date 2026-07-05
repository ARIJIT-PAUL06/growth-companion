import Chat from "../models/Chat.js";
import {
  generateChatResponse,
  generateChatTitle,
} from "../services/geminiService.js";
import {
  rememberMemory,
  addTextMemory,
  recallMemory,
  cognifyMemory,
} from "../services/cogneeServices.js";
import { analyzeUserState } from "../services/analyticsService.js";
import ProgressSnapshot from "../models/ProgressSnapshot.js";

// CREATE EMPTY CHAT
export const createNewChat = async (req, res) => {
  try {
    const chat = await Chat.create({
      userId: "demo-user",
      title: "New Conversation",
      messages: [],
    });

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// SEND MESSAGE
export const chatController = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    let chat;

    if (chatId) {
      chat = await Chat.findById(chatId);

      if (!chat) {
        return res.status(404).json({
          error: "Chat not found",
        });
      }
    } else {
      chat = await Chat.create({
        userId: "demo-user",
        title: "New Conversation",
        messages: [],
      });
    }

    chat.messages.push({
      role: "user",
      content: message,
    });

    // Use the first user message as the temporary title
if (chat.messages.length === 1) {
  chat.title =
    message.length > 50
      ? message.slice(0, 50) + "..."
      : message;
}

    await chat.save();

    // ===== ANALYTICS + THROTTLED SNAPSHOT =====
    try {
      const analytics = await analyzeUserState(message);

      const lastSnapshot = await ProgressSnapshot.findOne({
        userId: "demo-user",
      }).sort({ createdAt: -1 });

      let shouldSave = false;

      if (!lastSnapshot) {
        shouldSave = true;
      } else {
        const now = Date.now();
        const lastTime = new Date(
          lastSnapshot.createdAt
        ).getTime();

        const minutesPassed =
          (now - lastTime) / (1000 * 60);

        const oldMetrics = lastSnapshot.coreMetrics;
        const newMetrics = analytics.coreMetrics;

        const significantChange =
          Math.abs(
            oldMetrics.anxiety - newMetrics.anxiety
          ) > 10 ||
          Math.abs(
            oldMetrics.confidence - newMetrics.confidence
          ) > 10 ||
          Math.abs(
            oldMetrics.energy - newMetrics.energy
          ) > 10 ||
          Math.abs(
            oldMetrics.emotionalHealth -
              newMetrics.emotionalHealth
          ) > 10;

        if (minutesPassed >= 5 || significantChange) {
          shouldSave = true;
        }
      }

      if (shouldSave) {
        await ProgressSnapshot.create({
          userId: "demo-user",
          coreMetrics: analytics.coreMetrics,
          signals: analytics.signals,
          summary: analytics.summary,
        });
      }
    } catch (err) {
      console.error(
        "Snapshot save failed:",
        err.message
      );
    }

    let memories = [];

    try {
      memories = await recallMemory(message);
    } catch (err) {
      console.error("Recall failed:", err.message);
    }

    const reply = await generateChatResponse(
      message,
      memories
    );

    chat.messages.push({
      role: "assistant",
      content: reply,
    });

    await chat.save();

    res.json({
      reply,
      chatId: chat._id,
    });

    addTextMemory(message)
  .then(() => cognifyMemory())
  .catch((err) =>
    console.error(
      "Background Cognee update failed:",
      err.message
    )
  );
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const getChatById = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      userId: "demo-user",
    }).sort({ updatedAt: -1 });

    // Only inspect the newest chat
    if (chats.length > 0) {
      const latestChat = chats[0];

      const shouldGenerate =
        !latestChat.titleGenerated ||
        latestChat.messages.length - latestChat.titleMessageCount >= 6;

      if (
        shouldGenerate &&
        latestChat.messages.length >= 6
      ) {
        try {
          const title = await generateChatTitle(
            latestChat.messages
          );

          latestChat.title = title;
          latestChat.titleGenerated = true;
          latestChat.titleMessageCount =
            latestChat.messages.length;

          await latestChat.save();
        } catch (err) {
          console.error(
            "Title generation failed:",
            err.message
          );
        }
      }
    }

    const updatedChats = await Chat.find({
      userId: "demo-user",
    }).sort({ updatedAt: -1 });

    res.json(updatedChats);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const deletedChat = await Chat.findByIdAndDelete(chatId);

    if (!deletedChat) {
      return res.status(404).json({
        error: "Chat not found",
      });
    }

    res.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: error.message,
    });
  }
};