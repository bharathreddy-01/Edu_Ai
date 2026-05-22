import { Menu, CalendarDays, Sparkles, BookOpenCheck, Clock, CheckCircle } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { signOut } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { regenerateStudyPlan, completeStudySlot } from "@/lib/profile/actions";

function getRecommendationHref(actionLabel: string = "", title: string = ""): string {
  const label = actionLabel.toLowerCase();
  const t = title.toLowerCase();
  
  if (label.includes("quiz") || label.includes("practice") || label.includes("mock") || t.includes("quiz") || t.includes("practice")) {
    return "/quiz-generator";
  }
  if (label.includes("note") || label.includes("review") || label.includes("sprint") || label.includes("revise") || t.includes("note") || t.includes("review") || t.includes("sprint") || t.includes("revise")) {
    return "/content-intelligence";
  }
  return "/ai-tutor";
}

export default async function StudyPlanPage() {
  const profile = await requireRole(["student", "admin"]);
  const supabase = await createClient();
  const userId = profile.id;

  // Fetch active study recommendations
  const { data: recommendations } = await supabase
    .from("study_recommendations")
    .select("id, title, description, priority, action_label, status")
    .eq("student_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  // Fetch student topic progress for revision planning
  const { data: topicProgress } = await supabase
    .from("student_topic_progress")
    .select("mastery_score, weakness_score, last_practiced_at, next_revision_at, topics(name, subjects(name))")
    .eq("student_id", userId)
    .order("next_revision_at", { ascending: true })
    .limit(5);

  // Fallbacks if no data exists
  const activeRecommendations = recommendations && recommendations.length ? recommendations : [
    { title: "Stabilize Rotational Dynamics", description: "Your Physics accuracy drops when angular momentum calculations arise. Schedule a 25-min focused session.", priority: "high", action_label: "Start Sprint" },
    { title: "Review Coordination Isomers", description: "Chemistry quiz signals show coordination chemistry confusion. Revise flashcards.", priority: "medium", action_label: "Review Notes" },
    { title: "Integration Formulas Practice", description: "Practice definite integral property questions. Target standard 15-minute speed drill.", priority: "medium", action_label: "Practice Mock" },
  ];

  const revisionQueue = topicProgress && topicProgress.length ? topicProgress.map(row => {
    const rawTopic = Array.isArray(row.topics) ? row.topics[0] : row.topics;
    const topic = rawTopic as Record<string, unknown> | null;
    const subjectRow = topic && "subjects" in topic ? topic.subjects : null;
    
    let subjectName = "General";
    if (subjectRow) {
      if (Array.isArray(subjectRow)) {
        const sObj = subjectRow[0] as Record<string, unknown> | undefined;
        if (sObj && typeof sObj.name === "string") {
          subjectName = sObj.name;
        }
      } else {
        const sObj = subjectRow as Record<string, unknown>;
        if (typeof sObj.name === "string") {
          subjectName = sObj.name;
        }
      }
    }

    return {
      topic: topic && typeof topic.name === "string" ? topic.name : "Untitled topic",
      subject: subjectName,
      mastery: Number(row.mastery_score ?? 0),
      nextRevision: row.next_revision_at ? new Date(row.next_revision_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"
    };
  }) : [
    { topic: "Rotational dynamics", subject: "Physics", mastery: 42, nextRevision: "Today" },
    { topic: "Definite integration", subject: "Math", mastery: 54, nextRevision: "Tomorrow, 8:00 AM" },
    { topic: "Coordination compounds", subject: "Chemistry", mastery: 61, nextRevision: "May 22" },
    { topic: "Photosynthesis in Plants", subject: "Biology", mastery: 76, nextRevision: "May 24" }
  ];

  // Fetch active study plan slots from database
  let scheduleDays: { date: string; slots: { id?: string; time: string; label: string; type: string; status: string }[] }[] = [];
  try {
    const { data: slots, error: slotsError } = await supabase
      .from("study_plan_slots")
      .select("id, slot_date, time_range, label, slot_type, status")
      .eq("student_id", userId)
      .order("slot_date", { ascending: true })
      .order("time_range", { ascending: true });

    if (slotsError) {
      console.warn("Database study_plan_slots fetch error (table might not exist yet):", slotsError.message);
      throw new Error(slotsError.message);
    }

    if (slots && slots.length > 0) {
      // Group slots by slot_date
      const groups: Record<string, typeof slots> = {};
      slots.forEach(slot => {
        const d = slot.slot_date;
        if (!groups[d]) groups[d] = [];
        groups[d].push(slot);
      });

      // Format dates dynamically relative to today
      const todayStr = new Date().toISOString().split('T')[0];
      const tomorrowObj = new Date();
      tomorrowObj.setDate(tomorrowObj.getDate() + 1);
      const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

      scheduleDays = Object.keys(groups).map(dateStr => {
        let displayDate = dateStr;
        if (dateStr === todayStr) {
          displayDate = "Today";
        } else if (dateStr === tomorrowStr) {
          displayDate = "Tomorrow";
        } else {
          // Format as e.g. "22 May"
          const dateObj = new Date(dateStr);
          displayDate = dateObj.toLocaleDateString("en-US", { day: "numeric", month: "short" });
        }

        return {
          date: displayDate,
          slots: groups[dateStr].map(slot => ({
            id: slot.id,
            time: slot.time_range,
            label: slot.label,
            type: slot.slot_type,
            status: slot.status
          }))
        };
      });
    } else {
      // Fallback if table exists but has no entries
      scheduleDays = [
        { date: "Today", slots: [
          { time: "07:00 AM - 08:30 AM", label: "Math (Integration Drill)", type: "Practice", status: "completed" },
          { time: "10:00 AM - 11:30 AM", label: "Physics (Rotational Mechanics)", type: "Revision", status: "current" },
          { time: "04:00 PM - 05:30 PM", label: "Chemistry (Isomerism Notes)", type: "Study", status: "pending" },
        ]},
        { date: "Tomorrow", slots: [
          { time: "07:00 AM - 08:30 AM", label: "Physics (Torque Problems)", type: "Practice", status: "pending" },
          { time: "10:00 AM - 11:30 AM", label: "Chemistry (Coordination Compounds)", type: "Revision", status: "pending" },
          { time: "06:00 PM - 07:30 PM", label: "Math (Definite Integral)", type: "Study", status: "pending" },
        ]},
        { date: "22 May", slots: [
          { time: "08:00 AM - 10:00 AM", label: "Full Syllabus Math Mock", type: "Mock", status: "pending" },
          { time: "03:00 PM - 04:30 PM", label: "Biology (Photosynthesis)", type: "Revision", status: "pending" },
        ]}
      ];
    }
  } catch (err) {
    // Dynamic database error fallback
    scheduleDays = [
      { date: "Today", slots: [
        { time: "07:00 AM - 08:30 AM", label: "Math (Integration Drill)", type: "Practice", status: "completed" },
        { time: "10:00 AM - 11:30 AM", label: "Physics (Rotational Mechanics)", type: "Revision", status: "current" },
        { time: "04:00 PM - 05:30 PM", label: "Chemistry (Isomerism Notes)", type: "Study", status: "pending" },
      ]},
      { date: "Tomorrow", slots: [
        { time: "07:00 AM - 08:30 AM", label: "Physics (Torque Problems)", type: "Practice", status: "pending" },
        { time: "10:00 AM - 11:30 AM", label: "Chemistry (Coordination Compounds)", type: "Revision", status: "pending" },
        { time: "06:00 PM - 07:30 PM", label: "Math (Definite Integral)", type: "Study", status: "pending" },
      ]},
      { date: "22 May", slots: [
        { time: "08:00 AM - 10:00 AM", label: "Full Syllabus Math Mock", type: "Mock", status: "pending" },
        { time: "03:00 PM - 04:30 PM", label: "Biology (Photosynthesis)", type: "Revision", status: "pending" },
      ]}
    ];
  }

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/78 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button className="lg:hidden" size="icon" variant="ghost" aria-label="Open navigation">
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Pedagogical Timeline
                  </p>
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    Study Plan & Calendar
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="glass">
                  Active Plan
                </Badge>
                <form action={signOut}>
                  <Button type="submit" variant="outline">
                    Logout
                  </Button>
                </form>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
            {/* Top Info Banner */}
            <section className="glass-panel flex flex-col items-start gap-4 rounded-lg p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-lg shadow-md shrink-0">
                  <CalendarDays className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Personalized Calendar</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    AI-generated learning timeline tailored for your target {profile.exam_track?.toUpperCase() || "JEE"} performance.
                  </p>
                </div>
              </div>
              <form action={regenerateStudyPlan}>
                <Button type="submit" size="lg" className="shadow-lg">
                  <Sparkles className="mr-2 size-4" />
                  Regenerate Plan
                </Button>
              </form>
            </section>

            {/* Main content grid */}
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              {/* Daily study slots */}
              <div className="grid gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Focus Agenda</CardTitle>
                    <CardDescription>Structured hourly blocks optimized for peak focus.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    {scheduleDays.map((day) => (
                      <div key={day.date} className="grid gap-3">
                        <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">{day.date}</h3>
                        <div className="grid gap-3">
                          {day.slots.map((slot) => (
                            <div
                              key={slot.time}
                              className={`flex flex-col justify-between gap-4 rounded-lg border p-4 sm:flex-row sm:items-center ${
                                slot.status === "current"
                                  ? "border-primary bg-primary/5 dark:bg-primary/8 shadow-sm"
                                  : slot.status === "completed"
                                  ? "bg-secondary/40 opacity-75"
                                  : "bg-card"
                              }`}
                            >
                              <div className="flex gap-3">
                                <div className="mt-1 flex size-5 shrink-0 items-center justify-center">
                                  {slot.status === "completed" ? (
                                    <CheckCircle className="text-success size-5" />
                                  ) : slot.status === "current" ? (
                                    <Clock className="text-primary size-5 animate-pulse" />
                                  ) : (
                                    <div className="size-2 rounded-full bg-muted-foreground/50" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm sm:text-base">{slot.label}</p>
                                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                    <Clock className="size-3.5" />
                                    {slot.time}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 self-start sm:self-center">
                                <Badge variant="outline">{slot.type}</Badge>
                                {slot.status === "current" && (
                                  <form action={slot.id ? completeStudySlot.bind(null, slot.id) : undefined}>
                                    <Button size="sm" type="submit" disabled={!slot.id}>
                                      Start Now
                                    </Button>
                                  </form>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar recommendations & spaced repetition */}
              <div className="grid content-start gap-6">
                {/* Active study goals / next revision recommendations */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>AI Actions</CardTitle>
                    <CardDescription>Tailored focus plans driven by your learning feedback.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    {activeRecommendations.map((item, idx) => (
                      <div key={item.title || idx} className="rounded-lg border p-3 bg-background/50 flex flex-col gap-3">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold">{item.title}</h4>
                            <Badge variant={item.priority === "high" ? "warning" : "glass"} className="capitalize">
                              {item.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{item.description}</p>
                        </div>
                        <Button size="sm" variant="secondary" className="w-full" asChild>
                          <a href={getRecommendationHref(item.action_label, item.title)}>
                            <BookOpenCheck className="mr-1.5 size-3.5" />
                            {item.action_label || "Start Action"}
                          </a>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Spaced repetition queued revision topics */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Spaced Repetition</CardTitle>
                    <CardDescription>Revision tasks automatically queued by cognitive decay curves.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {revisionQueue.map((topic) => (
                      <div key={topic.topic} className="rounded-md border p-3 text-xs bg-background/40">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-foreground truncate max-w-[200px]">{topic.topic}</span>
                          <span className="text-muted-foreground shrink-0">{topic.nextRevision}</span>
                        </div>
                        <div className="mt-2 text-muted-foreground flex justify-between items-center">
                          <span>{topic.subject}</span>
                          <span>{topic.mastery}% mastery</span>
                        </div>
                        <Progress className="mt-2.5 h-1.5" value={topic.mastery} label={`${topic.topic} mastery`} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
