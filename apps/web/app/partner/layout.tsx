import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PersonaShell } from "@/components/shell/PersonaShell";
import { partnerNav } from "@/components/shell/persona-nav";

export const metadata: Metadata = { title: "Developer Partner | RumahAgen", robots: { index: false, follow: false } };

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <PersonaShell area="partner" title="Developer Partner" items={partnerNav}>{children}</PersonaShell>;
}
