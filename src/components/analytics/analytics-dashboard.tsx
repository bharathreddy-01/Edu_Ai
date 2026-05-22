import {
  Activity,
  BarChart3,
  Brain,
  CalendarCheck2,
  Flame,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalyticsSnapshot } from "@/lib/analytics/types";
import { cn } from "@/lib/utils";

const metricIcons = [Target, BarChart3, Flame, Brain];
const toneStyles = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/18 text-success-foreground dark:text-success",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  info: "bg-info/18 text-info-foreground dark:text-info",
};

export function AnalyticsDashboard({
  snapshot,
}: {
  snapshot: AnalyticsSnapshot;
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {snapshot.metrics.map((metric, index) => {
          const Icon = metricIcons[index] ?? Activity;

          return (
            <Card key={metric.label} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">
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
                <p className="mt-4 text-sm text-muted-foreground">
                  {metric.delta}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <PerformanceTrendCard snapshot={snapshot} />
          <SubjectMasteryCard snapshot={snapshot} />
        </div>
        <aside className="grid content-start gap-6">
          <ConsistencyCard snapshot={snapshot} />
          <WeakTopicsAnalyticsCard snapshot={snapshot} />
        </aside>
      </section>
    </div>
  );
}

function PerformanceTrendCard({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  const maxMinutes = Math.max(
    ...snapshot.trends.map((point) => point.studyMinutes),
    1,
  );

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Performance trends</CardTitle>
            <CardDescription>
              Study minutes, quiz accuracy, and readiness movement.
            </CardDescription>
          </div>
          <Badge variant="glass">Last 14 days</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          <div className="flex h-72 items-end gap-3 rounded-lg border bg-background/45 p-4">
            {snapshot.trends.map((point) => (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col justify-end gap-2"
              >
                <div className="flex flex-1 items-end justify-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-primary/80"
                    style={{
                      height: `${(point.studyMinutes / maxMinutes) * 100}%`,
                    }}
                    title={`${point.studyMinutes} study minutes`}
                  />
                  <div
                    className="w-full rounded-t-md bg-success/80"
                    style={{ height: `${point.accuracy}%` }}
                    title={`${point.accuracy}% accuracy`}
                  />
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {point.label}
                </p>
              </div>
            ))}
          </div>
          <div className="grid gap-3">
            {snapshot.trends.slice(-4).map((point) => (
              <div key={point.label} className="rounded-md border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{point.label}</span>
                  <span className="font-medium">{point.readiness}% ready</span>
                </div>
                <Progress
                  className="mt-3"
                  value={point.readiness}
                  label={`${point.label} readiness`}
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectMasteryCard({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Subject mastery</CardTitle>
        <CardDescription>
          Mastery, accuracy, and weak-topic count by subject.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {snapshot.subjectMastery.map((subject) => (
          <div key={subject.subject} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{subject.subject}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {subject.weakTopics} weak topics
                </p>
              </div>
              <span className="text-2xl font-semibold">{subject.mastery}%</span>
            </div>
            <div className="mt-4 grid gap-3">
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Mastery</span>
                  <span>{subject.mastery}%</span>
                </div>
                <Progress
                  value={subject.mastery}
                  label={`${subject.subject} mastery`}
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Accuracy</span>
                  <span>{subject.accuracy}%</span>
                </div>
                <Progress
                  value={subject.accuracy}
                  label={`${subject.subject} accuracy`}
                  indicatorClassName="bg-success"
                />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ConsistencyCard({ snapshot }: { snapshot: AnalyticsSnapshot }) {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Consistency</CardTitle>
        <CardDescription>Study streak and active-day health.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-5xl font-semibold">{snapshot.streakDays}</p>
            <p className="mt-2 text-sm text-muted-foreground">day streak</p>
          </div>
          <div className="flex size-20 items-center justify-center rounded-lg bg-warning/20 text-warning-foreground dark:text-warning">
            <CalendarCheck2 className="size-9" aria-hidden="true" />
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Consistency score</span>
            <span className="font-medium">{snapshot.consistencyScore}%</span>
          </div>
          <Progress
            value={snapshot.consistencyScore}
            label="Consistency score"
            indicatorClassName="bg-warning"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WeakTopicsAnalyticsCard({
  snapshot,
}: {
  snapshot: AnalyticsSnapshot;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Weak topic intelligence</CardTitle>
        <CardDescription>
          Ranked by weakness score and quiz accuracy.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {snapshot.weakTopics.map((topic) => (
          <div key={`${topic.subject}-${topic.topic}`} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{topic.topic}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topic.subject} • {topic.accuracy}% accuracy
                </p>
              </div>
              <Badge variant={topic.weaknessScore >= 70 ? "warning" : "outline"}>
                {topic.weaknessScore}
              </Badge>
            </div>
            <Progress
              className="mt-3"
              value={topic.weaknessScore}
              label={`${topic.topic} weakness score`}
              indicatorClassName={
                topic.weaknessScore >= 70 ? "bg-warning" : "bg-primary"
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
