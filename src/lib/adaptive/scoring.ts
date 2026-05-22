import { getNextDifficulty } from "@/lib/quiz/adaptive";
import type {
  AdaptiveRecommendation,
  AdaptiveSnapshot,
  LearningPathItem,
  TopicMastery,
  TopicPerformanceInput,
} from "@/lib/adaptive/types";

const revisionIntervalsByMastery = [
  { min: 85, days: 14 },
  { min: 70, days: 7 },
  { min: 55, days: 3 },
  { min: 0, days: 1 },
];

export function calculateTopicMastery(input: TopicPerformanceInput): TopicMastery {
  const accuracy = input.attempts > 0 ? Math.round((input.correct / input.attempts) * 100) : 0;
  const priorMastery = input.currentMastery ?? 50;
  const speedScore = calculateSpeedScore(input.averageTimeSeconds, input.difficulty);
  const difficultyWeight = getDifficultyWeight(input.difficulty);
  const masteryScore = clamp(
    Math.round(priorMastery * 0.35 + accuracy * 0.45 + speedScore * 0.1 + difficultyWeight * 0.1),
    0,
    100,
  );
  const weaknessScore = clamp(
    Math.round((100 - accuracy) * 0.5 + (100 - masteryScore) * 0.35 + recencyPenalty(input.lastPracticedAt) * 0.15),
    0,
    100,
  );

  return {
    ...input,
    accuracy,
    masteryScore,
    weaknessScore,
    isWeak: weaknessScore >= 55 || masteryScore < 60,
    nextDifficulty: getNextDifficulty(input.difficulty, accuracy),
    nextRevisionAt: calculateNextRevisionDate(masteryScore),
  };
}

export function buildAdaptiveSnapshot(
  inputs: TopicPerformanceInput[],
): AdaptiveSnapshot {
  const mastery = inputs.map(calculateTopicMastery).sort((a, b) => b.weaknessScore - a.weaknessScore);
  const weakTopics = mastery.filter((topic) => topic.isWeak).slice(0, 6);
  const learningPath = generateLearningPath(mastery);
  const recommendations = generateRecommendations(weakTopics, mastery);
  const readinessScore = calculateReadinessScore(mastery);

  return {
    mastery,
    weakTopics,
    learningPath,
    recommendations,
    readinessScore,
  };
}

export function generateLearningPath(mastery: TopicMastery[]): LearningPathItem[] {
  return mastery.slice(0, 8).map((topic) => {
    const priority = topic.weaknessScore >= 70 ? "high" : topic.weaknessScore >= 45 ? "medium" : "low";
    const recommendedAction =
      topic.masteryScore < 45
        ? "concept_review"
        : topic.accuracy < 65
          ? "guided_practice"
          : topic.weaknessScore >= 55
            ? "adaptive_quiz"
            : "mock_review";

    return {
      topicId: topic.topicId,
      title: topic.topicName,
      subject: topic.subject,
      priority,
      reason: buildPathReason(topic),
      recommendedAction,
      estimatedMinutes: priority === "high" ? 35 : priority === "medium" ? 25 : 15,
      targetDifficulty: topic.nextDifficulty,
    };
  });
}

export function generateRecommendations(
  weakTopics: TopicMastery[],
  mastery: TopicMastery[],
): AdaptiveRecommendation[] {
  const recommendations: AdaptiveRecommendation[] = [];
  const weakest = weakTopics[0];

  if (weakest) {
    recommendations.push({
      title: `Prioritize ${weakest.topicName}`,
      description: `Mastery is ${weakest.masteryScore}% with ${weakest.accuracy}% accuracy. Start with guided practice before timed questions.`,
      priority: "high",
      actionLabel: "Start guided practice",
      topicId: weakest.topicId,
    });
  }

  const staleTopic = mastery.find((topic) => recencyPenalty(topic.lastPracticedAt) > 70);

  if (staleTopic) {
    recommendations.push({
      title: `Revise ${staleTopic.topicName}`,
      description: "This topic is becoming stale. Schedule a spaced-repetition review before the next mock.",
      priority: "medium",
      actionLabel: "Schedule revision",
      topicId: staleTopic.topicId,
    });
  }

  recommendations.push({
    title: "Generate next adaptive quiz",
    description: "Use the current weak-topic ranking to generate a short quiz with adjusted difficulty.",
    priority: weakTopics.length > 2 ? "high" : "medium",
    actionLabel: "Generate quiz",
  });

  return recommendations;
}

function calculateReadinessScore(mastery: TopicMastery[]) {
  if (!mastery.length) return 0;

  const averageMastery = mastery.reduce((total, topic) => total + topic.masteryScore, 0) / mastery.length;
  const weakPenalty = mastery.filter((topic) => topic.isWeak).length * 4;

  return clamp(Math.round(averageMastery - weakPenalty), 0, 100);
}

function calculateNextRevisionDate(masteryScore: number) {
  const interval = revisionIntervalsByMastery.find((entry) => masteryScore >= entry.min) ?? revisionIntervalsByMastery.at(-1)!;
  const date = new Date();
  date.setDate(date.getDate() + interval.days);
  return date.toISOString();
}

function calculateSpeedScore(averageTimeSeconds: number, difficulty: TopicPerformanceInput["difficulty"]) {
  const target = { easy: 90, medium: 180, hard: 360, expert: 600 }[difficulty];

  if (averageTimeSeconds <= target) return 100;
  if (averageTimeSeconds <= target * 1.5) return 75;
  if (averageTimeSeconds <= target * 2) return 55;
  return 35;
}

function getDifficultyWeight(difficulty: TopicPerformanceInput["difficulty"]) {
  return { easy: 45, medium: 65, hard: 82, expert: 95 }[difficulty];
}

function recencyPenalty(lastPracticedAt?: string) {
  if (!lastPracticedAt) return 80;

  const days = Math.floor((Date.now() - new Date(lastPracticedAt).getTime()) / (1000 * 60 * 60 * 24));

  return clamp(days * 12, 0, 100);
}

function buildPathReason(topic: TopicMastery) {
  if (topic.masteryScore < 45) {
    return "Low mastery score indicates the concept needs rebuilding.";
  }

  if (topic.accuracy < 65) {
    return "Accuracy is below the target range for exam readiness.";
  }

  if (topic.weaknessScore >= 55) {
    return "Recent performance and revision gap make this a priority.";
  }

  return "Maintain strength with quick mixed-practice review.";
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
