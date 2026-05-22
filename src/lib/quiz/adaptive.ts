import type { QuizDifficulty } from "@/lib/quiz/types";

const difficultyOrder: QuizDifficulty[] = ["easy", "medium", "hard", "expert"];

export function adaptDifficulty({
  requestedDifficulty,
  recentAccuracy,
}: {
  requestedDifficulty?: QuizDifficulty;
  recentAccuracy?: number;
}): QuizDifficulty {
  if (requestedDifficulty) {
    return requestedDifficulty;
  }

  if (recentAccuracy === undefined) {
    return "medium";
  }

  if (recentAccuracy >= 88) {
    return "hard";
  }

  if (recentAccuracy >= 72) {
    return "medium";
  }

  return "easy";
}

export function getNextDifficulty(
  currentDifficulty: QuizDifficulty,
  accuracy: number,
): QuizDifficulty {
  const currentIndex = difficultyOrder.indexOf(currentDifficulty);

  if (accuracy >= 85) {
    return difficultyOrder[Math.min(currentIndex + 1, difficultyOrder.length - 1)];
  }

  if (accuracy < 55) {
    return difficultyOrder[Math.max(currentIndex - 1, 0)];
  }

  return currentDifficulty;
}

export function buildAdaptationNote(difficulty: QuizDifficulty, accuracy?: number) {
  if (accuracy === undefined) {
    return `Starting at ${difficulty} difficulty until the engine has enough performance data.`;
  }

  if (accuracy >= 88) {
    return "Recent accuracy is high, so the engine increased challenge and concept mixing.";
  }

  if (accuracy < 55) {
    return "Recent accuracy is low, so the engine lowered difficulty and added clearer fundamentals.";
  }

  return "Recent accuracy is stable, so the engine kept difficulty balanced.";
}
