import { User, Clock, Bell, Shield, Sliders } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signOut } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSettings } from "@/lib/profile/actions";

export default async function SettingsPage() {
  const profile = await requireRole(["student", "admin"]);
  const supabase = await createClient();
  const userId = profile.id;

  // Re-fetch fresh profile details to populate fields correctly
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("full_name, timezone, learning_preferences, role, exam_track")
    .eq("id", userId)
    .single();

  const currentProfile = {
    ...profile,
    timezone: userProfile?.timezone || null,
    learning_preferences: userProfile?.learning_preferences || null,
    exam_track: userProfile?.exam_track || profile.exam_track || "jee",
  };

  // Get learning preferences details with defaults
  const preferences = (currentProfile.learning_preferences as Record<string, unknown>) || {};
  const studyHours = (preferences.studyHoursPerDay as number | undefined) || 4;
  const sprintDuration = (preferences.sprintDurationMinutes as number | undefined) || 25;
  const focusSubject = (preferences.focusSubject as string | undefined) || "Physics";

  async function handleUpdateProfileSettings(formData: FormData) {
    "use server";
    await updateProfileSettings(formData);
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
                    Preferences & Profile
                  </p>
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    Account Settings
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="glass">
                  Live Sync
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
            <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
              {/* Settings Navigation Sidebar */}
              <aside className="flex flex-row gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-x-visible lg:pb-0">
                <Button variant="secondary" className="justify-start gap-2.5 w-full">
                  <User className="size-4" />
                  Profile Details
                </Button>
                <Button variant="ghost" className="justify-start gap-2.5 w-full opacity-70 hover:opacity-100">
                  <Clock className="size-4" />
                  Study Constraints
                </Button>
                <Button variant="ghost" className="justify-start gap-2.5 w-full opacity-70 hover:opacity-100">
                  <Bell className="size-4" />
                  Notifications
                </Button>
                <Button variant="ghost" className="justify-start gap-2.5 w-full opacity-70 hover:opacity-100">
                  <Shield className="size-4" />
                  Privacy & Safety
                </Button>
              </aside>

              {/* Main settings body forms */}
              <div className="grid gap-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Manage your public identity, timezone, and local configurations.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form action={handleUpdateProfileSettings} className="grid gap-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <label htmlFor="fullName" className="text-sm font-semibold">Full Name</label>
                          <Input
                            id="fullName"
                            name="fullName"
                            type="text"
                            placeholder="Your Name"
                            defaultValue={currentProfile.full_name || ""}
                            required
                          />
                        </div>

                        <div className="grid gap-2">
                          <label htmlFor="timezone" className="text-sm font-semibold">Local Timezone</label>
                          <select
                            id="timezone"
                            name="timezone"
                            defaultValue={currentProfile.timezone || "Asia/Kolkata"}
                            className="bg-background flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="Asia/Kolkata">India (IST - UTC+5:30)</option>
                            <option value="America/New_York">United States (EST - UTC-5)</option>
                            <option value="Europe/London">London (GMT - UTC+0)</option>
                            <option value="Asia/Singapore">Singapore (SGT - UTC+8)</option>
                          </select>
                        </div>
                      </div>

                      <div className="border-t pt-5 mt-2">
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Sliders className="size-4 text-primary" />
                          Study Style Preference Settings
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="grid gap-2">
                            <label htmlFor="studyHours" className="text-sm font-semibold">Study Hours/Day</label>
                            <Input
                              id="studyHours"
                              name="studyHours"
                              type="number"
                              step="0.5"
                              placeholder="e.g. 4"
                              defaultValue={studyHours}
                              min="0"
                              max="24"
                            />
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor="sprintDuration" className="text-sm font-semibold">Sprint Duration (mins)</label>
                            <Input
                              id="sprintDuration"
                              name="sprintDuration"
                              type="number"
                              placeholder="e.g. 25"
                              defaultValue={sprintDuration}
                              min="5"
                              max="180"
                            />
                          </div>

                          <div className="grid gap-2">
                            <label htmlFor="focusSubject" className="text-sm font-semibold">Focus Subject</label>
                            <select
                              id="focusSubject"
                              name="focusSubject"
                              defaultValue={focusSubject}
                              className="bg-background flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <option value="Physics">Physics</option>
                              <option value="Chemistry">Chemistry</option>
                              <option value="Math">Mathematics</option>
                              <option value="Biology">Biology</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <Button type="submit" size="lg" className="w-full mt-4 shadow-md">
                        Save Preferences Settings
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Account role metadata info card */}
                <Card className="glass-panel text-card-foreground">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Account Metadata</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground space-y-1">
                    <p>Account Type: <span className="font-semibold text-foreground capitalize">{currentProfile.role || "student"}</span></p>
                    <p>Current Syllabus Tracker: <span className="font-semibold text-foreground capitalize">{currentProfile.exam_track?.toUpperCase() || "JEE"} Syllabus</span></p>
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
