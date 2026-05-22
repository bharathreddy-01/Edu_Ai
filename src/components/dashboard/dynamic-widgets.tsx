"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const AnalyticsCharts = dynamic(
  () =>
    import("@/components/dashboard/dashboard-widgets").then(
      (mod) => mod.AnalyticsCharts,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[280px] w-full" />,
  },
);

export const PersonalizedRoadmap = dynamic(
  () =>
    import("@/components/dashboard/dashboard-widgets").then(
      (mod) => mod.PersonalizedRoadmap,
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[320px] w-full" />,
  },
);
