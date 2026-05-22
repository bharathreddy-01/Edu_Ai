import { GoogleGenAI } from "@google/genai";

import { env } from "@/lib/env";
import { adaptDifficulty, buildAdaptationNote } from "@/lib/quiz/adaptive";
import { buildQuizGenerationPrompt } from "@/lib/quiz/prompts";
import { generatedQuizSchema } from "@/lib/quiz/schema";
import type { GeneratedQuiz, QuizGenerationRequest } from "@/lib/quiz/types";

function getClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

function parseJsonResponse(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch (e) {
    // If strict parsing fails, try cleaning it up
    const cleaned = text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    return JSON.parse(cleaned) as unknown;
  }
}

export async function generateAdaptiveQuiz(
  request: QuizGenerationRequest,
): Promise<GeneratedQuiz> {
  const difficulty = adaptDifficulty({
    requestedDifficulty: request.difficulty,
    recentAccuracy: request.recentAccuracy,
  });
  const normalizedRequest = {
    ...request,
    difficulty,
    recentAccuracy: request.recentAccuracy ?? 0,
  };
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: buildQuizGenerationPrompt(normalizedRequest),
    config: {
      temperature: 0.55,
      topP: 0.9,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });
  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty quiz response.");
  }

  const parsed = generatedQuizSchema.parse(parseJsonResponse(text));

  return {
    ...parsed,
    difficulty,
    adaptationNote:
      parsed.adaptationNote || buildAdaptationNote(difficulty, request.recentAccuracy),
    questions: parsed.questions.map((question, index) => ({
      ...question,
      id: question.id || `q${index + 1}`,
      marks: question.marks ?? 4,
      negativeMarks: question.negativeMarks ?? 1,
    })),
  };
}
