"use client";

import { useReportWebVitals } from "next/web-vitals";

import { createClient } from "@/lib/supabase/client";

interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: "good" | "needs-improvement" | "poor";
  navigationType?: string;
}

export function PerformanceMonitor() {
  const supabase = createClient();

  useReportWebVitals((metric: WebVitalMetric) => {
    // Only send telemetry to database in production to optimize resources
    if (process.env.NODE_ENV === "production") {
      supabase
        .from("analytics_events")
        .insert({
          event_name: `web-vital-${metric.name.toLowerCase()}`,
          event_source: "web-client",
          properties: {
            id: metric.id,
            name: metric.name,
            value: metric.value,
            delta: metric.delta,
            rating: metric.rating,
            navigationType: metric.navigationType,
          },
        })
        .then(({ error }) => {
          if (error) {
            console.error("Failed to record Web Vital telemetry:", error);
          }
        });
    } else {
      // In local development, print Web Vitals to the browser console for profiling
      console.log(`[Web Vitals] ${metric.name}:`, {
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    }
  });

  return null;
}
