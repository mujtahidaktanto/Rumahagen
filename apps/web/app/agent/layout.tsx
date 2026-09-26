import type { Metadata } from "next";
import type { ReactNode } from "react";
import { agentTopbarParts } from "@/components/shell/AgentTopbar";
import { PersonaShell } from "@/components/shell/PersonaShell";
import { agentNav } from "@/components/shell/persona-nav";
import { getShellData } from "@/lib/agent/shell-data";
import { requireArea } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Agent | RumahAgen", robots: { index: false, follow: false } };

export default async function AgentLayout({ children }: { children: ReactNode }) {
  // Penjaga area dijalankan dulu (mengalihkan yang tidak berhak); PersonaShell memanggilnya lagi dan hasilnya dipakai bersama (di-cache per permintaan).
  const user = await requireArea("agent");
  const parts = agentTopbarParts(await getShellData(user.id), { name: user.name, avatarUrl: user.avatarUrl });
  return (
    <PersonaShell area="agent" title="Agent" items={agentNav} {...parts}>
      {children}
    </PersonaShell>
  );
}
