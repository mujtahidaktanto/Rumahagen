// components/shell/PersonaShell.tsx — layout area persona (Server Component): memanggil penjaga sesi+peran lalu merender AppShell dengan menu dan pengguna yang login.
import type { ReactNode } from "react";
import { AppShell, type NavItem } from "./AppShell";
import { LogoutButton } from "./LogoutButton";
import { ROLE_LABEL, type Area } from "@/lib/auth/roles";
import { requireArea } from "@/lib/auth/session";

type PersonaShellProps = { area: Area; title: string; tone?: "blue" | "ink"; items: NavItem[]; children: ReactNode };

export async function PersonaShell({ area, title, tone = "blue", items, children }: PersonaShellProps) {
  const user = await requireArea(area);
  return (
    <AppShell items={items} title={title} tone={tone} user={{ name: user.name, roleLabel: ROLE_LABEL[user.role], avatarUrl: user.avatarUrl }} footer={<LogoutButton />}>
      {children}
    </AppShell>
  );
}
