import { AppSidebar } from "@/components/layout/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function AiTutorLoading() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/78 sticky top-0 z-20 border-b backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-2 h-5 w-44" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </header>
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[1fr_340px]">
            <Skeleton className="h-[680px] rounded-lg" />
            <div className="grid content-start gap-6">
              <Skeleton className="h-72 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
