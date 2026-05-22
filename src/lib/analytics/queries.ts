import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AnalyticsSnapshot,
  SubjectMastery,
  TrendPoint,
  WeakTopicInsight,
} from "@/lib/analytics/types";

export async function getAnalyticsSnapshot({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<AnalyticsSnapshot> {
  const [dailyProgress, attempts, topicProgress] = await Promise.all([
    loadDailyProgress(supabase, userId),
    loadQuizAttempts(supabase, userId),
    loadTopicProgress(supabase, userId),
  ]);

  if (!dailyProgress.length && !attempts.length && !topicProgress.length) {
    return sampleAnalyticsSnapshot;
  }

  const trends = buildTrends(dailyProgress, attempts);
  const subjectMastery = buildSubjectMastery(topicProgress);
  const weakTopics = buildWeakTopics(topicProgress);
  const latest = trends.at(-1);
  const averageAccuracy = average(attempts.map((attempt) => Number(attempt.accuracy ?? 0)));
  const streakDays = Number(dailyProgress[0]?.streak_count ?? 0);
  const consistencyScore = calculateConsistency(dailyProgress);

  return {
    metrics: [
      {
        label: "Learning progress",
        value: `${latest?.readiness ?? 0}%`,
        delta: "readiness score",
        tone: "primary",
      },
      {
        label: "Quiz accuracy",
        value: `${Math.round(averageAccuracy)}%`,
        delta: `${attempts.length} attempts`,
        tone: "success",
      },
      {
        label: "Study streak",
        value: `${streakDays} days`,
        delta: `${consistencyScore}% consistency`,
        tone: "warning",
      },
      {
        label: "Weak topics",
        value: `${weakTopics.length}`,
        delta: "need revision",
        tone: "info",
      },
    ],
    trends,
    subjectMastery,
    weakTopics,
    streakDays,
    consistencyScore,
  };
}

async function loadDailyProgress(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("daily_progress")
    .select("progress_date, study_minutes, questions_attempted, questions_correct, quizzes_completed, streak_count, readiness_score")
    .eq("student_id", userId)
    .order("progress_date", { ascending: false })
    .limit(14);

  return data ?? [];
}

async function loadQuizAttempts(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("quiz_attempts")
    .select("accuracy, score, submitted_at, time_spent_seconds")
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(30);

  return data ?? [];
}

interface TopicProgressRow {
  mastery_score: number | null;
  weakness_score: number | null;
  accuracy: number | null;
  next_revision_at: string | null;
  topics: {
    name: string;
    subjects: {
      name: string;
    } | {
      name: string;
    }[] | null;
  } | {
    name: string;
    subjects: {
      name: string;
    } | {
      name: string;
    }[] | null;
  }[] | null;
}

async function loadTopicProgress(supabase: SupabaseClient, userId: string): Promise<TopicProgressRow[]> {
  const { data } = await supabase
    .from("student_topic_progress")
    .select("mastery_score, weakness_score, accuracy, next_revision_at, topics(name, subjects(name))")
    .eq("student_id", userId)
    .order("weakness_score", { ascending: false })
    .limit(40);

  return (data as unknown as TopicProgressRow[]) ?? [];
}

function buildTrends(
  dailyProgress: Awaited<ReturnType<typeof loadDailyProgress>>,
  attempts: Awaited<ReturnType<typeof loadQuizAttempts>>,
): TrendPoint[] {
  const ordered = [...dailyProgress].reverse();

  if (ordered.length) {
    return ordered.map((day) => ({
      label: formatShortDate(String(day.progress_date)),
      studyMinutes: Number(day.study_minutes ?? 0),
      accuracy:
        Number(day.questions_attempted ?? 0) > 0
          ? Math.round(
              (Number(day.questions_correct ?? 0) /
                Number(day.questions_attempted ?? 1)) *
                100,
            )
          : Math.round(average(attempts.map((attempt) => Number(attempt.accuracy ?? 0)))),
      readiness: Number(day.readiness_score ?? 0),
    }));
  }

  return sampleAnalyticsSnapshot.trends;
}

function buildSubjectMastery(
  topicProgress: TopicProgressRow[],
): SubjectMastery[] {
  const grouped = new Map<string, { mastery: number[]; accuracy: number[]; weak: number }>();

  topicProgress.forEach((row) => {
    const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
    const subjectRow = topic && "subjects" in topic ? topic.subjects : null;
    const subject = Array.isArray(subjectRow)
      ? subjectRow[0]?.name
      : subjectRow && "name" in subjectRow
        ? subjectRow.name
        : "General";
    const current = grouped.get(subject) ?? { mastery: [], accuracy: [], weak: 0 };

    current.mastery.push(Number(row.mastery_score ?? 0));
    current.accuracy.push(Number(row.accuracy ?? 0));
    if (Number(row.weakness_score ?? 0) >= 55) current.weak += 1;
    grouped.set(subject, current);
  });

  const values = Array.from(grouped.entries()).map(([subject, stats]) => ({
    subject,
    mastery: Math.round(average(stats.mastery)),
    accuracy: Math.round(average(stats.accuracy)),
    weakTopics: stats.weak,
  }));

  return values.length ? values : sampleAnalyticsSnapshot.subjectMastery;
}

function buildWeakTopics(
  topicProgress: TopicProgressRow[],
): WeakTopicInsight[] {
  const weakTopics = topicProgress
    .filter((row) => Number(row.weakness_score ?? 0) >= 45)
    .slice(0, 6)
    .map((row) => {
      const topic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
      const subjectRow = topic && "subjects" in topic ? topic.subjects : null;
      const subject = Array.isArray(subjectRow)
        ? subjectRow[0]?.name
        : subjectRow && "name" in subjectRow
          ? subjectRow.name
          : "General";

      return {
        topic: topic && "name" in topic ? String(topic.name) : "Untitled topic",
        subject,
        weaknessScore: Number(row.weakness_score ?? 0),
        accuracy: Number(row.accuracy ?? 0),
        nextRevisionAt: row.next_revision_at ? String(row.next_revision_at) : undefined,
      };
    });

  return weakTopics.length ? weakTopics : sampleAnalyticsSnapshot.weakTopics;
}

function calculateConsistency(
  dailyProgress: Awaited<ReturnType<typeof loadDailyProgress>>,
) {
  if (!dailyProgress.length) return 0;

  const activeDays = dailyProgress.filter((day) => Number(day.study_minutes ?? 0) >= 20).length;

  return Math.round((activeDays / dailyProgress.length) * 100);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export const sampleAnalyticsSnapshot: AnalyticsSnapshot = {
  metrics: [
    { label: "Learning progress", value: "74%", delta: "+8% this month", tone: "primary" },
    { label: "Quiz accuracy", value: "81%", delta: "+6% across mocks", tone: "success" },
    { label: "Study streak", value: "18 days", delta: "92% consistency", tone: "warning" },
    { label: "Weak topics", value: "6", delta: "3 high priority", tone: "info" },
  ],
  trends: [
    { label: "Mon", studyMinutes: 72, accuracy: 76, readiness: 64 },
    { label: "Tue", studyMinutes: 48, accuracy: 71, readiness: 66 },
    { label: "Wed", studyMinutes: 96, accuracy: 84, readiness: 69 },
    { label: "Thu", studyMinutes: 64, accuracy: 79, readiness: 70 },
    { label: "Fri", studyMinutes: 88, accuracy: 82, readiness: 72 },
    { label: "Sat", studyMinutes: 112, accuracy: 86, readiness: 74 },
    { label: "Sun", studyMinutes: 54, accuracy: 74, readiness: 74 },
  ],
  subjectMastery: [
    { subject: "Physics", mastery: 68, accuracy: 73, weakTopics: 3 },
    { subject: "Chemistry", mastery: 82, accuracy: 86, weakTopics: 1 },
    { subject: "Math", mastery: 57, accuracy: 64, weakTopics: 4 },
    { subject: "Biology", mastery: 76, accuracy: 79, weakTopics: 2 },
  ],
  weakTopics: [
    { topic: "Rotational dynamics", subject: "Physics", weaknessScore: 78, accuracy: 42 },
    { topic: "Definite integration", subject: "Math", weaknessScore: 69, accuracy: 54 },
    { topic: "Coordination compounds", subject: "Chemistry", weaknessScore: 58, accuracy: 61 },
  ],
  streakDays: 18,
  consistencyScore: 92,
};
