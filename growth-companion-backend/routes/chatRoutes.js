import express from "express";
import {
  chatController,
  getChatById,
  getAllChats,
  createNewChat,
  deleteChat,
} from "../controllers/chatController.js";

const chatRouter = express.Router();

chatRouter.post("/", chatController);
chatRouter.post("/new", createNewChat);
chatRouter.get("/", getAllChats);
chatRouter.get("/:chatId", getChatById);
chatRouter.delete("/:chatId", deleteChat);

export default chatRouter;