// app/komponen/shell/page.tsx — contoh kerangka aplikasi Agent (8 tujuan sesuai kontrak STEP13-E §4.2): rel dapat disembunyikan di layar lebar, laci di layar sempit.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell, type NavItem } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { HomeIcon, UserIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Kerangka aplikasi | RumahAgen", robots: { index: false, follow: false } };

// Contoh saja: rute asli menyusul per modul. Ikon lain ditambah saat modulnya dibangun.
const items: NavItem[] = [
  { href: "/komponen/shell", label: "Dashboard", icon: <HomeIcon size={18} /> },
  { href: "/komponen/shell/listing", label: "Listing Saya", icon: <HomeIcon size={18} /> },
  { href: "/komponen/shell/belajar", label: "Pembelajaran", icon: <HomeIcon size={18} /> },
  { href: "/komponen/shell/event", label: "Event", icon: <HomeIcon size={18} />, badge: 2 },
  { href: "/komponen/shell/organisasi", label: "Organisasi", icon: <UserIcon size={18} /> },
  { href: "/komponen/shell/komersial", label: "Komersial", icon: <HomeIcon size={18} /> },
  { href: "/komponen/shell/ai", label: "AI Assistant", icon: <HomeIcon size={18} /> },
  { href: "/komponen/shell/profil", label: "Profil Saya", icon: <UserIcon size={18} /> },
];

export default function ShellDemoPage() {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  return (
    <AppShell items={items} title="Agent" footer={<span className="text-label-lg">Rian Saputra</span>}>
      <div className="flex flex-col gap-4 p-4 lg:p-10">
        <h1 className="text-headline">Dashboard</h1>
        <Card className="p-5">
          <p className="text-body-md">Coba tombol sembunyikan navigasi (layar lebar) atau tombol menu (layar sempit). Tautan lain di rel sengaja belum punya halaman.</p>
        </Card>
      </div>
    </AppShell>
  );
}
