import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "info";
};

const toneStyles = {
  primary: "bg-primary/12 text-primary",
  success: "bg-success/18 text-success-foreground dark:text-success",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  info: "bg-info/18 text-info-foreground dark:text-info",
};

export function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "primary",
}: StatCardProps) {
  return (
    <Card className="p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
        </div>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-md",
            toneStyles[tone],
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </div>
      <p className="text-muted-foreground mt-3 text-sm leading-6">{detail}</p>
    </Card>
  );
}
