"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: 32, fontFamily: "system-ui, sans-serif" }}>
          <h1>Application error</h1>
          <p>A critical rendering error occurred.</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
