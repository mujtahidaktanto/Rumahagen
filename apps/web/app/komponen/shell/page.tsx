// app/komponen/shell/page.tsx — contoh kerangka aplikasi Agent (8 tujuan sesuai kontrak STEP13-E §4.2): rel dapat disembunyikan di layar lebar, laci di layar sempit, blok pengguna
// membuka menu akun. Memakai menu Agent asli dengan awalan dialihkan ke /komponen/shell agar tidak menuju rute area yang dijaga.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { agentNav } from "@/components/shell/persona-nav";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Kerangka aplikasi | RumahAgen", robots: { index: false, follow: false } };

const items: NavItem[] = agentNav.map((i, n) => ({ ...i, href: i.href.replace("/agent", "/komponen/shell"), badge: n === 3 ? 2 : undefined }));

export default function ShellDemoPage() {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  return (
    <AppShell items={items} title="Agent" user={{ name: "Rian Saputra", roleLabel: "Agent" }} profileHref="/komponen/shell/profil">
      <div className="flex flex-col gap-4 p-4 lg:p-10">
        <h1 className="text-headline">Dashboard</h1>
        <Card className="p-5">
          <p className="text-body-md">Coba tombol sembunyikan navigasi (layar lebar) atau tombol menu (layar sempit), dan klik nama di bawah rel untuk membuka menu akun.</p>
        </Card>
      </div>
    </AppShell>
  );
}
