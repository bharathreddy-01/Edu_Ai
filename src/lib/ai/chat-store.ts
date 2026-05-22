import type { SupabaseClient } from "@supabase/supabase-js";

import type { TutorMessage, TutorSubject } from "@/lib/ai/types";

export async function getOrCreateChatSession({
  supabase,
  userId,
  sessionId,
  subject,
}: {
  supabase: SupabaseClient;
  userId: string;
  sessionId?: string;
  subject: TutorSubject;
}) {
  if (sessionId) {
    const { data } = await supabase
      .from("ai_chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("student_id", userId)
      .single();

    if (data?.id) {
      return data.id as string;
    }
  }

  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .insert({
      student_id: userId,
      title: `${subject} coaching chat`,
      metadata: { subject },
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    throw new Error(error?.message ?? "Could not create chat session.");
  }

  return data.id as string;
}

export async function saveChatMessage({
  supabase,
  userId,
  sessionId,
  message,
  model,
}: {
  supabase: SupabaseClient;
  userId: string;
  sessionId: string;
  message: TutorMessage;
  model?: string;
}) {
  const { error } = await supabase.from("ai_chat_messages").insert({
    session_id: sessionId,
    student_id: userId,
    role: message.role,
    content: message.content,
    metadata: model ? { model } : {},
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function loadRecentChatMessages({
  supabase,
  userId,
  sessionId,
  limit = 12,
}: {
  supabase: SupabaseClient;
  userId: string;
  sessionId?: string;
  limit?: number;
}) {
  if (!sessionId) {
    return [];
  }

  const { data, error } = await supabase
    .from("ai_chat_messages")
    .select("id, role, content, created_at")
    .eq("session_id", sessionId)
    .eq("student_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []).reverse().map((message) => ({
    id: message.id as string,
    role: message.role as TutorMessage["role"],
    content: message.content as string,
    createdAt: message.created_at as string,
  }));
}
