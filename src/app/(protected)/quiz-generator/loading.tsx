import { AppSidebar } from "@/components/layout/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuizGeneratorLoading() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b bg-background/78 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <Skeleton className="h-3 w-40" />
                <Skeleton className="mt-2 h-5 w-52" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </header>
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[360px_1fr]">
            <div className="grid content-start gap-6">
              <Skeleton className="h-[520px] rounded-lg" />
              <Skeleton className="h-44 rounded-lg" />
            </div>
            <Skeleton className="h-[720px] rounded-lg" />
          </div>
        </section>
      </div>
    </main>
  );
}
