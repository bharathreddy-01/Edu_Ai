import type { QuizDifficulty, QuizSubject } from "@/lib/quiz/types";

export type TopicPerformanceInput = {
  topicId: string;
  topicName: string;
  subject: QuizSubject;
  attempts: number;
  correct: number;
  averageTimeSeconds: number;
  difficulty: QuizDifficulty;
  lastPracticedAt?: string;
  currentMastery?: number;
};

export type TopicMastery = TopicPerformanceInput & {
  accuracy: number;
  masteryScore: number;
  weaknessScore: number;
  isWeak: boolean;
  nextDifficulty: QuizDifficulty;
  nextRevisionAt: string;
};

export type LearningPathItem = {
  topicId: string;
  title: string;
  subject: QuizSubject;
  priority: "high" | "medium" | "low";
  reason: string;
  recommendedAction: "concept_review" | "guided_practice" | "adaptive_quiz" | "mock_review";
  estimatedMinutes: number;
  targetDifficulty: QuizDifficulty;
};

export type AdaptiveRecommendation = {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionLabel: string;
  topicId?: string;
};

export type AdaptiveSnapshot = {
  mastery: TopicMastery[];
  weakTopics: TopicMastery[];
  learningPath: LearningPathItem[];
  recommendations: AdaptiveRecommendation[];
  readinessScore: number;
};
