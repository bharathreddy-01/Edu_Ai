"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-card w-full max-w-lg rounded-lg border p-6 text-center shadow-sm">
        <p className="text-destructive text-sm font-medium">
          Something went wrong
        </p>
        <h1 className="mt-3 text-2xl font-semibold">
          The learning coach needs a quick refresh.
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          The app hit an unexpected state. Try again, and if it keeps happening,
          the logged error digest will help trace it.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
