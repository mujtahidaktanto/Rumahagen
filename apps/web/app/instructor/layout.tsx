import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PersonaShell } from "@/components/shell/PersonaShell";
import { instructorNav } from "@/components/shell/persona-nav";

export const metadata: Metadata = { title: "Instruktur | RumahAgen", robots: { index: false, follow: false } };

export default function InstructorLayout({ children }: { children: ReactNode }) {
  return <PersonaShell area="instructor" title="Instruktur" items={instructorNav}>{children}</PersonaShell>;
}
