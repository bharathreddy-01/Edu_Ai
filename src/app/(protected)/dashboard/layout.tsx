import type { ReactNode } from "react";

import { requireRole } from "@/lib/auth/guards";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(["student", "admin"]);

  return children;
}
