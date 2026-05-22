export type {
  AdaptiveRecommendation,
  AdaptiveSnapshot,
  LearningPathItem,
  TopicMastery,
  TopicPerformanceInput,
} from "@/lib/adaptive/types";

export {
  buildAdaptiveSnapshot,
  calculateTopicMastery,
  generateLearningPath,
  generateRecommendations,
} from "@/lib/adaptive/scoring";

export {
  buildLearningPathPrompt,
  buildWeakTopicCoachPrompt,
} from "@/lib/adaptive/prompts";
