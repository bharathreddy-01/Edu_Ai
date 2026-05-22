import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AppRole = "student" | "mentor" | "admin";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, exam_track, onboarding_completed")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!allowedRoles.includes(profile.role as AppRole)) {
    redirect("/unauthorized");
  }

  return profile;
}
