import type { ReactNode } from "react";

import { requireUser } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();

  return children;
}
