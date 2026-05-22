import Link from "next/link";
import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AuthCardProps = {
  title: string;
  description: string;
  switchHref: string;
  switchLabel: string;
  message?: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  description,
  switchHref,
  switchLabel,
  message,
  children,
}: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="glass-panel w-full max-w-md">
        <CardHeader>
          <div className="mb-5 flex items-center justify-between">
            <Badge variant="glass">AI Learning Coach</Badge>
            <ThemeToggle />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <p className="text-muted-foreground text-sm leading-6">
            {description}
          </p>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="bg-secondary text-secondary-foreground mb-4 rounded-md border p-3 text-sm">
              {message}
            </div>
          ) : null}
          {children}
          <p className="text-muted-foreground mt-6 text-center text-sm">
            {switchLabel}{" "}
            <Link
              className="text-primary font-medium underline-offset-4 hover:underline"
              href={switchHref}
            >
              Continue
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
