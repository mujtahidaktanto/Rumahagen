// components/shell/AgentTopbar.tsx — topbar Agent (wireframe 01-Agent/M08-Dashboard): kolom Cari, Context Switcher, lonceng notifikasi, dan avatar (menuju Profil Saya). Halaman membawa judulnya sendiri,
// jadi topbar tidak mengulang judul. Di layar sempit: lonceng di bilah atas dan Context Switcher di laci. Data dari layout server (lib/agent/shell-data.ts).
import Link from "next/link";
import type { Route } from "next";
import { Avatar } from "@/components/ui/Avatar";
import type { ShellData } from "@/lib/agent/shell-data";
import { ContextSwitcher } from "./ContextSwitcher";
import { NotificationBell } from "./NotificationBell";
import { TopbarSearch } from "./TopbarSearch";

type User = { name: string; avatarUrl?: string | null };

export function agentTopbarParts(data: ShellData, user: User) {
  return {
    desktopTop: (
      <div className="flex w-full items-center gap-3">
        <TopbarSearch />
        <div className="ml-auto flex items-center gap-2.5">
          <ContextSwitcher orgs={data.orgs} context={data.context} />
          <NotificationBell notifications={data.notifications} />
          <Link href={"/agent/profil" as Route} aria-label="Profil Saya" className="flex h-11 w-11 items-center justify-center rounded-full">
            <Avatar name={user.name} imageUrl={user.avatarUrl} size={36} />
          </Link>
        </div>
      </div>
    ),
    mobileTop: <NotificationBell notifications={data.notifications} />,
    drawerTop: <ContextSwitcher orgs={data.orgs} context={data.context} align="left" />,
  };
}
