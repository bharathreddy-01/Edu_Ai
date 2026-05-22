import type { LearningLevel, LearningMode, DifficultLevel } from "@/types";

export type TutorSubject =
  | "Physics"
  | "Chemistry"
  | "Math"
  | "Biology"
  | "General";

export type TutorMessage = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

export type TutorRequest = {
  message: string;
  subject: TutorSubject;
  sessionId?: string;
  history?: TutorMessage[];
  learningLevel?: LearningLevel;
  mode?: LearningMode;
};

export type TutorStreamResult = {
  stream: AsyncGenerator<string>;
  model: string;
};

// Prompt Engineering Types
export type SystemPromptConfig = {
  subject: TutorSubject;
  learningLevel: LearningLevel;
  mode: LearningMode;
  context?: string;
  safetyLevel?: "strict" | "moderate" | "flexible";
};

export type QuizQuestion = {
  id: string;
  question: string;
  type: "mcq" | "short-answer" | "essay";
  difficulty: DifficultLevel;
  subject: TutorSubject;
  correctAnswer: string | string[];
  explanation: string;
  options?: string[];
  hints?: string[];
  keywords?: string[];
};

export type QuizMetadata = {
  totalQuestions: number;
  difficulty: DifficultLevel;
  topics: string[];
  estimatedTime: number;
  learningLevel: LearningLevel;
};

export type EvaluationResult = {
  score: number;
  maxScore: number;
  percentage: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  keyMisunderstandings?: string[];
  conceptsToReview?: string[];
  nextSteps: string[];
};

export type StudyPlan = {
  weekNumber: number;
  topics: string[];
  dailyHours: number;
  resources: string[];
  checkpoints: string[];
  assessments: string[];
  priority: DifficultLevel;
};

export type StructuredOutput<T> = {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, unknown>;
};

export type ResponseValidation = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitized: boolean;
};
