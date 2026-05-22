import { GoogleGenAI } from "@google/genai";

import {
  buildConversationContext,
  buildTutorSystemPrompt,
} from "@/lib/ai/prompts";
import type { TutorRequest, TutorStreamResult } from "@/lib/ai/types";
import { env } from "@/lib/env";

function getGeminiClient() {
  if (!env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
}

function extractChunkText(chunk: unknown) {
  if (
    chunk &&
    typeof chunk === "object" &&
    "text" in chunk &&
    typeof chunk.text === "string"
  ) {
    return chunk.text;
  }

  return "";
}

export async function streamTutorResponse(
  request: TutorRequest,
): Promise<TutorStreamResult> {
  const ai = getGeminiClient();
  const model = env.GEMINI_MODEL;
  const contents = [
    ...buildConversationContext(request.history ?? []),
    {
      role: "user",
      parts: [{ text: request.message }],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    contents,
    config: {
      systemInstruction: buildTutorSystemPrompt(request.subject),
      temperature: 0.45,
      topP: 0.9,
      maxOutputTokens: 1536,
    },
  });

  async function* stream() {
    for await (const chunk of response) {
      const text = extractChunkText(chunk);

      if (text) {
        yield text;
      }
    }
  }

  return { stream: stream(), model };
}
