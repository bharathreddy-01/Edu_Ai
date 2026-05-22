"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateGoals(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const examTrack = String(formData.get("examTrack") ?? "jee");
  const classLevel = String(formData.get("classLevel") ?? "");
  const targetScoreStr = String(formData.get("targetScore") ?? "");
  const targetExamDateStr = String(formData.get("targetExamDate") ?? "");

  const targetScore = targetScoreStr ? parseInt(targetScoreStr, 10) : null;
  const targetExamDate = targetExamDateStr || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      exam_track: examTrack,
      class_level: classLevel,
      target_score: targetScore,
      target_exam_date: targetExamDate,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating goals:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  revalidatePath("/settings");

  return { success: true };
}

export async function updateProfileSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const fullName = String(formData.get("fullName") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "Asia/Kolkata");
  
  // Custom learning preferences
  const studyHours = formData.get("studyHours") ? parseFloat(String(formData.get("studyHours"))) : 4;
  const sprintDuration = formData.get("sprintDuration") ? parseInt(String(formData.get("sprintDuration")), 10) : 25;
  const focusSubject = String(formData.get("focusSubject") ?? "Physics");

  const learningPreferences = {
    studyHoursPerDay: studyHours,
    sprintDurationMinutes: sprintDuration,
    focusSubject: focusSubject,
  };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      timezone: timezone,
      learning_preferences: learningPreferences,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile settings:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/goals");
  revalidatePath("/settings");

  return { success: true };
}

export async function regenerateStudyPlan() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Get student profile for exam track
  const { data: profile } = await supabase
    .from("profiles")
    .select("exam_track")
    .eq("id", user.id)
    .single();

  const examTrack = profile?.exam_track || "jee";

  // 2. Clear existing slots
  const { error: deleteError } = await supabase
    .from("study_plan_slots")
    .delete()
    .eq("student_id", user.id);

  if (deleteError) {
    console.error("Error clearing existing study plan slots:", deleteError);
    throw new Error(deleteError.message);
  }

  // 3. Define dynamic date strings relative to today
  const today = new Date().toISOString().split('T')[0];
  
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrow = tomorrowObj.toISOString().split('T')[0];

  const dayAfterObj = new Date();
  dayAfterObj.setDate(dayAfterObj.getDate() + 2);
  const dayAfter = dayAfterObj.toISOString().split('T')[0];

  // 4. Construct slots based on exam track
  let slots = [];
  if (examTrack === "neet") {
    slots = [
      // Today
      {
        student_id: user.id,
        slot_date: today,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Biology (Photosynthesis Drill)',
        slot_type: 'Practice',
        status: 'completed'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Physics (Rotational Mechanics)',
        slot_type: 'Revision',
        status: 'current'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '04:00 PM - 05:30 PM',
        label: 'Chemistry (Isomerism Notes)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Tomorrow
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Biology (Human Physiology)',
        slot_type: 'Practice',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Chemistry (Coordination Compounds)',
        slot_type: 'Revision',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '06:00 PM - 07:30 PM',
        label: 'Physics (Torque Problems)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Day After
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '08:00 AM - 10:00 AM',
        label: 'Full Syllabus Biology Mock',
        slot_type: 'Mock',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '03:00 PM - 04:30 PM',
        label: 'Biology (Plant Kingdom)',
        slot_type: 'Revision',
        status: 'pending'
      }
    ];
  } else if (examTrack === "foundation") {
    slots = [
      // Today
      {
        student_id: user.id,
        slot_date: today,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Science (Force & Motion)',
        slot_type: 'Practice',
        status: 'completed'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Math (Algebra Basics)',
        slot_type: 'Revision',
        status: 'current'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '04:00 PM - 05:30 PM',
        label: 'English (Grammar Rules)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Tomorrow
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Math (Geometry Problems)',
        slot_type: 'Practice',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Science (Matter in Our Surroundings)',
        slot_type: 'Revision',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '06:00 PM - 07:30 PM',
        label: 'Social Science (History Notes)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Day After
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '08:00 AM - 10:00 AM',
        label: 'Foundation Class Mock Test',
        slot_type: 'Mock',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '03:00 PM - 04:30 PM',
        label: 'Math (Fractions & Decimals)',
        slot_type: 'Revision',
        status: 'pending'
      }
    ];
  } else {
    // Default: JEE
    slots = [
      // Today
      {
        student_id: user.id,
        slot_date: today,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Math (Integration Drill)',
        slot_type: 'Practice',
        status: 'completed'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Physics (Rotational Mechanics)',
        slot_type: 'Revision',
        status: 'current'
      },
      {
        student_id: user.id,
        slot_date: today,
        time_range: '04:00 PM - 05:30 PM',
        label: 'Chemistry (Isomerism Notes)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Tomorrow
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '07:00 AM - 08:30 AM',
        label: 'Physics (Torque Problems)',
        slot_type: 'Practice',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '10:00 AM - 11:30 AM',
        label: 'Chemistry (Coordination Compounds)',
        slot_type: 'Revision',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: tomorrow,
        time_range: '06:00 PM - 07:30 PM',
        label: 'Math (Definite Integral)',
        slot_type: 'Study',
        status: 'pending'
      },
      // Day After
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '08:00 AM - 10:00 AM',
        label: 'Full Syllabus Math Mock',
        slot_type: 'Mock',
        status: 'pending'
      },
      {
        student_id: user.id,
        slot_date: dayAfter,
        time_range: '03:00 PM - 04:30 PM',
        label: 'Physics (Angular Momentum)',
        slot_type: 'Revision',
        status: 'pending'
      }
    ];
  }

  // 5. Insert slots
  const { error: insertError } = await supabase
    .from("study_plan_slots")
    .insert(slots);

  if (insertError) {
    console.error("Error inserting regenerated study plan slots:", insertError);
    throw new Error(insertError.message);
  }

  revalidatePath("/study-plan");
  revalidatePath("/dashboard");
}

export async function completeStudySlot(slotId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("study_plan_slots")
    .update({
      status: "completed",
      updated_at: new Date().toISOString()
    })
    .eq("id", slotId)
    .eq("student_id", user.id);

  if (error) {
    console.error("Error completing study slot:", error);
    throw new Error(error.message);
  }

  revalidatePath("/study-plan");
  revalidatePath("/dashboard");
}
