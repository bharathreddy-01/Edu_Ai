# AI Personalized Learning Coach

Production-grade Next.js 15 frontend foundation using App Router, TypeScript,
Tailwind CSS v4, shadcn-style components, dark/light mode, ESLint, Prettier,
loading states, and error boundaries.

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

## Folder Structure

```text
src/
  app/
    error.tsx
    global-error.tsx
    globals.css
    layout.tsx
    loading.tsx
    not-found.tsx
    page.tsx
  components/
    providers/
      theme-provider.tsx
    ui/
      button.tsx
    theme-toggle.tsx
  lib/
    env.ts
    utils.ts
  types/
    index.ts
```

## Recommended Dependencies

- `next-themes` for dark/light/system theme handling.
- `class-variance-authority`, `clsx`, and `tailwind-merge` for reusable
  component variants.
- `lucide-react` for consistent icons.
- `zod` for typed environment validation.
- `prettier`, `prettier-plugin-tailwindcss`, and `eslint-config-prettier` for
  clean code standards.

## UI Design System

### Typography

- Font: Geist Sans for product UI, Geist Mono for technical values.
- UI text: `text-xs`, `text-sm`, and `text-base` for dense dashboard surfaces.
- Headings: `text-lg` for page chrome, `text-2xl` for cards, `text-3xl` to
  `text-4xl` for primary dashboard moments.
- Letter spacing stays neutral for readability, with uppercase labels using
  `tracking-[0.16em]`.

### Color Palette

- Core tokens: `background`, `foreground`, `card`, `primary`, `secondary`,
  `muted`, `accent`, `border`, and `ring`.
- Feedback tokens: `success`, `warning`, `info`, and `destructive`.
- Subject tokens: `chart-physics`, `chart-chemistry`, `chart-math`, and
  `chart-biology`.
- Both light and dark themes are defined in `src/app/globals.css`.

### Spacing

- Base rhythm follows Tailwind's 4px scale.
- Compact UI uses `gap-2`, `gap-3`, `p-3`, and `p-4`.
- Dashboard sections use `gap-6`, `px-4`, `sm:px-6`, and `lg:px-8`.
- Major panels use `rounded-lg`, restrained borders, and consistent card
  padding.

### Button Styles

Reusable button variants live in `src/components/ui/button.tsx`:

- `default`
- `secondary`
- `outline`
- `ghost`
- `destructive`
- `link`

Sizes include `sm`, `default`, `lg`, and `icon`.

### Card Components

Reusable card primitives live in `src/components/ui/card.tsx`:

- `Card`
- `CardHeader`
- `CardTitle`
- `CardDescription`
- `CardContent`

Specialized dashboard cards live in `src/components/ui/stat-card.tsx`.

### Sidebar Design

The reusable SaaS sidebar lives in `src/components/layout/app-sidebar.tsx`.
It includes primary navigation, active route styling, AI coach insight, and a
JEE/NEET-focused brand block.

### Dashboard Layouts

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
