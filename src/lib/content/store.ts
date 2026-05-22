import type { SupabaseClient } from "@supabase/supabase-js";

import type { ContentArtifact } from "@/lib/content/types";

export async function saveContentArtifact({
  supabase,
  userId,
  artifact,
}: {
  supabase: SupabaseClient;
  userId: string;
  artifact: ContentArtifact;
}) {
  const { data, error } = await supabase
    .from("content_artifacts")
    .insert({
      student_id: userId,
      artifact_type: artifact.artifactType,
      subject: artifact.subject,
      chapter: artifact.chapter,
      title: artifact.title,
      markdown: artifact.markdown,
      structured: artifact.structured,
      metadata: artifact.metadata,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...artifact,
    id: data.id as string,
  };
}

export async function listContentArtifacts({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}) {
  const { data, error } = await supabase
    .from("content_artifacts")
    .select("id, artifact_type, subject, chapter, title, metadata, created_at")
    .eq("student_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((item) => ({
    id: item.id,
    artifactType: item.artifact_type,
    subject: item.subject,
    chapter: item.chapter,
    title: item.title,
    metadata: item.metadata,
    createdAt: item.created_at,
  }));
}

export async function getContentArtifactById({
  supabase,
  userId,
  artifactId,
}: {
  supabase: SupabaseClient;
  userId: string;
  artifactId: string;
}) {
  const { data, error } = await supabase
    .from("content_artifacts")
    .select("*")
    .eq("id", artifactId)
    .eq("student_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    artifactType: data.artifact_type,
    subject: data.subject,
    chapter: data.chapter,
    title: data.title,
    markdown: data.markdown,
    structured: data.structured,
    metadata: data.metadata,
  } as ContentArtifact;
}
