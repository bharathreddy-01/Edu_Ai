/**
 * Central export file for the AI Prompt Engineering System
 * Provides clean public API for all prompt building and validation utilities
 */

// Core Type Definitions
export type {
  TutorSubject,
  TutorMessage,
  TutorRequest,
  TutorStreamResult,
  SystemPromptConfig,
  QuizQuestion,
  QuizMetadata,
  EvaluationResult,
  StudyPlan,
  StructuredOutput,
  ResponseValidation,
} from "@/lib/ai/types";

// System Prompts
export {
  buildQuizSystemPrompt,
  buildEvaluationSystemPrompt,
  buildStudyPlannerSystemPrompt,
  contextualPrompts,
  knowledgeBoundaries,
} from "@/lib/ai/system-prompts";

// Quiz Prompts
export {
  quizPromptTemplates,
  buildQuizGenerationPrompt,
  buildAnswerEvaluationPrompt,
  quizStructureTemplate,
} from "@/lib/ai/quiz-prompts";

// Evaluation Prompts
export {
  evaluationPromptTemplates,
  buildConceptAssessmentPrompt,
  buildPerformanceReviewPrompt,
  buildMisconceptionCorrectionPrompt,
  buildLearningStyleAssessmentPrompt,
  evaluationResultSchema,
} from "@/lib/ai/evaluation-prompts";

// Study Planner Prompts
export {
  studyPlannerPromptTemplates,
  buildStudyPlanGenerationPrompt,
  buildProgressTrackingPrompt,
  buildWeakAreaRecoveryPrompt,
  buildExamReadinessPrompt,
  studyPlanSchema,
} from "@/lib/ai/study-planner-prompts";

// Schemas for Validation
export * from "@/lib/ai/schemas";

// Safety & Anti-Hallucination
export {
  safetyGuardrails,
  antiHallucinationChecks,
  checkForForbiddenContent,
  validateTopic,
  detectUncertainty,
  assessResponseQuality,
  factVerificationChecklist,
  safetyUtils,
} from "@/lib/ai/guardrails";

// Response Validation
export {
  ResponseValidator,
  validationHelpers,
} from "@/lib/ai/response-validator";

// Prompt Builder
export {
  PromptBuilder,
  promptTemplates,
} from "@/lib/ai/prompt-builder";

// Main API
export {
  buildTutorSystemPrompt,
  buildConfiguredSystemPrompt,
  buildConversationContext,
} from "@/lib/ai/prompts";

// Re-export from types
export type { LearningLevel, LearningMode, DifficultLevel } from "@/types";
