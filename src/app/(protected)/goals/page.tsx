import { Calendar, Trophy, BarChart2, CheckCircle2, Zap } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { signOut } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { updateGoals } from "@/lib/profile/actions";

export default async function GoalsPage() {
  const profile = await requireRole(["student", "admin"]);
  const supabase = await createClient();
  const userId = profile.id;

  // Re-fetch standard profiles metadata for fresh goals (such as score and target exam date)
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("target_score, target_exam_date, exam_track, class_level")
    .eq("id", userId)
    .single();

  const currentProfile = {
    ...profile,
    target_score: userProfile?.target_score || null,
    target_exam_date: userProfile?.target_exam_date || null,
    exam_track: userProfile?.exam_track || profile.exam_track || "jee",
    class_level: userProfile?.class_level || "12th Grade",
  };

  // Calculate target exam countdown date
  const targetDateStr = currentProfile.target_exam_date;
  const targetDate = targetDateStr ? new Date(targetDateStr) : new Date(new Date().getFullYear() + 1, 5, 1);
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const formattedTargetDate = targetDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Calculate progress percent to target score
  const mockMaxScore = currentProfile.exam_track === "neet" ? 720 : 300;
  const targetScore = currentProfile.target_score || (currentProfile.exam_track === "neet" ? 650 : 250);
  const targetPercentage = Math.round((targetScore / mockMaxScore) * 100);

  // Fetch student goals checklist (milestones) from database dynamically
  let subGoals: { text: string; done: boolean }[] = [];
  try {
    const { data: milestones, error: milestonesError } = await supabase
      .from("student_milestones")
      .select("text, done")
      .eq("student_id", userId)
      .order("created_at", { ascending: true });

    if (milestonesError) {
      console.warn("Database student_milestones fetch error (table might not exist yet):", milestonesError.message);
      throw new Error(milestonesError.message);
    }

    if (milestones && milestones.length > 0) {
      subGoals = milestones.map(m => ({
        text: m.text,
        done: !!m.done
      }));
    } else {
      // Fallback if table exists but has no entries
      subGoals = [
        { text: "Achieve >85% accuracy in Mechanics topic tests", done: false },
        { text: "Complete 10 organic reaction roadmaps", done: true },
        { text: "Reduce Rotational Dynamics weakness score below 40", done: false },
        { text: "Maintain a 20-day study streak", done: true },
      ];
    }
  } catch (err) {
    // Dynamic database error fallback
    subGoals = [
      { text: "Achieve >85% accuracy in Mechanics topic tests", done: false },
      { text: "Complete 10 organic reaction roadmaps", done: true },
      { text: "Reduce Rotational Dynamics weakness score below 40", done: false },
      { text: "Maintain a 20-day study streak", done: true },
    ];
  }

  async function handleUpdateGoals(formData: FormData) {
    "use server";
    await updateGoals(formData);
  }

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/78 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <MobileSidebar />
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Pedagogical Milestones
                  </p>
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    Performance Goals
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="glass">
                  Targets Active
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
            {/* Countdown and Stats Section */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="glass-panel text-card-foreground">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Countdown</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">{diffDays}</span>
                    <span className="text-muted-foreground text-sm font-medium">days left</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Calendar className="size-3.5" />
                    Target Exam: {formattedTargetDate}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Target Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight">{targetScore}</span>
                    <span className="text-muted-foreground text-sm font-medium">/ {mockMaxScore} marks</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Target percentile equivalent</span>
                      <span>{targetPercentage}%</span>
                    </div>
                    <Progress value={targetPercentage} label="Target score percentile" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Track</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold tracking-tight capitalize">{currentProfile.exam_track?.toUpperCase() || "JEE"}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 capitalize">
                    <Trophy className="size-3.5" />
                    Level: {currentProfile.class_level || "12th Grade"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Editing and Sub-Goals Section */}
            <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
              {/* Form to update targets */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Adjust Your Targets</CardTitle>
                  <CardDescription>Update your targets and let the AI Coach realign your roadmap.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form action={handleUpdateGoals} className="grid gap-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="examTrack" className="text-sm font-semibold">Exam Track</label>
                        <select
                          id="examTrack"
                          name="examTrack"
                          defaultValue={currentProfile.exam_track || "jee"}
                          className="bg-background flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="jee">JEE Main & Advanced</option>
                          <option value="neet">NEET Medical</option>
                          <option value="foundation">Class Foundation</option>
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor="classLevel" className="text-sm font-semibold">Class / Academic Year</label>
                        <Input
                          id="classLevel"
                          name="classLevel"
                          type="text"
                          placeholder="e.g. 12th Pass, 11th Grade"
                          defaultValue={currentProfile.class_level || "12th Grade"}
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label htmlFor="targetScore" className="text-sm font-semibold">Target Score (out of {mockMaxScore})</label>
                        <Input
                          id="targetScore"
                          name="targetScore"
                          type="number"
                          placeholder="e.g. 260"
                          defaultValue={currentProfile.target_score || ""}
                          min="0"
                          max={mockMaxScore}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label htmlFor="targetExamDate" className="text-sm font-semibold">Target Exam Date</label>
                        <Input
                          id="targetExamDate"
                          name="targetExamDate"
                          type="date"
                          defaultValue={currentProfile.target_exam_date ? currentProfile.target_exam_date.substring(0, 10) : ""}
                        />
                      </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full mt-2 shadow-md">
                      <Zap className="mr-2 size-4 text-warning" />
                      Save & Realign Coach Plan
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Sub-goals tracker checklist */}
              <div className="grid content-start gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Milestone Checklist</CardTitle>
                    <CardDescription>Short-term objectives to pave your way to the target score.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    {subGoals.map((subGoal, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 rounded-lg border p-3.5 ${
                          subGoal.done ? "bg-secondary/40 border-success/30 opacity-80" : "bg-card"
                        }`}
                      >
                        <div className="mt-0.5">
                          {subGoal.done ? (
                            <CheckCircle2 className="text-success size-5 shrink-0" />
                          ) : (
                            <div className="size-5 rounded-full border border-muted-foreground/50 shrink-0" />
                          )}
                        </div>
                        <span className={`text-sm leading-relaxed ${subGoal.done ? "line-through text-muted-foreground" : "font-medium"}`}>
                          {subGoal.text}
                        </span>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-2">
                      Add Custom Milestone
                    </Button>
                  </CardContent>
                </Card>

                {/* Growth stats card */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      <BarChart2 className="size-4 text-primary" />
                      Latest Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs leading-relaxed text-muted-foreground grid gap-2.5">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Mock score average</span>
                      <span className="font-semibold text-foreground">214 marks</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Percentile progress</span>
                      <span className="font-semibold text-foreground">+4.2% (last week)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI study alignment</span>
                      <Badge variant="glass">94% Optimum</Badge>
                    </div>
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
