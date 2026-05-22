-- AI Personalized Learning Coach complete schema
-- Run this single file in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('student', 'mentor', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'exam_track') then
    create type public.exam_track as enum ('jee', 'neet', 'foundation');
  end if;

  if not exists (select 1 from pg_type where typname = 'chat_role') then
    create type public.chat_role as enum ('user', 'assistant', 'system');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  role public.app_role not null default 'student',
  exam_track public.exam_track not null default 'jee',
  class_level text,
  target_exam_date date,
  target_score integer,
  timezone text not null default 'Asia/Kolkata',
  onboarding_completed boolean not null default false,
  learning_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_exam_track text;
  parsed_track public.exam_track;
begin
  raw_exam_track := coalesce(new.raw_user_meta_data ->> 'exam_track', 'jee');
  
  -- Simple validation to ensure it casts to enum cleanly
  if raw_exam_track in ('jee', 'neet', 'foundation') then
    parsed_track := raw_exam_track::public.exam_track;
  else
    parsed_track := 'jee'::public.exam_track;
  end if;

  insert into public.profiles (id, full_name, avatar_url, exam_track)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url',
    parsed_track
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New coaching chat',
  topic_id uuid,
  model text,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  role public.chat_role not null,
  content text not null,
  token_count integer check (token_count >= 0),
  citations jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  exam_track text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  parent_topic_id uuid references public.topics(id) on delete set null,
  name text not null,
  slug text not null,
  difficulty smallint not null default 1 check (difficulty between 1 and 5),
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (subject_id, slug)
);

create table if not exists public.student_topic_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  mastery_score numeric(5,2) not null default 0 check (mastery_score between 0 and 100),
  weakness_score numeric(5,2) not null default 0 check (weakness_score between 0 and 100),
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  attempts_count integer not null default 0 check (attempts_count >= 0),
  correct_count integer not null default 0 check (correct_count >= 0),
  current_difficulty text not null default 'medium',
  last_practiced_at timestamptz,
  next_revision_at timestamptz,
  recommendation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, topic_id)
);

create table if not exists public.study_recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  topic_id uuid references public.topics(id) on delete cascade,
  title text not null,
  description text not null,
  priority text not null default 'medium',
  action_label text not null default 'Start',
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  event_name text not null,
  event_source text not null default 'web',
  properties jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.daily_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  progress_date date not null default current_date,
  study_minutes integer not null default 0 check (study_minutes >= 0),
  questions_attempted integer not null default 0 check (questions_attempted >= 0),
  questions_correct integer not null default 0 check (questions_correct >= 0),
  quizzes_completed integer not null default 0 check (quizzes_completed >= 0),
  streak_count integer not null default 0 check (streak_count >= 0),
  readiness_score numeric(5,2) not null default 0 check (readiness_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, progress_date)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  exam_track text not null default 'jee',
  status text not null default 'published',
  duration_minutes integer,
  total_marks numeric(8,2) not null default 0,
  negative_marks numeric(8,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  topic_id uuid,
  question_text text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer jsonb not null,
  explanation text,
  difficulty smallint not null default 2,
  marks numeric(8,2) not null default 4,
  negative_marks numeric(8,2) not null default 1,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'submitted',
  score numeric(8,2) not null default 0,
  accuracy numeric(5,2) not null default 0 check (accuracy between 0 and 100),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  ai_review jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_answer jsonb,
  is_correct boolean,
  marks_awarded numeric(8,2) not null default 0,
  time_spent_seconds integer not null default 0 check (time_spent_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create table if not exists public.leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  period text not null,
  period_start date not null,
  period_end date not null,
  score numeric(10,2) not null default 0,
  rank integer,
  study_minutes integer not null default 0,
  questions_correct integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, period, period_start)
);

create index if not exists idx_ai_chat_sessions_student_id
on public.ai_chat_sessions(student_id);

create index if not exists idx_ai_chat_messages_session_id
on public.ai_chat_messages(session_id);

create index if not exists idx_topics_subject_id
on public.topics(subject_id);

create index if not exists idx_student_topic_progress_student_id
on public.student_topic_progress(student_id);

create index if not exists idx_student_topic_progress_revision
on public.student_topic_progress(student_id, next_revision_at);

create index if not exists idx_study_recommendations_student_status
on public.study_recommendations(student_id, status);

create index if not exists idx_analytics_events_student_occurred
on public.analytics_events(student_id, occurred_at desc);

create index if not exists idx_daily_progress_student_date
on public.daily_progress(student_id, progress_date desc);

create index if not exists idx_quiz_questions_quiz_id
on public.quiz_questions(quiz_id);

create index if not exists idx_quiz_attempts_student_id
on public.quiz_attempts(student_id);

create index if not exists idx_quiz_answers_attempt_id
on public.quiz_answers(attempt_id);

create index if not exists idx_leaderboard_entries_period_score
on public.leaderboard_entries(period, period_start, score desc);

alter table public.profiles enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.student_topic_progress enable row level security;
alter table public.study_recommendations enable row level security;
alter table public.analytics_events enable row level security;
alter table public.daily_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.leaderboard_entries enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own_or_admin') then
    create policy "profiles_select_own_or_admin"
    on public.profiles for select
    to authenticated
    using (id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own_student') then
    create policy "profiles_update_own_student"
    on public.profiles for update
    to authenticated
    using (id = auth.uid() and role = 'student')
    with check (id = auth.uid() and role = 'student');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_admin_all') then
    create policy "profiles_admin_all"
    on public.profiles for all
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_sessions' and policyname = 'ai_chat_sessions_owner_all') then
    create policy "ai_chat_sessions_owner_all"
    on public.ai_chat_sessions for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_chat_messages' and policyname = 'ai_chat_messages_owner_all') then
    create policy "ai_chat_messages_owner_all"
    on public.ai_chat_messages for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'subjects' and policyname = 'subjects_read_authenticated') then
    create policy "subjects_read_authenticated"
    on public.subjects for select
    to authenticated
    using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'topics' and policyname = 'topics_read_authenticated') then
    create policy "topics_read_authenticated"
    on public.topics for select
    to authenticated
    using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'student_topic_progress' and policyname = 'student_topic_progress_owner_all') then
    create policy "student_topic_progress_owner_all"
    on public.student_topic_progress for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'study_recommendations' and policyname = 'study_recommendations_owner_all') then
    create policy "study_recommendations_owner_all"
    on public.study_recommendations for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analytics_events' and policyname = 'analytics_events_owner_insert') then
    create policy "analytics_events_owner_insert"
    on public.analytics_events for insert
    to authenticated
    with check (student_id = auth.uid() or student_id is null or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'analytics_events' and policyname = 'analytics_events_owner_select') then
    create policy "analytics_events_owner_select"
    on public.analytics_events for select
    to authenticated
    using (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'daily_progress' and policyname = 'daily_progress_owner_all') then
    create policy "daily_progress_owner_all"
    on public.daily_progress for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'quizzes_read_authenticated') then
    create policy "quizzes_read_authenticated"
    on public.quizzes for select
    to authenticated
    using (status = 'published' or created_by = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quizzes' and policyname = 'quizzes_owner_insert') then
    create policy "quizzes_owner_insert"
    on public.quizzes for insert
    to authenticated
    with check (created_by = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_questions' and policyname = 'quiz_questions_read_authenticated') then
    create policy "quiz_questions_read_authenticated"
    on public.quiz_questions for select
    to authenticated
    using (
      exists (
        select 1 from public.quizzes
        where quizzes.id = quiz_questions.quiz_id
          and (quizzes.status = 'published' or quizzes.created_by = auth.uid())
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_questions' and policyname = 'quiz_questions_owner_insert') then
    create policy "quiz_questions_owner_insert"
    on public.quiz_questions for insert
    to authenticated
    with check (
      exists (
        select 1 from public.quizzes
        where quizzes.id = quiz_questions.quiz_id
          and quizzes.created_by = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_attempts' and policyname = 'quiz_attempts_owner_all') then
    create policy "quiz_attempts_owner_all"
    on public.quiz_attempts for all
    to authenticated
    using (student_id = auth.uid())
    with check (student_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'quiz_answers' and policyname = 'quiz_answers_owner_all') then
    create policy "quiz_answers_owner_all"
    on public.quiz_answers for all
    to authenticated
    using (
      exists (
        select 1 from public.quiz_attempts
        where quiz_attempts.id = quiz_answers.attempt_id
          and quiz_attempts.student_id = auth.uid()
      )
    )
    with check (
      exists (
        select 1 from public.quiz_attempts
        where quiz_attempts.id = quiz_answers.attempt_id
          and quiz_attempts.student_id = auth.uid()
      )
    );
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'leaderboard_entries' and policyname = 'leaderboard_read_authenticated') then
    create policy "leaderboard_read_authenticated"
    on public.leaderboard_entries for select
    to authenticated
    using (true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'leaderboard_entries' and policyname = 'leaderboard_owner_upsert') then
    create policy "leaderboard_owner_upsert"
    on public.leaderboard_entries for all
    to authenticated
    using (student_id = auth.uid())
    with check (student_id = auth.uid());
  end if;
end $$;

insert into public.subjects (code, name, exam_track, display_order)
values
  ('physics', 'Physics', null, 1),
  ('chemistry', 'Chemistry', null, 2),
  ('math', 'Mathematics', 'jee', 3),
  ('biology', 'Biology', 'neet', 4)
on conflict (code) do nothing;

-- Backfill profiles for users created before this schema was applied.
insert into public.profiles (id, full_name, avatar_url)
select
  id,
  coalesce(raw_user_meta_data ->> 'full_name', ''),
  raw_user_meta_data ->> 'avatar_url'
from auth.users
on conflict (id) do nothing;

-- ==========================================
-- CONTENT ARTIFACTS SCHEMA (CONSOLIDATED)
-- ==========================================

create table if not exists public.content_artifacts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  artifact_type text not null,
  subject text not null,
  chapter text not null,
  title text not null,
  markdown text not null,
  structured jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.content_artifacts enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
      and tablename = 'content_artifacts' 
      and policyname = 'content_artifacts_owner_all'
  ) then
    create policy "content_artifacts_owner_all"
    on public.content_artifacts for all
    to authenticated
    using (student_id = auth.uid())
    with check (student_id = auth.uid());
  end if;
end $$;

-- Trigger for auto updated_at
drop trigger if exists set_content_artifacts_updated_at on public.content_artifacts;
create trigger set_content_artifacts_updated_at
before update on public.content_artifacts
for each row execute function public.set_updated_at();

-- ==========================================
-- PERFORMANCE INDEXES (CONSOLIDATED)
-- ==========================================

-- 1. Base indexes for content artifacts
create index if not exists idx_content_artifacts_student_id
on public.content_artifacts(student_id);

-- 2. Analytics Events indexes
create index if not exists idx_analytics_events_event_name_occurred
on public.analytics_events(event_name, occurred_at desc);

-- 3. Quiz Attempts indexes
create index if not exists idx_quiz_attempts_student_submitted
on public.quiz_attempts(student_id, submitted_at desc);

create index if not exists idx_quiz_attempts_quiz_student
on public.quiz_attempts(quiz_id, student_id);

-- 4. Composite Content Artifacts indexes for high-speed historical loads
create index if not exists idx_content_artifacts_student_type
on public.content_artifacts(student_id, artifact_type, created_at desc);

-- ==========================================
-- STUDY PLAN & MILESTONES SCHEMA (PHASE 11)
-- ==========================================

create table if not exists public.study_plan_slots (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  slot_date date not null default current_date,
  time_range text not null,
  label text not null,
  slot_type text not null default 'Study', -- 'Practice', 'Revision', 'Study', 'Mock'
  status text not null default 'pending',  -- 'completed', 'current', 'pending'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_milestones (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.study_plan_slots enable row level security;
alter table public.student_milestones enable row level security;

-- RLS Policies
do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
      and tablename = 'study_plan_slots' 
      and policyname = 'study_plan_slots_owner_all'
  ) then
    create policy "study_plan_slots_owner_all"
    on public.study_plan_slots for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' 
      and tablename = 'student_milestones' 
      and policyname = 'student_milestones_owner_all'
  ) then
    create policy "student_milestones_owner_all"
    on public.student_milestones for all
    to authenticated
    using (student_id = auth.uid() or public.is_admin())
    with check (student_id = auth.uid() or public.is_admin());
  end if;
end $$;

-- Triggers for auto updated_at
drop trigger if exists set_study_plan_slots_updated_at on public.study_plan_slots;
create trigger set_study_plan_slots_updated_at
before update on public.study_plan_slots
for each row execute function public.set_updated_at();

drop trigger if exists set_student_milestones_updated_at on public.student_milestones;
create trigger set_student_milestones_updated_at
before update on public.student_milestones
for each row execute function public.set_updated_at();

-- Indexes for performance
create index if not exists idx_study_plan_slots_student_date
on public.study_plan_slots(student_id, slot_date asc);

create index if not exists idx_student_milestones_student
on public.student_milestones(student_id);
