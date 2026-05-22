import { GoogleGenAI } from "@google/genai";

import { contentArtifactSchema } from "@/lib/content/schema";
import { buildContentGenerationPrompt } from "@/lib/content/prompts";
import type {
  ContentArtifact,
  ContentGenerationRequest,
} from "@/lib/content/types";
import { env } from "@/lib/env";

function getClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

function parseJsonResponse(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);

  if (!match) {
    throw new Error("Gemini did not return a JSON content artifact.");
  }

  return JSON.parse(match[0]) as unknown;
}

export async function generateContentArtifact(
  request: ContentGenerationRequest,
): Promise<ContentArtifact> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: buildContentGenerationPrompt(request),
    config: {
      temperature: 0.42,
      topP: 0.9,
      responseMimeType: "application/json",
      maxOutputTokens: 8192,
    },
  });
  const text = response.text;

  if (!text) {
    throw new Error("Gemini returned an empty content response.");
  }

  const parsed = contentArtifactSchema.parse(
    parseJsonResponse(text),
  ) as unknown as ContentArtifact;

  return {
    ...parsed,
    metadata: {
      ...parsed.metadata,
      model: env.GEMINI_MODEL,
    },
  };
}
