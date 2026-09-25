// components/shell/persona-nav.tsx — daftar menu tiap persona, mengikuti wireframe v2 (label dan urutan). Jumlah menu: Agent 8, Partner 7, Instruktur 6 (STEP13-E §4);
// Admin memuat semua tujuan konsol (22) dan nanti disaring per kemampuan (capability-driven). Halaman tujuan dibangun per modul (Fase 3 dan seterusnya):
// sampai saat itu tautan ke halaman yang belum ada menghasilkan 404. Ikon khusus dipasang saat layarnya dibangun (sementara: ikon netral).
import type { NavItem } from "./AppShell";
import { DotIcon, HomeIcon, UserIcon } from "@/components/ui/icons";

const home = <HomeIcon size={18} />;
const dot = <DotIcon size={18} />;
const user = <UserIcon size={18} />;

export const agentNav: NavItem[] = [
  { href: "/agent", label: "Dashboard", icon: home },
  { href: "/agent/listing", label: "Listing Saya", icon: dot },
  { href: "/agent/belajar", label: "Pembelajaran", icon: dot },
  { href: "/agent/event", label: "Event", icon: dot },
  { href: "/agent/organisasi", label: "Organisasi", icon: dot },
  { href: "/agent/komersial", label: "Komersial", icon: dot },
  { href: "/agent/ai", label: "AI Assistant", icon: dot },
  { href: "/agent/profil", label: "Profil Saya", icon: user },
];

export const partnerNav: NavItem[] = [
  { href: "/partner", label: "Dashboard", icon: home },
  { href: "/partner/proyek", label: "Proyek Saya", icon: dot },
  { href: "/partner/marketing-kit", label: "Marketing Kit", icon: dot },
  { href: "/partner/klaim", label: "Klaim Masuk", icon: dot },
  { href: "/partner/event", label: "Event", icon: dot },
  { href: "/partner/hasil", label: "Hasil Kemitraan", icon: dot },
  { href: "/partner/profil", label: "Profil Developer", icon: user },
];

export const instructorNav: NavItem[] = [
  { href: "/instructor", label: "Dashboard", icon: home },
  { href: "/instructor/sesi", label: "Sesi Saya", icon: dot },
  { href: "/instructor/kursus", label: "Kursus Saya", icon: dot },
  { href: "/instructor/event", label: "Event", icon: dot },
  { href: "/notifikasi", label: "Notifikasi", icon: dot },
  { href: "/instructor/profil", label: "Profil Saya", icon: user },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard Analytics", icon: home },
  { href: "/admin/pengguna", label: "Direktori Pengguna", icon: dot },
  { href: "/admin/staf", label: "Staf Internal", icon: dot },
  { href: "/admin/izin", label: "Matriks Izin", icon: dot },
  { href: "/admin/konten", label: "Konten & Notifikasi", icon: dot },
  { href: "/admin/konfigurasi", label: "Konfigurasi Sistem", icon: dot },
  { href: "/admin/audit", label: "Audit & Oversight", icon: dot },
  { href: "/admin/moderasi-listing", label: "Moderasi Listing", icon: dot },
  { href: "/admin/bank", label: "Bank Master", icon: dot },
  { href: "/admin/provider-ai", label: "Provider AI", icon: dot },
  { href: "/admin/ekonomi-belajar", label: "Ekonomi Pembelajaran", icon: dot },
  { href: "/admin/kursus", label: "Kelola Kursus", icon: dot },
  { href: "/admin/konfigurasi-belajar", label: "Konfigurasi Belajar", icon: dot },
  { href: "/admin/komersial", label: "Komersial & Rekonsiliasi", icon: dot },
  { href: "/admin/addon", label: "Katalog Add-on", icon: dot },
  { href: "/admin/promosi", label: "Promosi", icon: dot },
  { href: "/admin/paket", label: "Paket Langganan", icon: dot },
  { href: "/admin/banding", label: "Banding Penghargaan", icon: dot },
  { href: "/admin/jalur-penghargaan", label: "Jalur Penghargaan", icon: dot },
  { href: "/admin/proyek-developer", label: "Proyek Developer", icon: dot },
  { href: "/admin/pengalihan-url", label: "Pengalihan URL", icon: dot },
  { href: "/admin/profil", label: "Profil Saya", icon: user },
];
