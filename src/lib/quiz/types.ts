import type { DifficultLevel, LearningLevel } from "@/types";
import type { TutorSubject } from "@/lib/ai/types";

export type QuizDifficulty = DifficultLevel;
export type QuizSubject = Exclude<TutorSubject, "General">;

export type GeneratedQuizQuestion = {
  id: string;
  question: string;
  topic: string;
  difficulty: QuizDifficulty;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  estimatedTimeSeconds: number;
  marks: number;
  negativeMarks: number;
};

export type GeneratedQuiz = {
  id?: string;
  title: string;
  subject: QuizSubject;
  topic: string;
  difficulty: QuizDifficulty;
  learningLevel: LearningLevel;
  durationSeconds: number;
  questions: GeneratedQuizQuestion[];
  adaptationNote: string;
};

export type QuizGenerationRequest = {
  subject: QuizSubject;
  topic: string;
  learningLevel: LearningLevel;
  difficulty?: QuizDifficulty;
  questionCount: number;
  recentAccuracy?: number;
};

export type QuizAnswer = {
  questionId: string;
  selectedAnswer: string;
};

export type QuizSubmissionRequest = {
  quizId: string;
  answers: QuizAnswer[];
  timeSpentSeconds: number;
};

export type QuizQuestionResult = {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  marksAwarded: number;
  explanation: string;
};

export type QuizSubmissionResult = {
  attemptId?: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  correctCount: number;
  totalQuestions: number;
  nextDifficulty: QuizDifficulty;
  feedback: string;
  results: QuizQuestionResult[];
  leaderboardPoints: number;
};
