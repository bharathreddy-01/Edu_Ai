import { z } from "zod";
import type { DifficultLevel } from "@/types";

// Learning Level Schema
export const LearningLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

// Difficulty Level Schema
export const DifficultyLevelSchema = z.enum([
  "easy",
  "medium",
  "hard",
  "expert",
]);

// Quiz Question Schema
export const QuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(10),
  type: z.enum(["mcq", "short-answer", "essay"]),
  difficulty: DifficultyLevelSchema,
  subject: z.enum([
    "Physics",
    "Chemistry",
    "Math",
    "Biology",
    "General",
  ]),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().min(20),
  options: z.array(z.string()).optional().refine(
    (opts) => !opts || opts.length === 4,
    "MCQ must have exactly 4 options"
  ),
  hints: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  commonMistakes: z.array(z.string()).optional(),
  estimatedTimeSeconds: z.number().positive().optional(),
});

// Quiz Metadata Schema
export const QuizMetadataSchema = z.object({
  totalQuestions: z.number().min(1),
  difficulty: DifficultyLevelSchema,
  topics: z.array(z.string()).min(1),
  estimatedTime: z.number().positive(),
  learningLevel: LearningLevelSchema,
  passingScorePercent: z.number().min(0).max(100).optional(),
});

// Complete Quiz Schema
export const QuizSchema = z.object({
  quizMetadata: QuizMetadataSchema,
  questions: z.array(QuizQuestionSchema).min(1),
  answerKey: z
    .object({
      passingScorePercent: z.number().min(0).max(100),
      totalPoints: z.number().positive(),
      distribution: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
});

// Answer Evaluation Schema
export const AnswerEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(["perfect", "good", "partial", "weak", "incorrect"]),
  correctness: z.boolean(),
  strengths: z.array(z.string()),
  errors: z.array(z.string()).optional(),
  misconceptions: z.array(z.string()).optional(),
  feedback: z.string().min(20),
  suggestions: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

// Evaluation Result Schema
export const EvaluationResultSchema = z.object({
  evaluationId: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  studentLevel: LearningLevelSchema,
  subject: z.enum(["Physics", "Chemistry", "Math", "Biology", "General"]),

  performanceMetrics: z.object({
    scorePercent: z.number().min(0).max(100),
    maxScore: z.number().positive(),
    accuracy: z.number().min(0).max(100).optional(),
    speed: z.enum(["fast", "normal", "slow"]).optional(),
    completionStatus: z.enum(["completed", "incomplete", "abandoned"]),
  }),

  assessment: z.object({
    conceptualUnderstanding: z.number().min(0).max(100),
    applicationAbility: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    communication: z.number().min(0).max(100),
  }),

  strengths: z
    .array(
      z.object({
        area: z.string(),
        evidence: z.string(),
        developmentLevel: z.enum([
          "emerging",
          "developing",
          "proficient",
          "expert",
        ]),
      })
    )
    .optional(),

  areasForImprovement: z
    .array(
      z.object({
        area: z.string(),
        specificGap: z.string(),
        impactOnLearning: z.string(),
        remediationStrategy: z.string(),
      })
    )
    .optional(),

  misconceptions: z
    .array(
      z.object({
        misconception: z.string(),
        correctUnderstanding: z.string(),
        whyItHappens: z.string(),
        correctionResource: z.string(),
      })
    )
    .optional(),

  nextSteps: z
    .array(
      z.object({
        priority: z.enum(["high", "medium", "low"]),
        action: z.string(),
        resources: z.array(z.string()).optional(),
        timeline: z.string().optional(),
      })
    )
    .optional(),

  motivationNote: z.string().optional(),
});

// Study Plan Schema
export const DailyTaskSchema = z.object({
  day: z.string(),
  focusTopic: z.string(),
  learningActivities: z.array(z.string()),
  practiceProblems: z.number().min(0),
  estimatedHours: z.number().positive(),
  assessment: z.string().optional(),
  resources: z.array(z.string()).optional(),
});

export const WeeklyPlanSchema = z.object({
  weekNumber: z.number().positive(),
  weekTitle: z.string(),
  learningOutcomes: z.array(z.string()).min(1),
  topics: z.array(z.string()).min(1),
  dailySchedule: z.array(DailyTaskSchema),
  weeklyCheckpoint: z.object({
    type: z.enum(["quiz", "test", "project"]),
    targetScore: z.number().min(0).max(100),
    topicsCovered: z.array(z.string()),
  }),
  notes: z.string().optional(),
});

export const StudyPlanSchema = z.object({
  planId: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  studentLevel: LearningLevelSchema,
  subject: z.enum(["Physics", "Chemistry", "Math", "Biology", "General"]),
  totalDurationWeeks: z.number().positive(),
  totalAllocatedHours: z.number().positive(),

  planOverview: z.object({
    goal: z.string(),
    scope: z.string(),
    successCriteria: z.array(z.string()),
  }),

  weeklyBreakdown: z.array(WeeklyPlanSchema).min(1),

  revisionSchedule: z
    .array(
      z.object({
        revisionCycle: z.number().positive(),
        topics: z.array(z.string()),
        timing: z.string(),
        durationHours: z.number().positive(),
        method: z.enum(["active-recall", "spaced-repetition", "practice"]),
      })
    )
    .optional(),

  resources: z.object({
    primary: z.array(z.string()).optional(),
    practice: z.array(z.string()).optional(),
    supplementary: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
  }),

  progressTracking: z.object({
    frequency: z.enum(["daily", "weekly", "bi-weekly"]),
    metrics: z.array(z.string()),
    adjustmentTriggers: z.string().optional(),
  }),

  flexibility: z.object({
    catchUpStrategies: z.string().optional(),
    enrichmentOptions: z.string().optional(),
    supportResources: z.string().optional(),
  }),
});

// Prompt Configuration Schema
export const SystemPromptConfigSchema = z.object({
  subject: z.enum(["Physics", "Chemistry", "Math", "Biology", "General"]),
  learningLevel: LearningLevelSchema,
  mode: z.enum(["tutoring", "quiz", "evaluation", "planning"]),
  context: z.string().optional(),
  safetyLevel: z.enum(["strict", "moderate", "flexible"]).optional(),
});

// Response Validation Schema
export const ResponseValidationSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()).optional(),
  warnings: z.array(z.string()).optional(),
  sanitized: z.boolean().optional(),
});

// Structured Output Schema (Generic wrapper)
export const StructuredOutputSchema = z.object({
  success: z.boolean(),
  data: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  warnings: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Export types from schemas
export type LearningLevel = z.infer<typeof LearningLevelSchema>;
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type QuizMetadata = z.infer<typeof QuizMetadataSchema>;
export type Quiz = z.infer<typeof QuizSchema>;
export type AnswerEvaluation = z.infer<typeof AnswerEvaluationSchema>;
export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;
export type StudyPlan = z.infer<typeof StudyPlanSchema>;
export type SystemPromptConfig = z.infer<typeof SystemPromptConfigSchema>;
export type ResponseValidation = z.infer<typeof ResponseValidationSchema>;
export type StructuredOutput = z.infer<typeof StructuredOutputSchema>;
