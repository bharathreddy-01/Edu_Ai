import { Menu } from "lucide-react";

import {
  AiRecommendationsCard,
  CoachSummaryHero,
  DashboardMetrics,
  ProgressOverview,
  UpcomingQuizzesCard,
  WeakTopicsCard,
} from "@/components/dashboard/dashboard-widgets";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { AnalyticsCharts, PersonalizedRoadmap } from "@/components/dashboard/dynamic-widgets";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { getAnalyticsSnapshot } from "@/lib/analytics/queries";

export default async function StudentDashboardPage() {
  const profile = await requireRole(["student", "admin"]);
  const supabase = await createClient();
  const userId = profile.id;

  // 1. Fetch fresh profile row including target score, date, and learning preferences
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, exam_track, onboarding_completed, target_exam_date, learning_preferences")
    .eq("id", userId)
    .single();

  const currentProfile = userProfile || {
    ...profile,
    target_exam_date: null,
    learning_preferences: null
  };

  // 2. Fetch fresh analytics snapshot (automatically reads progress, daily logs, and attempts)
  const snapshot = await getAnalyticsSnapshot({ supabase, userId });

  // 3. Fetch active study recommendations from database
  const { data: recommendations } = await supabase
    .from("study_recommendations")
    .select("title, description, priority, action_label, status")
    .eq("student_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3);

  // 4. Fetch upcoming/published quizzes from database
  const { data: upcomingQuizzes } = await supabase
    .from("quizzes")
    .select("title, duration_minutes, exam_track, total_marks")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(3);

  // Determine dynamic greeting and metadata badge
  const studentFirstName = currentProfile.full_name ? currentProfile.full_name.split(" ")[0] : "Student";
  const examTrackLabel = currentProfile.exam_track ? currentProfile.exam_track.toUpperCase() : "JEE";
  
  // Format dynamic exam year badge (e.g. JEE 2027)
  const targetYear = currentProfile.target_exam_date 
    ? new Date(currentProfile.target_exam_date).getFullYear() 
    : 2027;
  const examBadge = `${examTrackLabel} ${targetYear}`;

  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/78 sticky top-0 z-20 border-b backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  className="lg:hidden"
                  size="icon"
                  variant="ghost"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
                    Student dashboard
                  </p>
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    Good morning, {studentFirstName}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="hidden sm:inline-flex" variant="glass">
                  {examBadge}
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
            <CoachSummaryHero profile={currentProfile} weakTopics={snapshot.weakTopics} />
            <DashboardMetrics metrics={snapshot.metrics} />

            <section className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="grid gap-6">
                <ProgressOverview subjectMastery={snapshot.subjectMastery} />
                <AnalyticsCharts trends={snapshot.trends} />
                <PersonalizedRoadmap weakTopics={snapshot.weakTopics} />
              </div>
              <aside className="grid content-start gap-6">
                <WeakTopicsCard weakTopics={snapshot.weakTopics} />
                <AiRecommendationsCard recommendations={recommendations || []} />
                <UpcomingQuizzesCard upcomingQuizzes={upcomingQuizzes || []} />
              </aside>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
