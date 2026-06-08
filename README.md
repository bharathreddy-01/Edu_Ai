# AI Personalized Learning Coach

## Installation Commands

```bash
npx create-next-app@15 . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
npm install next-themes class-variance-authority clsx tailwind-merge lucide-react @radix-ui/react-slot zod
npm install -D prettier prettier-plugin-tailwindcss eslint-config-prettier
```

## Initial Setup

Copy `.env.example` to `.env.local`, then run:

```bash
npm run dev
```

Open http://localhost:3000.

## UI Design System





The homepage demonstrates:

- Sticky responsive top bar.
- Desktop sidebar and mobile header controls.
- Glassmorphism hero panel.
- KPI stat grid.
- Subject mastery progress layout.
- Adaptive daily study plan.
- Design-token preview panel.
- Accessibility summary card.

## Best Practices

- Keep route UI in `src/app` and shared primitives in `src/components`.
- Add new shadcn UI primitives under `src/components/ui`.
- Validate public runtime configuration through `src/lib/env.ts`.
- Use route-level `loading.tsx`, `error.tsx`, and `not-found.tsx` files for
  resilient UX.
- Prefer server components by default; add `"use client"` only for
  interactivity.
- Run `npm run lint`, `npm run typecheck`, and `npm run format:check` before
  shipping.

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run format`
- `npm run format:check`

## Supabase Backend

Phase 2 backend architecture lives in:

- `docs/supabase-architecture.md`
- `docs/authentication-system.md`
- `supabase/migrations/0001_ai_learning_coach_schema.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/auth/actions.ts`
- `src/lib/auth/guards.ts`
- `src/hooks/use-auth.ts`
- `middleware.ts`
- `docs/gemini-ai-tutor.md`

The schema covers authentication-linked profiles, syllabus subjects and topics,
student progress, study sessions, quizzes, quiz attempts, AI chat history,
analytics events, daily progress, leaderboards, RLS policies, and storage
buckets.

The authentication system covers email/password login, registration, Google
OAuth, callback handling, protected routes, session refresh middleware,
role-based dashboard protection, auth hooks, and logout.

The Gemini AI tutor adds a protected `/ai-tutor` route, streaming Gemini API
responses, markdown rendering, syntax highlighting, subject-aware educational
prompts, rate limiting, and Supabase chat history persistence.
