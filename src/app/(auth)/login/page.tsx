import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signInWithPassword } from "@/lib/auth/actions";

type LoginPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue your personalized JEE/NEET learning plan."
      switchHref="/register"
      switchLabel="New student?"
      message={params?.message}
    >
      <form action={signInWithPassword} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Email
          <input
            className="bg-background focus:border-ring h-11 rounded-md border px-3 text-sm transition-colors outline-none"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Password
          <input
            className="bg-background focus:border-ring h-11 rounded-md border px-3 text-sm transition-colors outline-none"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        <Button type="submit" size="lg">
          Sign in
        </Button>
      </form>

      <div className="text-muted-foreground my-5 flex items-center gap-3 text-xs">
        <span className="bg-border h-px flex-1" />
        or
        <span className="bg-border h-px flex-1" />
      </div>

      <form action={signInWithGoogle}>
        <Button className="w-full" type="submit" size="lg" variant="outline">
          Continue with Google
        </Button>
      </form>

      <p className="text-muted-foreground mt-4 text-center text-xs">
        By continuing, you agree to secure session cookies for authentication.
        <Link className="text-primary ml-1" href="/dashboard">
          Dashboard is protected.
        </Link>
      </p>
    </AuthCard>
  );
}
