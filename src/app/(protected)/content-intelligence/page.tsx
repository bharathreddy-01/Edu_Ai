import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { ContentIntelligenceWorkspace } from "@/components/content/content-generator";

export const dynamic = "force-dynamic";

export default function ContentIntelligencePage() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/78 sticky top-0 z-20 border-b backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <MobileSidebar />
                <div className="min-w-0">
                  <p className="text-muted-foreground text-xs font-medium tracking-[0.16em] uppercase">
                    Content AI
                  </p>
                  <h1 className="truncate text-lg font-semibold sm:text-xl">
                    AI Content Intelligence
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="hidden sm:inline-flex" variant="glass">
                  Gemini API
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
            <ContentIntelligenceWorkspace />
          </div>
        </section>
      </div>
    </main>
  );
}
