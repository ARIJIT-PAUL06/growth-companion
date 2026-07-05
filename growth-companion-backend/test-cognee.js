import { init, Cognee } from "@cognee/cognee-ts";
import dotenv from "dotenv";

dotenv.config();

init();

const c = new Cognee({
  llmProvider: "gemini",
  llmModel: "gemini/gemini-2.5-flash",
  llmApiKey: process.env.GEMINI_API_KEY,

  embeddingProvider: "mock"
});

try {
  console.log("Warming up Cognee...");
  await c.warm();

  console.log("Storing memory...");
  await c.remember(
    {
      type: "text",
      text: "Arijit feels anxious when comparing career progress with peers."
    },
    "growth-memory"
  );

  console.log("Recalling...");
  const result = await c.recall(
    "Why does Arijit feel behind?"
  );

  console.log(result);
} catch (error) {
  console.error("Cognee error:", error);
}