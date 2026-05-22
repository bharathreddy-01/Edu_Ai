import { getNextDifficulty } from "@/lib/quiz/adaptive";
import type {
  GeneratedQuizQuestion,
  QuizAnswer,
  QuizDifficulty,
  QuizSubmissionResult,
} from "@/lib/quiz/types";

export function scoreQuiz({
  questions,
  answers,
  difficulty,
}: {
  questions: GeneratedQuizQuestion[];
  answers: QuizAnswer[];
  difficulty: QuizDifficulty;
}): QuizSubmissionResult {
  const answerMap = new Map(
    answers.map((answer) => [answer.questionId, answer.selectedAnswer]),
  );
  const results = questions.map((question) => {
    const selectedAnswer = answerMap.get(question.id) ?? "";
    const isCorrect = selectedAnswer === question.correctAnswer;

    return {
      questionId: question.id,
      selectedAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      marksAwarded: isCorrect ? question.marks : -question.negativeMarks,
      explanation: question.explanation,
    };
  });
  const score = Math.max(
    results.reduce((total, result) => total + result.marksAwarded, 0),
    0,
  );
  const totalMarks = questions.reduce((total, question) => total + question.marks, 0);
  const correctCount = results.filter((result) => result.isCorrect).length;
  const accuracy = Math.round((correctCount / questions.length) * 100);
  const nextDifficulty = getNextDifficulty(difficulty, accuracy);

  return {
    score,
    totalMarks,
    accuracy,
    correctCount,
    totalQuestions: questions.length,
    nextDifficulty,
    feedback: buildFeedback(accuracy),
    results,
    leaderboardPoints: Math.round(score * 10 + accuracy),
  };
}

function buildFeedback(accuracy: number) {
  if (accuracy >= 85) {
    return "Excellent work. The engine will raise difficulty and mix concepts more aggressively.";
  }

  if (accuracy >= 65) {
    return "Solid progress. Keep the current difficulty and review the missed explanations.";
  }

  return "Focus on fundamentals before increasing speed. The next quiz should be slightly easier.";
}
