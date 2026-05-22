import { Menu } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { QuizEngine } from "@/components/quiz/quiz-engine";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";

export default function QuizGeneratorPage() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/78 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Button
                  className="lg:hidden"
                  size="icon"
                  variant="ghost"
                  aria-label="Open navigation"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Adaptive assessment
                  </p>
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    AI Quiz Generator
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="hidden sm:inline-flex" variant="glass">
                  Gemini MCQ
                </Badge>
                <form action={signOut}>
                  <Button type="submit" variant="outline">
                    Logout
                  </Button>
                </form>
                <ThemeToggle />
              </div>
            </div>
          </header>

          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <QuizEngine />
          </div>
        </section>
      </div>
    </main>
  );
}
