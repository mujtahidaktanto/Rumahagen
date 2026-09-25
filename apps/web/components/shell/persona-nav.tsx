// components/shell/persona-nav.tsx — daftar menu tiap persona, mengikuti wireframe v2 (label, urutan, dan gaya ikon). Jumlah menu: Agent 8, Partner 7, Instruktur 6 (STEP13-E §4);
// Admin memuat semua tujuan konsol (22) dan nanti disaring per kemampuan (capability-driven). Halaman tujuan dibangun per modul (Fase 3 dan seterusnya):
// sampai saat itu tautan ke halaman yang belum ada menghasilkan 404.
import type { NavItem } from "./AppShell";
import {
  BankIcon, BellIcon, BookIcon, BuildingIcon, CalendarIcon, CardIcon, ChartIcon, CheckCircleIcon, ClipboardIcon, ClockIcon, DocIcon, FolderIcon, GearIcon, HomeIcon, InboxIcon,
  LayersIcon, LockIcon, OfficeIcon, SparkleIcon, SwapIcon, TagIcon, TrophyIcon, UserIcon, UsersIcon, VideoIcon,
} from "@/components/ui/icons";

const s = 18;

export const agentNav: NavItem[] = [
  { href: "/agent", label: "Dashboard", icon: <HomeIcon size={s} /> },
  { href: "/agent/listing", label: "Listing Saya", icon: <BuildingIcon size={s} /> },
  { href: "/agent/belajar", label: "Pembelajaran", icon: <BookIcon size={s} /> },
  { href: "/agent/event", label: "Event", icon: <CalendarIcon size={s} /> },
  { href: "/agent/organisasi", label: "Organisasi", icon: <UsersIcon size={s} /> },
  { href: "/agent/komersial", label: "Komersial", icon: <CardIcon size={s} /> },
  { href: "/agent/ai", label: "AI Assistant", icon: <SparkleIcon size={s} /> },
  { href: "/agent/profil", label: "Profil Saya", icon: <UserIcon size={s} /> },
];

export const partnerNav: NavItem[] = [
  { href: "/partner", label: "Dashboard", icon: <HomeIcon size={s} /> },
  { href: "/partner/proyek", label: "Proyek Saya", icon: <BuildingIcon size={s} /> },
  { href: "/partner/marketing-kit", label: "Marketing Kit", icon: <FolderIcon size={s} /> },
  { href: "/partner/klaim", label: "Klaim Masuk", icon: <InboxIcon size={s} /> },
  { href: "/partner/event", label: "Event", icon: <CalendarIcon size={s} /> },
  { href: "/partner/hasil", label: "Hasil Kemitraan", icon: <CheckCircleIcon size={s} /> },
  { href: "/partner/profil", label: "Profil Developer", icon: <UserIcon size={s} /> },
];

export const instructorNav: NavItem[] = [
  { href: "/instructor", label: "Dashboard", icon: <HomeIcon size={s} /> },
  { href: "/instructor/sesi", label: "Sesi Saya", icon: <VideoIcon size={s} /> },
  { href: "/instructor/kursus", label: "Kursus Saya", icon: <BookIcon size={s} /> },
  { href: "/instructor/event", label: "Event", icon: <CalendarIcon size={s} /> },
  { href: "/notifikasi", label: "Notifikasi", icon: <BellIcon size={s} /> },
  { href: "/instructor/profil", label: "Profil Saya", icon: <UserIcon size={s} /> },
];

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard Analytics", icon: <ChartIcon size={s} /> },
  { href: "/admin/pengguna", label: "Direktori Pengguna", icon: <UserIcon size={s} /> },
  { href: "/admin/staf", label: "Staf Internal", icon: <LockIcon size={s} /> },
  { href: "/admin/izin", label: "Matriks Izin", icon: <CheckCircleIcon size={s} /> },
  { href: "/admin/konten", label: "Konten & Notifikasi", icon: <BellIcon size={s} /> },
  { href: "/admin/konfigurasi", label: "Konfigurasi Sistem", icon: <GearIcon size={s} /> },
  { href: "/admin/audit", label: "Audit & Oversight", icon: <ClipboardIcon size={s} /> },
  { href: "/admin/moderasi-listing", label: "Moderasi Listing", icon: <BuildingIcon size={s} /> },
  { href: "/admin/bank", label: "Bank Master", icon: <BankIcon size={s} /> },
  { href: "/admin/provider-ai", label: "Provider AI", icon: <DocIcon size={s} /> },
  { href: "/admin/ekonomi-belajar", label: "Ekonomi Pembelajaran", icon: <HomeIcon size={s} /> },
  { href: "/admin/kursus", label: "Kelola Kursus", icon: <BookIcon size={s} /> },
  { href: "/admin/konfigurasi-belajar", label: "Konfigurasi Belajar", icon: <ClockIcon size={s} /> },
  { href: "/admin/komersial", label: "Komersial & Rekonsiliasi", icon: <OfficeIcon size={s} /> },
  { href: "/admin/addon", label: "Katalog Add-on", icon: <BankIcon size={s} /> },
  { href: "/admin/promosi", label: "Promosi", icon: <TagIcon size={s} /> },
  { href: "/admin/paket", label: "Paket Langganan", icon: <LayersIcon size={s} /> },
  { href: "/admin/banding", label: "Banding Penghargaan", icon: <CheckCircleIcon size={s} /> },
  { href: "/admin/jalur-penghargaan", label: "Jalur Penghargaan", icon: <TrophyIcon size={s} /> },
  { href: "/admin/proyek-developer", label: "Proyek Developer", icon: <BuildingIcon size={s} /> },
  { href: "/admin/pengalihan-url", label: "Pengalihan URL", icon: <SwapIcon size={s} /> },
  { href: "/admin/profil", label: "Profil Saya", icon: <UserIcon size={s} /> },
];
