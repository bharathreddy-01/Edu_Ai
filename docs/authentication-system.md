# Authentication System

Supabase Auth implementation for **AI Personalized Learning Coach**.

## Frontend Code

- `/login` supports email/password sign in and Google OAuth.
- `/register` supports email/password account creation and Google OAuth.
- `/auth/callback` exchanges OAuth and email confirmation codes for a session.
- `/dashboard` is protected and includes logout.
- `/unauthorized` handles role-based access failures.

## Auth Hooks

`src/hooks/use-auth.ts` exposes:

- `user`
- `session`
- `isLoading`

Use it in client components that need live auth state.

## Middleware

`middleware.ts` refreshes Supabase cookies and protects:

- `/dashboard`
- `/admin`

Authenticated users are redirected away from `/login` and `/register`.

## Route Protection

Server-side guards live in `src/lib/auth/guards.ts`:

- `requireUser()` redirects unauthenticated users to `/login`.
- `requireRole(["student", "admin"])` protects the student dashboard.
- `getCurrentProfile()` loads role and profile metadata from `profiles`.

## Auth Actions

Server actions live in `src/lib/auth/actions.ts`:

- `signInWithPassword`
- `signUpWithPassword`
- `signInWithGoogle`
- `signOut`

## Best Practices

- Keep auth mutations in server actions.
- Use middleware for session refresh and coarse route protection.
- Use server layouts for role checks that require database reads.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
- Configure Google OAuth redirect URLs in Supabase:
  - `http://localhost:3000/auth/callback`
  - production domain callback URL
- Keep RLS enabled even when routes are protected.
