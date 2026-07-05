import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeUserState = async (message) => {
  try {
    const prompt = `
You are Cognee's cognitive analytics engine.

Your task is to psychologically analyze a user's message and extract meaningful mental-state signals.

Return ONLY valid JSON.
No markdown.
No explanation.
No extra text.

IMPORTANT ANALYSIS RULES:

1. emotionalHealth: 0-100
Higher means emotionally healthier and more stable.

2. anxiety: 0-100
Higher means more stress, fear, overthinking, or worry.

3. confidence: 0-100
Higher means stronger self-belief and clarity.

4. energy: 0-100
Higher means more motivation, drive, and mental energy.

5. Extract 2-5 dominant psychological signals.

Signal naming rules:
- lowercase only
- use underscores
- concise
- emotionally meaningful

Examples:
burnout
self_doubt
career_pressure
loneliness
fear_of_failure
overthinking
impostor_syndrome
resilience
motivation_loss

6. Each signal gets intensity score 0-100.

7. Summary rules (VERY IMPORTANT):
Write 2-3 sentences maximum.
The summary must sound intelligent, insightful, and specific.
Avoid generic therapy language.

BAD:
"The user feels stressed and anxious."

GOOD:
"Burnout appears to be the dominant signal, driven mainly by sustained academic pressure and mental exhaustion. Despite elevated anxiety, confidence remains partially intact, suggesting the user feels overwhelmed but not defeated."

Focus on:
- root cause
- strongest signal
- contradictions (example: high anxiety but decent confidence)
- resilience if present

Return EXACT JSON structure:

{
  "coreMetrics": {
    "emotionalHealth": 50,
    "anxiety": 50,
    "confidence": 50,
    "energy": 50
  },
  "signals": {
    "example_signal": 70
  },
  "summary": "Insightful psychological analysis"
}

User message:
"${message}"
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: prompt,
    });

    const text = response.text.trim();

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error("Analytics error:", error.message);

    return {
      coreMetrics: {
        emotionalHealth: 50,
        anxiety: 50,
        confidence: 50,
        energy: 50,
      },
      signals: {},
      summary: "Analytics unavailable.",
    };
  }
};

export const generateMemoryInsights = async (memories) => {
  try {
    const prompt = `
You are an AI cognitive psychologist.

Below are long-term memories recalled from Cognee.

Your job is to identify long-term behavioural patterns.

Return ONLY valid JSON.

Format:

{
  "recurringThemes": [
    "Theme 1",
    "Theme 2",
    "Theme 3"
  ],
  "behaviorPattern": "",
  "positiveGrowth": "",
  "memorySummary": ""
}

Memories:

${JSON.stringify(memories)}
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL,
      contents: prompt,
    });

    const cleaned = response.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Memory Insight Error:", error.message);

    return {
      recurringThemes: [],
      behaviorPattern: "Not enough data.",
      positiveGrowth: "Not enough data.",
      memorySummary: "No long-term memories available.",
    };
  }
};