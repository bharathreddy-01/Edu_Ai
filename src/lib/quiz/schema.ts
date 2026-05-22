import { z } from "zod";

export const quizDifficultySchema = z.enum(["easy", "medium", "hard", "expert"]);
export const quizSubjectSchema = z.enum(["Physics", "Chemistry", "Math", "Biology"]);

export const generatedQuizQuestionSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(10),
  topic: z.string().min(1),
  difficulty: quizDifficultySchema,
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(10),
  hint: z.string().min(3),
  estimatedTimeSeconds: z.number().int().min(30).max(1200),
  marks: z.number().positive().default(4),
  negativeMarks: z.number().min(0).default(1),
});

export const generatedQuizSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3),
  subject: quizSubjectSchema,
  topic: z.string().min(1),
  difficulty: quizDifficultySchema,
  learningLevel: z.enum(["beginner", "intermediate", "advanced"]),
  durationSeconds: z.number().int().min(60).max(7200),
  adaptationNote: z.string().min(10),
  questions: z.array(generatedQuizQuestionSchema).min(1).max(20),
});

export const quizGenerationRequestSchema = z.object({
  subject: quizSubjectSchema,
  topic: z.string().trim().min(2).max(120),
  learningLevel: z.enum(["beginner", "intermediate", "advanced"]),
  difficulty: quizDifficultySchema.optional(),
  questionCount: z.number().int().min(3).max(15),
  recentAccuracy: z.number().min(0).max(100).optional(),
});

export const quizSubmissionRequestSchema = z.object({
  quizId: z.string().uuid(),
  timeSpentSeconds: z.number().int().min(0).max(24 * 60 * 60),
  answers: z
    .array(
      z.object({
        questionId: z.string().uuid(),
        selectedAnswer: z.string(),
      }),
    )
    .min(1),
});
