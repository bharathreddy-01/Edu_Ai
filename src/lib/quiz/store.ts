import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  GeneratedQuiz,
  GeneratedQuizQuestion,
  QuizSubmissionResult,
} from "@/lib/quiz/types";

export async function saveGeneratedQuiz({
  supabase,
  userId,
  quiz,
}: {
  supabase: SupabaseClient;
  userId: string;
  quiz: GeneratedQuiz;
}) {
  const totalMarks = quiz.questions.reduce(
    (total, question) => total + question.marks,
    0,
  );
  const { data: quizRow, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      created_by: userId,
      title: quiz.title,
      description: quiz.adaptationNote,
      exam_track: quiz.subject === "Biology" ? "neet" : "jee",
      status: "published",
      duration_minutes: Math.ceil(quiz.durationSeconds / 60),
      total_marks: totalMarks,
      negative_marks: 1,
      metadata: {
        subject: quiz.subject,
        topic: quiz.topic,
        difficulty: quiz.difficulty,
        learningLevel: quiz.learningLevel,
        source: "gemini",
      },
    })
    .select("id")
    .single();

  if (quizError || !quizRow?.id) {
    throw new Error(quizError?.message ?? "Could not save generated quiz.");
  }

  const questionPayload = quiz.questions.map((question, index) => ({
    quiz_id: quizRow.id,
    question_text: question.question,
    options: question.options,
    correct_answer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: difficultyToNumber(question.difficulty),
    marks: question.marks,
    negative_marks: question.negativeMarks,
    display_order: index + 1,
  }));
  const { data: questionRows, error: questionError } = await supabase
    .from("quiz_questions")
    .insert(questionPayload)
    .select("id, display_order");

  if (questionError || !questionRows) {
    throw new Error(questionError?.message ?? "Could not save quiz questions.");
  }

  const idByOrder = new Map(
    questionRows.map((row) => [Number(row.display_order), String(row.id)]),
  );

  return {
    ...quiz,
    id: String(quizRow.id),
    questions: quiz.questions.map((question, index) => ({
      ...question,
      id: idByOrder.get(index + 1) ?? question.id,
    })),
  };
}

export async function loadQuizForScoring({
  supabase,
  quizId,
}: {
  supabase: SupabaseClient;
  quizId: string;
}) {
  const { data: quizRow, error: quizError } = await supabase
    .from("quizzes")
    .select("id, metadata")
    .eq("id", quizId)
    .single();

  if (quizError || !quizRow) {
    throw new Error(quizError?.message ?? "Quiz not found.");
  }

  const { data: questionRows, error: questionError } = await supabase
    .from("quiz_questions")
    .select("id, question_text, options, correct_answer, explanation, difficulty, marks, negative_marks")
    .eq("quiz_id", quizId)
    .order("display_order", { ascending: true });

  if (questionError || !questionRows) {
    throw new Error(questionError?.message ?? "Quiz questions not found.");
  }

  const metadata = (quizRow.metadata ?? {}) as {
    difficulty?: GeneratedQuizQuestion["difficulty"];
  };

  return {
    difficulty: metadata.difficulty ?? "medium",
    questions: questionRows.map((row) => ({
      id: String(row.id),
      question: String(row.question_text),
      topic: "",
      difficulty: numberToDifficulty(Number(row.difficulty)),
      options: Array.isArray(row.options) ? row.options.map(String) : [],
      correctAnswer: String(row.correct_answer),
      explanation: String(row.explanation ?? ""),
      hint: "",
      estimatedTimeSeconds: 120,
      marks: Number(row.marks ?? 4),
      negativeMarks: Number(row.negative_marks ?? 1),
    })),
  };
}

export async function saveQuizAttempt({
  supabase,
  userId,
  quizId,
  result,
  timeSpentSeconds,
}: {
  supabase: SupabaseClient;
  userId: string;
  quizId: string;
  result: QuizSubmissionResult;
  timeSpentSeconds: number;
}) {
  const { data: attempt, error: attemptError } = await supabase
    .from("quiz_attempts")
    .insert({
      quiz_id: quizId,
      student_id: userId,
      status: "submitted",
      score: result.score,
      accuracy: result.accuracy,
      submitted_at: new Date().toISOString(),
      time_spent_seconds: timeSpentSeconds,
      ai_review: {
        feedback: result.feedback,
        nextDifficulty: result.nextDifficulty,
      },
    })
    .select("id")
    .single();

  if (attemptError || !attempt?.id) {
    throw new Error(attemptError?.message ?? "Could not save quiz attempt.");
  }

  const { error: answersError } = await supabase.from("quiz_answers").insert(
    result.results.map((answer) => ({
      attempt_id: attempt.id,
      question_id: answer.questionId,
      selected_answer: answer.selectedAnswer,
      is_correct: answer.isCorrect,
      marks_awarded: answer.marksAwarded,
    })),
  );

  if (answersError) {
    throw new Error(answersError.message);
  }

  await updateLeaderboard({
    supabase,
    userId,
    points: result.leaderboardPoints,
    timeSpentSeconds,
    correctCount: result.correctCount,
  });

  return String(attempt.id);
}

async function updateLeaderboard({
  supabase,
  userId,
  points,
  timeSpentSeconds,
  correctCount,
}: {
  supabase: SupabaseClient;
  userId: string;
  points: number;
  timeSpentSeconds: number;
  correctCount: number;
}) {
  const now = new Date();
  const periodStart = startOfWeek(now).toISOString().slice(0, 10);
  const periodEnd = endOfWeek(now).toISOString().slice(0, 10);

  await supabase.from("leaderboard_entries").upsert(
    {
      student_id: userId,
      period: "weekly",
      period_start: periodStart,
      period_end: periodEnd,
      score: points,
      study_minutes: Math.ceil(timeSpentSeconds / 60),
      questions_correct: correctCount,
    },
    { onConflict: "student_id,period,period_start" },
  );
}

function difficultyToNumber(difficulty: GeneratedQuizQuestion["difficulty"]) {
  return { easy: 1, medium: 2, hard: 4, expert: 5 }[difficulty];
}

function numberToDifficulty(value: number): GeneratedQuizQuestion["difficulty"] {
  if (value >= 5) return "expert";
  if (value >= 4) return "hard";
  if (value >= 2) return "medium";
  return "easy";
}

function startOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}
