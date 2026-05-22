import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { signInWithGoogle, signUpWithPassword } from "@/lib/auth/actions";

type RegisterPageProps = {
  searchParams?: Promise<{
    message?: string;
  }>;
};

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const params = await searchParams;

  return (
    <AuthCard
      title="Create your account"
      description="Start a student profile with secure Supabase authentication."
      switchHref="/login"
      switchLabel="Already have an account?"
      message={params?.message}
    >
      <form action={signUpWithPassword} className="grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Full name
          <input
            className="bg-background focus:border-ring h-11 rounded-md border px-3 text-sm transition-colors outline-none"
            name="fullName"
            type="text"
            autoComplete="name"
          />
        </label>
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
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Exam Track
          <select
            className="bg-background focus:border-ring h-11 rounded-md border px-3 text-sm transition-colors outline-none"
            name="examTrack"
            required
          >
            <option value="jee">JEE Main & Advanced</option>
            <option value="neet">NEET Medical</option>
            <option value="foundation">Class Foundation</option>
          </select>
        </label>
        <Button type="submit" size="lg">
          Create account
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
    </AuthCard>
  );
}
