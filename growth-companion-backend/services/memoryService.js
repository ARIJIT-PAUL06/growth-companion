import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export const extractMemory = async (message) => {
  try {
    const prompt = `
Extract psychological memory from this user message.

Rules:
- emotion = main emotion in one word
- trigger = what caused the emotion
- topic = broad life area (career, family, relationships, health, self-worth)
- intensity = emotional intensity from 1 to 10

Intensity guide:
1-3 = mild emotion
4-6 = moderate distress
7-8 = strong distress
9-10 = extreme distress / crisis

Return ONLY valid raw JSON.
Do not use markdown.
Do not write explanations.
Do not write \`\`\`json.

Format:
{
  "emotion": "",
  "trigger": "",
  "topic": "",
  "intensity": 1
}

User message:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    const text = response.text.trim();

    return JSON.parse(text);

  } catch (error) {
    console.error("Memory extraction error:", error);
    return null;
  }
};