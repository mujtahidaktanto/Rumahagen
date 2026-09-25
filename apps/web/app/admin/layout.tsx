import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PersonaShell } from "@/components/shell/PersonaShell";
import { adminNav } from "@/components/shell/persona-nav";

export const metadata: Metadata = { title: "Admin | RumahAgen", robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <PersonaShell area="admin" title="Admin" tone="ink" items={adminNav}>{children}</PersonaShell>;
}
