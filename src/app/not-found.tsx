import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-card w-full max-w-lg rounded-lg border p-6 text-center shadow-sm">
        <p className="text-primary text-sm font-medium">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          This route is not part of the learning workspace yet.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </main>
  );
}
