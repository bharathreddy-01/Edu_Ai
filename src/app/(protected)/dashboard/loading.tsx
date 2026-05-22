import { AppSidebar } from "@/components/layout/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-transparent">
      <div className="flex min-h-screen">
        <AppSidebar />
        <section className="flex min-w-0 flex-1 flex-col">
          <header className="bg-background/78 sticky top-0 z-20 border-b backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div>
                <Skeleton className="h-3 w-36" />
                <Skeleton className="mt-2 h-5 w-52" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </header>
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <Skeleton className="h-72 rounded-lg" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-36 rounded-lg" />
              ))}
            </div>
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              <Skeleton className="h-96 rounded-lg" />
              <div className="grid gap-6">
                <Skeleton className="h-72 rounded-lg" />
                <Skeleton className="h-72 rounded-lg" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
