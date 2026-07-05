import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chatRoutes.js";
import connectDB from "./configs/db.js";
import progressRoutes from "./routes/progressRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.use("/api/chat", chatRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/progress", progressRoutes);