# Supabase Architecture

Backend architecture for **AI Personalized Learning Coach**, focused on
student profiles, JEE/NEET preparation, quiz tracking, AI coaching history,
analytics, progress, and leaderboards.

## Database Tables

| Table                    | Purpose                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `profiles`               | One profile per Supabase Auth user. Stores role, exam track, target score, preferences, and onboarding state. |
| `subjects`               | Canonical subjects: Physics, Chemistry, Mathematics, Biology.                                                 |
| `topics`                 | Hierarchical syllabus topics mapped to subjects.                                                              |
| `student_topic_progress` | Per-student mastery, accuracy, attempts, and revision scheduling.                                             |
| `study_goals`            | Active and historical student goals.                                                                          |
| `study_sessions`         | Planned and completed study blocks.                                                                           |
| `quizzes`                | Quiz metadata, exam track, status, marks, and timing.                                                         |
| `quiz_questions`         | Questions, options, correct answers, explanations, difficulty, and marks.                                     |
| `quiz_attempts`          | Per-student quiz attempt status, score, accuracy, time, and AI review.                                        |
| `quiz_answers`           | Per-question answers inside a quiz attempt.                                                                   |
| `ai_chat_sessions`       | AI coaching conversations grouped by topic/student.                                                           |
| `ai_chat_messages`       | User, assistant, and system messages with citations and token counts.                                         |
| `analytics_events`       | Flexible product analytics events.                                                                            |
| `daily_progress`         | Daily rollups for study minutes, questions, streaks, and readiness.                                           |
| `leaderboard_entries`    | Ranked entries by daily, weekly, monthly, or all-time period.                                                 |

## Relationships

- `auth.users.id` -> `profiles.id`
- `profiles.id` -> student-owned tables through `student_id`
- `subjects.id` -> `topics.subject_id`
- `topics.id` -> `student_topic_progress.topic_id`
- `topics.id` -> optional `study_sessions.topic_id`
- `quizzes.id` -> `quiz_questions.quiz_id`
- `quizzes.id` -> `quiz_attempts.quiz_id`
- `quiz_attempts.id` -> `quiz_answers.attempt_id`
- `quiz_questions.id` -> `quiz_answers.question_id`
- `ai_chat_sessions.id` -> `ai_chat_messages.session_id`

## SQL Schema

The complete SQL schema is in:

```text
supabase/migrations/0001_ai_learning_coach_schema.sql
```

Apply it with the Supabase SQL editor or the Supabase CLI migration workflow.

## RLS Policies

RLS is enabled on every application table.

- Students can read and write their own profile-linked learning records.
- Students can read published quizzes and shared syllabus data.
- Students can only access their own quiz attempts, answers, chat sessions,
  chat messages, analytics, and progress rows.
- Leaderboards are readable by authenticated users.
- Admin writes are guarded by `public.is_admin()`.
- Profile role changes are blocked through the student self-update policy.

## Storage Buckets

| Bucket             | Public | Purpose                                 | Policy                           |
| ------------------ | ------ | --------------------------------------- | -------------------------------- |
| `avatars`          | Yes    | Student profile images.                 | Public read; owner write.        |
| `chat-attachments` | No     | Images/PDFs attached to AI coach chats. | Owner read/write.                |
| `study-materials`  | No     | Curated PDFs and learning assets.       | Authenticated read; admin write. |

## Best Practices

- Keep service-role keys on the server only. Never expose them in browser code.
- Query student-owned data through RLS instead of manually filtering only in the
  UI.
- Use `profiles.role = 'admin'` sparingly and audit admin access.
- Store quiz answers and AI chat citations as `jsonb` for flexibility, but keep
  ownership and progress metrics relational.
- Roll up high-volume events into `daily_progress` for dashboards.
- Use `leaderboard_entries` as a materialized/ranked table updated by scheduled
  jobs or edge functions.
- Keep AI prompts, model names, token counts, and citations in chat metadata for
  debugging and cost analytics.
- Add private storage paths with user IDs, for example
  `chat-attachments/{user_id}/{session_id}/{file}`.
