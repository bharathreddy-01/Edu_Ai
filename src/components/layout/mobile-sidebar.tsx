"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
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

import { Button } from "@/components/ui/button";
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

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleClose = () => setIsOpen(false);
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-md bg-transparent hover:bg-accent text-foreground"
        aria-label="Open navigation"
        type="button"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={handleBackdropClick}
            aria-hidden="true"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Mobile sidebar */}
          <div 
            className="fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto"
            style={{ 
              backgroundColor: "var(--color-background, white)",
              borderRight: "1px solid var(--color-border, #e5e7eb)",
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "18rem"
            }}
          >
            <div className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-lg shadow-sm">
                  <GraduationCap className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Learning Coach</p>
                  <p className="text-muted-foreground text-xs">JEE/NEET workspace</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-transparent hover:bg-accent"
                aria-label="Close navigation"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>

            <nav className="mt-4 grid gap-1 px-4 py-2" aria-label="Mobile navigation">
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
                    onClick={handleClose}
                    className={cn(
                      "text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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

            <div className="bg-card m-4 rounded-lg border p-4">
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
          </div>
        </>
      )}
    </>
  );
}
