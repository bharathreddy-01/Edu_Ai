import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpenCheck,
  Brain,
  CalendarClock,
  CheckCircle2,
  Flame,
  Lightbulb,
  Target,
  TimerReset,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type Metric = {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "info";
};

const toneStyles = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/18 text-success-foreground dark:text-success",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  info: "bg-info/18 text-info-foreground dark:text-info",
};

const metrics: Metric[] = [
  {
    title: "Learning progress",
    value: "74%",
    change: "+8% this month",
    icon: Target,
    tone: "primary",
  },
  {
    title: "Study streak",
    value: "18 days",
    change: "2 days to personal best",
    icon: Flame,
    tone: "warning",
  },
  {
    title: "Accuracy",
    value: "81%",
    change: "+6% across 5 mocks",
    icon: CheckCircle2,
    tone: "success",
  },
  {
    title: "Revision saved",
    value: "4.5 hrs",
    change: "AI plan optimization",
    icon: Brain,
    tone: "info",
  },
];

const weakTopics = [
  {
    subject: "Physics",
    topic: "Rotational dynamics",
    severity: "High",
    accuracy: 42,
    action: "Solve torque and angular momentum set",
  },
  {
    subject: "Math",
    topic: "Definite integration",
    severity: "Medium",
    accuracy: 54,
    action: "Revise properties and area questions",
  },
  {
    subject: "Chemistry",
    topic: "Coordination compounds",
    severity: "Medium",
    accuracy: 61,
    action: "Review isomerism flashcards",
  },
];

const subjects = [
  { name: "Physics", mastery: 68, questions: 284, color: "bg-chart-physics" },
  {
    name: "Chemistry",
    mastery: 82,
    questions: 341,
    color: "bg-chart-chemistry",
  },
  { name: "Math", mastery: 57, questions: 226, color: "bg-chart-math" },
  { name: "Biology", mastery: 76, questions: 198, color: "bg-chart-biology" },
];

const weeklyActivity = [
  { day: "Mon", minutes: 72, accuracy: 76 },
  { day: "Tue", minutes: 48, accuracy: 71 },
  { day: "Wed", minutes: 96, accuracy: 84 },
  { day: "Thu", minutes: 64, accuracy: 79 },
  { day: "Fri", minutes: 88, accuracy: 82 },
  { day: "Sat", minutes: 112, accuracy: 86 },
  { day: "Sun", minutes: 54, accuracy: 74 },
];

const recommendations = [
  {
    title: "Start with rotational dynamics",
    detail: "Your error rate is highest when torque and angular momentum mix.",
    icon: Lightbulb,
  },
  {
    title: "Keep next session short",
    detail: "25-minute Physics sprints have produced your best accuracy.",
    icon: TimerReset,
  },
  {
    title: "Review before mock analysis",
    detail: "Revise 9 saved mistakes before opening the next mixed mock.",
    icon: Brain,
  },
];

const upcomingQuizzes = [
  {
    title: "Mechanics mixed drill",
    time: "Today, 7:30 PM",
    questions: 25,
    difficulty: "Advanced",
  },
  {
    title: "Organic reaction map",
    time: "Tomorrow, 6:00 AM",
    questions: 18,
    difficulty: "Moderate",
  },
  {
    title: "Calculus speed test",
    time: "Fri, 8:00 PM",
    questions: 30,
    difficulty: "Advanced",
  },
];

const roadmap = [
  {
    phase: "Now",
    title: "Stabilize weak chapters",
    progress: 62,
    detail: "Rotational dynamics, integration, coordination compounds",
  },
  {
    phase: "Next 2 weeks",
    title: "Increase mock accuracy",
    progress: 38,
    detail: "Target 84% accuracy with mixed timed practice",
  },
  {
    phase: "Next month",
    title: "Full syllabus revision loop",
    progress: 22,
    detail: "Spaced revision for all high-weightage topics",
  },
];

export interface DashboardProfile {
  id?: string;
  full_name?: string | null;
  exam_track?: string | null;
  target_exam_date?: string | null;
  learning_preferences?: Record<string, unknown> | null;
}

export interface DashboardMetricProp {
  title?: string;
  label?: string;
  value: string | number;
  change?: string;
  delta?: string;
  icon?: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
}

export interface SubjectMasteryProp {
  subject?: string;
  name?: string;
  mastery: number;
  questions?: number;
  weakTopics?: number;
}

export interface WeakTopicProp {
  subject?: string;
  topic?: string;
  severity?: string;
  weaknessScore?: number;
  accuracy: number;
  action?: string;
}

export interface RecommendationProp {
  title: string;
  detail?: string;
  description?: string;
  icon?: LucideIcon;
}

export interface UpcomingQuizProp {
  title: string;
  time?: string;
  questions?: number;
  duration_minutes?: number;
  difficulty?: string;
  total_marks?: number;
}

export interface TrendProp {
  label?: string;
  day?: string;
  studyMinutes?: number;
  minutes?: number;
  accuracy: number;
}

export interface RoadmapProp {
  phase: string;
  title: string;
  progress: number;
  detail: string;
}

export function DashboardMetrics({ metrics: propMetrics }: { metrics?: DashboardMetricProp[] }) {
  const displayMetrics = propMetrics && propMetrics.length
    ? propMetrics.map((m, idx) => {
        const icons = [Target, CheckCircle2, Flame, Brain];
        return {
          title: (m.title || m.label || "") as string,
          value: String(m.value),
          change: (m.change || m.delta || "") as string,
          icon: m.icon || icons[idx % 4] || Target,
          tone: (m.tone || "primary") as "primary" | "success" | "warning" | "info",
        };
      })
    : [
        { title: "Learning progress", value: "0%", change: "No data yet", icon: Target, tone: "primary" as const },
        { title: "Quiz accuracy", value: "0%", change: "0 attempts", icon: CheckCircle2, tone: "success" as const },
        { title: "Study streak", value: "0 days", change: "0% consistency", icon: Flame, tone: "warning" as const },
        { title: "Weak topics", value: "0", change: "No revision needed", icon: Brain, tone: "info" as const },
      ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {displayMetrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.title} className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-muted-foreground text-sm">
                    {metric.title}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal">
                    {metric.value}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-md",
                    toneStyles[metric.tone],
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
                <ArrowUpRight className="text-success-foreground dark:text-success size-4" />
                {metric.change}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

export function ProgressOverview({ subjectMastery }: { subjectMastery?: SubjectMasteryProp[] }) {
  const displaySubjects = subjectMastery && subjectMastery.length
    ? subjectMastery.map((s) => {
        const subjectColors: Record<string, string> = {
          Physics: "bg-chart-physics",
          Chemistry: "bg-chart-chemistry",
          Mathematics: "bg-chart-math",
          Math: "bg-chart-math",
          Biology: "bg-chart-biology",
        };
        const sName = s.subject || s.name || "Subject";
        return {
          name: sName,
          mastery: Number(s.mastery),
          questions: Number(s.questions || (s.weakTopics ? s.weakTopics * 6 + 15 : 0)),
          color: subjectColors[sName] || "bg-primary",
        };
      })
    : [
        { name: "Physics", mastery: 0, questions: 0, color: "bg-chart-physics" },
        { name: "Chemistry", mastery: 0, questions: 0, color: "bg-chart-chemistry" },
        { name: "Math", mastery: 0, questions: 0, color: "bg-chart-math" },
        { name: "Biology", mastery: 0, questions: 0, color: "bg-chart-biology" },
      ];

  const totalMastery = displaySubjects.length
    ? Math.round(displaySubjects.reduce((acc, curr) => acc + curr.mastery, 0) / displaySubjects.length)
    : 0;

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Learning progress</CardTitle>
            <CardDescription>
              Overall readiness across practice, revision, and mock tests.
            </CardDescription>
          </div>
          <Badge variant="glass">Active syllabus track</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="bg-background/55 mx-auto flex size-52 items-center justify-center rounded-full border shadow-inner">
            <div className="bg-card flex size-40 flex-col items-center justify-center rounded-full border text-center">
              <p className="text-5xl font-semibold">{totalMastery}%</p>
              <p className="text-muted-foreground mt-2 text-sm">
                exam readiness
              </p>
            </div>
          </div>
          <div className="grid gap-4">
            {displaySubjects.map((subject) => (
              <div key={subject.name}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{subject.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {subject.questions} questions analyzed
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    {subject.mastery}%
                  </span>
                </div>
                <Progress
                  value={subject.mastery}
                  label={`${subject.name} mastery`}
                  indicatorClassName={subject.color}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeakTopicsCard({ weakTopics: propWeakTopics }: { weakTopics?: WeakTopicProp[] }) {
  const displayWeakTopics = propWeakTopics && propWeakTopics.length
    ? propWeakTopics.map((wt) => {
        const topicName = wt.topic || "Topic";
        return {
          subject: wt.subject || "General",
          topic: topicName,
          severity: wt.severity || ((wt.weaknessScore && wt.weaknessScore >= 70) ? "High" : "Medium"),
          accuracy: Number(wt.accuracy),
          action: wt.action || `Revise ${topicName} equations and take timed mock`,
        };
      })
    : [];

  if (displayWeakTopics.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Weak topics</CardTitle>
          <CardDescription>
            AI-ranked by accuracy, recency, and exam weightage.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-success/12 text-success-foreground dark:text-success mb-3 flex size-12 items-center justify-center rounded-full">
            <CheckCircle2 className="size-6" />
          </div>
          <p className="font-medium">No weak topics identified!</p>
          <p className="text-muted-foreground mt-1 max-w-[280px] text-sm">
            Keep practicing and taking quizzes. Your focus areas will appear here dynamically.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Weak topics</CardTitle>
        <CardDescription>
          AI-ranked by accuracy, recency, and exam weightage.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {displayWeakTopics.map((topic) => (
          <div key={topic.topic} className="rounded-md border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{topic.topic}</p>
                  <Badge
                    variant={topic.severity === "High" ? "warning" : "outline"}
                  >
                    {topic.severity}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {topic.subject} • {topic.action}
                </p>
              </div>
              <span className="text-sm font-semibold">{topic.accuracy}%</span>
            </div>
            <Progress
              className="mt-4"
              value={topic.accuracy}
              label={`${topic.topic} accuracy`}
              indicatorClassName={
                topic.accuracy < 50 ? "bg-destructive" : "bg-warning"
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AiRecommendationsCard({ recommendations: propRecs }: { recommendations?: RecommendationProp[] }) {
  const displayRecs = propRecs && propRecs.length
    ? propRecs.map((r, idx) => {
        const icons = [Lightbulb, TimerReset, Brain];
        return {
          title: r.title || "Recommendation",
          detail: r.detail || r.description || "",
          icon: r.icon || icons[idx % 3] || Lightbulb,
        };
      })
    : [];

  if (displayRecs.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>AI recommendations</CardTitle>
          <CardDescription>
            Next actions selected from your latest learning signals.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-primary/12 text-primary mb-3 flex size-12 items-center justify-center rounded-full">
            <Lightbulb className="size-6" />
          </div>
          <p className="font-medium">No recommendations yet</p>
          <p className="text-muted-foreground mt-1 max-w-[280px] text-sm">
            Complete active learning sprints or solve quizzes to generate custom AI study actions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>AI recommendations</CardTitle>
        <CardDescription>
          Next actions selected from your latest learning signals.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {displayRecs.map((item, idx) => {
          const Icon = item.icon;

          return (
            <div key={item.title || idx} className="flex gap-3 rounded-md border p-3">
              <div className="bg-secondary text-secondary-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-1 text-sm leading-6">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}
        <Button className="mt-2">
          Start recommended sprint
          <Brain className="size-4" aria-hidden="true" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function UpcomingQuizzesCard({ upcomingQuizzes: propQuizzes }: { upcomingQuizzes?: UpcomingQuizProp[] }) {
  const displayQuizzes = propQuizzes && propQuizzes.length
    ? propQuizzes.map((q) => ({
        title: q.title || "Quiz",
        time: q.time || "Scheduled by Coach",
        questions: q.questions || (q.duration_minutes ? Math.round(q.duration_minutes * 0.8) : 15),
        difficulty: q.difficulty || (q.total_marks && q.total_marks >= 200 ? "Advanced" : "Moderate"),
      }))
    : [];

  if (displayQuizzes.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Upcoming quizzes</CardTitle>
              <CardDescription>
                Timed practice scheduled by the coach.
              </CardDescription>
            </div>
            <CalendarClock className="text-primary size-5" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <div className="bg-secondary text-secondary-foreground mb-3 flex size-12 items-center justify-center rounded-full">
            <CalendarClock className="size-6" />
          </div>
          <p className="font-medium">No scheduled quizzes</p>
          <p className="text-muted-foreground mt-1 max-w-[280px] text-sm">
            All caught up! Check back later or start a custom practice quiz in the sidebar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Upcoming quizzes</CardTitle>
            <CardDescription>
              Timed practice scheduled by the coach.
            </CardDescription>
          </div>
          <CalendarClock className="text-primary size-5" aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {displayQuizzes.map((quiz, idx) => (
          <div
            key={quiz.title || idx}
            className="flex items-center justify-between gap-4 rounded-md border p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{quiz.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {quiz.time} • {quiz.questions} questions
              </p>
            </div>
            <Badge variant="outline">{quiz.difficulty}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AnalyticsCharts({ trends }: { trends?: TrendProp[] }) {
  const displayActivity = trends && trends.length
    ? trends.map((t) => ({
        day: t.label || t.day || "Day",
        minutes: Number(t.studyMinutes !== undefined ? t.studyMinutes : (t.minutes !== undefined ? t.minutes : 0)),
        accuracy: Number(t.accuracy || 0),
      }))
    : [
        { day: "Mon", minutes: 0, accuracy: 0 },
        { day: "Tue", minutes: 0, accuracy: 0 },
        { day: "Wed", minutes: 0, accuracy: 0 },
        { day: "Thu", minutes: 0, accuracy: 0 },
        { day: "Fri", minutes: 0, accuracy: 0 },
        { day: "Sat", minutes: 0, accuracy: 0 },
        { day: "Sun", minutes: 0, accuracy: 0 },
      ];

  const maxMinutes = Math.max(...displayActivity.map((day) => day.minutes), 1);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Analytics charts</CardTitle>
        <CardDescription>
          Study time and accuracy trends over the last week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          <div>
            <div className="bg-background/45 flex h-52 items-end gap-3 rounded-md border p-4">
              {displayActivity.map((day) => (
                <div
                  key={day.day}
                  className="flex h-full flex-1 flex-col justify-end gap-2"
                >
                  <div
                    className="bg-primary/80 rounded-t-md"
                    style={{
                      height: `${(day.minutes / maxMinutes) * 100}%`,
                    }}
                    title={`${day.minutes} minutes`}
                  />
                  <p className="text-muted-foreground text-center text-xs">
                    {day.day}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {displayActivity.slice(-4).map((day) => (
              <div key={day.day} className="rounded-md border p-3">
                <div className="flex justify-between text-sm">
                  <span>{day.day}</span>
                  <span className="font-medium">{day.accuracy}%</span>
                </div>
                <Progress
                  className="mt-3"
                  value={day.accuracy}
                  label={`${day.day} accuracy`}
                  indicatorClassName="bg-success"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PersonalizedRoadmap({ roadmap: propRoadmap, weakTopics }: { roadmap?: RoadmapProp[]; weakTopics?: WeakTopicProp[] }) {
  const displayRoadmap = propRoadmap && propRoadmap.length
    ? propRoadmap
    : (weakTopics && weakTopics.length
        ? [
            {
              phase: "Now",
              title: "Stabilize weak chapters",
              progress: 62,
              detail: `Address rotational mechanics & ${weakTopics.map(t => t.topic || "").filter(Boolean).slice(0, 2).join(", ")}`,
            },
            {
              phase: "Next 2 weeks",
              title: "Improve accuracy & metrics",
              progress: 38,
              detail: "Complete targeted sprints and full syllabus timed practice",
            },
            {
              phase: "Next month",
              title: "Comprehensive syllabus loops",
              progress: 22,
              detail: "Spaced revision and mock tests for high-priority topics",
            },
          ]
        : [
            {
              phase: "Phase 1",
              title: "Establish baseline study sprints",
              progress: 0,
              detail: "Start a guided focus sprint or take a quiz to begin analyzing concepts.",
            },
            {
              phase: "Phase 2",
              title: "Analyze knowledge gaps",
              progress: 0,
              detail: "AI will analyze mock test mistakes to find chapter weaknesses.",
            },
          ]);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Personalized roadmap</CardTitle>
        <CardDescription>
          A rolling plan based on target score and recent mistakes.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {displayRoadmap.map((step, index) => (
          <div key={step.title} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full text-sm font-semibold">
                {index + 1}
              </div>
              {index < displayRoadmap.length - 1 ? (
                <div className="bg-border h-full w-px" />
              ) : null}
            </div>
            <div className="min-w-0 flex-1 pb-5">
              <Badge variant="glass">{step.phase}</Badge>
              <p className="mt-3 font-medium">{step.title}</p>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {step.detail}
              </p>
              <Progress
                className="mt-3"
                value={step.progress}
                label={`${step.title} progress`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CoachSummaryHero({ profile, weakTopics }: { profile?: DashboardProfile; weakTopics?: WeakTopicProp[] }) {
  const studentName = profile?.full_name ? profile.full_name.split(" ")[0] : "Student";
  const examName = profile?.exam_track ? profile.exam_track.toUpperCase() : "JEE";

  let highlightText = "Today's plan prioritizes weak Physics and Math concepts before your next mock.";
  if (weakTopics && weakTopics.length) {
    const list = weakTopics.slice(0, 2).map((t) => t.topic || "Unknown Topic");
    if (list.length === 1) {
      highlightText = `Today's plan focuses on stabilizing ${list[0]} to boost your readiness.`;
    } else if (list.length > 1) {
      highlightText = `Today's plan focuses on stabilizing ${list[0]} and ${list[1]} concepts.`;
    }
  }

  // Get focus subject preference
  const preferences = (profile?.learning_preferences as Record<string, unknown>) || {};
  const sprintDuration = (preferences.sprintDurationMinutes as number | undefined) || 25;
  const focusSubject = (preferences.focusSubject as string | undefined) || "Physics";

  return (
    <section className="glass-panel overflow-hidden rounded-lg p-5 sm:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <Badge variant="glass">
            <Brain className="mr-1 size-3.5" aria-hidden="true" />
            AI coach summary for {studentName}
          </Badge>
          <h2 className="mt-5 max-w-3xl text-3xl leading-tight font-semibold tracking-normal sm:text-4xl">
            {highlightText}
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-7">
            The coach analyzed your recent answers, confidence patterns, and syllabus revision gaps for {examName} to build a focused study plan.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg">
              Start focus plan
              <BookOpenCheck className="size-4" aria-hidden="true" />
            </Button>
            <Button size="lg" variant="secondary">
              Review roadmap
              <Trophy className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        <Card className="bg-background/58 p-4 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-sm">Next best action</p>
              <p className="mt-1 text-2xl font-semibold">{sprintDuration}-min {focusSubject}</p>
            </div>
            <div className="bg-primary text-primary-foreground flex size-14 items-center justify-center rounded-lg">
              <TimerReset className="size-7" aria-hidden="true" />
            </div>
          </div>
          <Progress className="mt-5 h-3" value={72} label="Plan confidence" />
          <p className="text-muted-foreground mt-4 text-sm leading-6">
            Confidence score: 72%. Complete your daily guided focus review.
          </p>
        </Card>
      </div>
    </section>
  );
}
