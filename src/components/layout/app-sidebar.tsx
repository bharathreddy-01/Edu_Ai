"use client";

import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpenCheck,
  Brain,
  CalendarDays,
  GraduationCap,
  Home,
  MessageCircle,
  Settings,
  Sparkles,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Study Plan", icon: CalendarDays, href: "/study-plan" },
  { label: "AI Coach", icon: MessageCircle, href: "/ai-tutor" },
  { label: "Practice", icon: BookOpenCheck, href: "/quiz-generator" },
  { label: "Content AI", icon: Sparkles, href: "/content-intelligence" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Goals", icon: Target, href: "/goals" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-surface-glass hidden min-h-screen w-72 shrink-0 border-r px-4 py-5 backdrop-blur-xl lg:block">
      <div className="flex items-center gap-3 px-2">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg shadow-sm">
          <GraduationCap className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">AI Learning Coach</p>
          <p className="text-muted-foreground text-xs">JEE/NEET workspace</p>
        </div>
      </div>

      <nav className="mt-8 grid gap-1" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              item.href !== "#" &&
              pathname?.startsWith(item.href));

          return (
            <a
              key={item.label}
              href={item.href}
              className={cn(
                "focus-ring text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground shadow-sm",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="bg-card mt-8 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Brain className="text-primary size-4" aria-hidden="true" />
          <p className="text-sm font-semibold">Coach insight</p>
        </div>
        <p className="text-muted-foreground mt-3 text-sm leading-6">
          Your Physics accuracy rises after 25-minute focused sprints. Keep the
          next session short and equation-heavy.
        </p>
        <Badge className="mt-4" variant="glass">
          AI recommended
        </Badge>
      </div>
    </aside>
  );
}
