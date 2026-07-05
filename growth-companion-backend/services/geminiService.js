import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY?.slice(0, 10));
console.log("GEMINI_MODEL:", process.env.GEMINI_MODEL);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const generateChatResponse = async (message, memories = []) => {
  const memoryContext =
    memories && memories.length
      ? memories.map((memory) => memory.text).join("\n")
      : "No previous memories.";

  const prompt = `
You are Growth Companion, an AI psychological growth coach.

Your job:
- Understand emotions deeply
- Identify recurring behavioral patterns
- Point out self-sabotage, avoidance, fear, or contradictions when relevant
- Be warm but honest
- Avoid generic motivational fluff
- Keep responses concise but meaningful

Past memories about user:
${memoryContext}

Current user message:
${message}

Respond naturally as a conversational AI companion.
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: prompt,
  });

  return response.text;
};

export const generateChatTitle = async (messages) => {
  // Use only the most recent messages to reduce token usage
  const conversation = messages
    .slice(-30)
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n");

  const prompt = `
You are generating titles for an AI companion chat sidebar.

Rules:
- Maximum 4 words.
- No quotation marks.
- No markdown.
- No full sentence.
- Capture the MAIN topic of the conversation.
- Prefer psychological or personal-growth themes.
- If appropriate, begin with one relevant emoji.
- Return ONLY the title.

Conversation:

${conversation}
`;

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL,
    contents: prompt,
  });

  return response.text.trim();
};