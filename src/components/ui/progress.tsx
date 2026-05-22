import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  indicatorClassName?: string;
  label?: string;
};

function Progress({
  value,
  label,
  className,
  indicatorClassName,
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={cn("bg-muted h-2 overflow-hidden rounded-full", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      {...props}
    >
      <div
        className={cn("bg-primary h-full rounded-full", indicatorClassName)}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

export { Progress };
