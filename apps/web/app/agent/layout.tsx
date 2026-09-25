import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PersonaShell } from "@/components/shell/PersonaShell";
import { agentNav } from "@/components/shell/persona-nav";

export const metadata: Metadata = { title: "Agent | RumahAgen", robots: { index: false, follow: false } };

export default function AgentLayout({ children }: { children: ReactNode }) {
  return <PersonaShell area="agent" title="Agent" items={agentNav}>{children}</PersonaShell>;
}
