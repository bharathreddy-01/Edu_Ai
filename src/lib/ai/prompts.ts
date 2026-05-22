import type { TutorMessage, TutorSubject, SystemPromptConfig } from "@/lib/ai/types";
import { buildTutorSystemPrompt as buildSystemPrompt } from "@/lib/ai/system-prompts";
import { PromptBuilder } from "@/lib/ai/prompt-builder";

/**
 * Build system prompt for a tutor session
 * @deprecated Use PromptBuilder.buildTutoringPrompt instead
 */
export function buildTutorSystemPrompt(subject: TutorSubject) {
  return buildSystemPrompt({
    subject,
    learningLevel: "intermediate",
    mode: "tutoring",
  });
}

/**
 * Build system prompt with full configuration
 */
export function buildConfiguredSystemPrompt(config: SystemPromptConfig) {
  return buildSystemPrompt(config);
}

/**
 * Build conversation context for Gemini API
 */
export function buildConversationContext(history: TutorMessage[]) {
  return history
    .filter((message) => message.role !== "system")
    .slice(-8)
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));
}

// Re-export commonly used functions
export { PromptBuilder, promptTemplates } from "@/lib/ai/prompt-builder";
export * from "@/lib/ai/system-prompts";
export * from "@/lib/ai/quiz-prompts";
export * from "@/lib/ai/evaluation-prompts";
export * from "@/lib/ai/study-planner-prompts";
export { ResponseValidator, validationHelpers } from "@/lib/ai/response-validator";
export { safetyUtils, antiHallucinationChecks } from "@/lib/ai/guardrails";
