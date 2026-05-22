export type AnalyticsMetric = {
  label: string;
  value: string;
  delta: string;
  tone: "primary" | "success" | "warning" | "info";
};

export type TrendPoint = {
  label: string;
  studyMinutes: number;
  accuracy: number;
  readiness: number;
};

export type SubjectMastery = {
  subject: string;
  mastery: number;
  accuracy: number;
  weakTopics: number;
};

export type WeakTopicInsight = {
  topic: string;
  subject: string;
  weaknessScore: number;
  accuracy: number;
  nextRevisionAt?: string;
};

export type AnalyticsSnapshot = {
  metrics: AnalyticsMetric[];
  trends: TrendPoint[];
  subjectMastery: SubjectMastery[];
  weakTopics: WeakTopicInsight[];
  streakDays: number;
  consistencyScore: number;
};
