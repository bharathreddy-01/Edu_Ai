export default function Loading() {
  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="bg-card w-full max-w-md rounded-lg border p-6 shadow-sm">
        <div className="bg-muted h-5 w-40 animate-pulse rounded-md" />
        <div className="bg-muted mt-4 h-10 animate-pulse rounded-md" />
        <div className="bg-muted mt-3 h-10 animate-pulse rounded-md" />
        <div className="bg-muted mt-6 h-11 w-32 animate-pulse rounded-md" />
      </div>
    </main>
  );
}
