// app/komponen/shell/page.tsx — contoh kerangka aplikasi Agent (8 tujuan sesuai kontrak STEP13-E §4.2): rel dapat disembunyikan di layar lebar, laci di layar sempit, blok pengguna
// membuka menu akun. Memakai menu Agent asli dengan awalan dialihkan ke /komponen/shell agar tidak menuju rute area yang dijaga.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { agentTopbarParts } from "@/components/shell/AgentTopbar";
import { agentNav } from "@/components/shell/persona-nav";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Kerangka aplikasi | RumahAgen", robots: { index: false, follow: false } };

const items: NavItem[] = agentNav.map((i, n) => ({ ...i, href: i.href.replace("/agent", "/komponen/shell"), badge: n === 3 ? 2 : undefined }));

const ago = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

export default async function ShellDemoPage({ searchParams }: { searchParams: Promise<{ notif?: string; org?: string }> }) {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  const { notif = "ada", org = "ada" } = await searchParams;
  const orgs = org === "tanpa" ? [] : [{ id: "0db7b607-a7fa-41af-adbf-052707bf79fc", name: "Kantor Uji RumahAgen", role: "leader" }, { id: "fea2e964-628b-4629-a47f-681709197651", name: "Tim Broker BSD dengan Nama Cukup Panjang", role: "member" }];
  const parts = agentTopbarParts(
    {
      orgs,
      context: org === "aktif" ? { kind: "org", org: orgs[0]! } : { kind: "personal" },
      notifications:
        notif === "gagal"
          ? { ok: false }
          : notif === "kosong"
            ? { ok: true, unread: 0, items: [] }
            : {
                ok: true,
                unread: 3,
                items: [
                  { id: "n1", title: "Pendaftaran event disetujui", message: "Anda terdaftar pada event \"Open House Green Valley\".", createdAt: ago(12), isRead: false, entityType: "event", entityId: "e1" },
                  { id: "n2", title: "Undangan bergabung organisasi", message: null, createdAt: ago(75), isRead: false, entityType: "organization", entityId: "o1" },
                  { id: "n3", title: "Sertifikat diterbitkan", message: "Sales Skill: Negosiasi Properti", createdAt: ago(60 * 26), isRead: true, entityType: "certificate", entityId: "c1" },
                ],
              },
    },
    { name: "Rian Saputra" },
  );
  return (
    <AppShell items={items} title="Agent" user={{ name: "Rian Saputra", roleLabel: "Agent" }} profileHref="/komponen/shell/profil" {...parts}>
      <div className="flex flex-col gap-4 p-4 lg:p-10">
        <h1 className="text-headline">Dashboard</h1>
        <Card className="p-5">
          <p className="text-body-md">Coba tombol sembunyikan navigasi (layar lebar) atau tombol menu (layar sempit), dan klik nama di bawah rel untuk membuka menu akun.</p>
        </Card>
      </div>
    </AppShell>
  );
}
