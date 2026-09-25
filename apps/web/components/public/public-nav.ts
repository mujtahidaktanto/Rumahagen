// components/public/public-nav.ts — tautan Global Public Shell (M11): satu sumber untuk header, laci mobile, dan footer. Urutan mengikuti wireframe M11-Homepage.
import type { Route } from "next";

export type PublicLink = { href: Route; label: string };

const r = (p: string) => p as Route; // halaman publik dibangun bertahap; tipe rute baru dibuat next dev/build

export const PUBLIC_NAV: PublicLink[] = [
  { href: r("/"), label: "Beranda" },
  { href: r("/listing"), label: "Listing" },
  { href: r("/agen"), label: "Agen" },
  { href: r("/organisasi"), label: "Organisasi" },
  { href: r("/developer"), label: "Developer" },
  { href: r("/event"), label: "Event" },
  { href: r("/learning"), label: "Learning" },
  { href: r("/learning-session"), label: "Learning Session" },
  { href: r("/konten"), label: "Konten Publik" },
  { href: r("/promo"), label: "Promo" },
];

export const FOOTER_COLUMNS: { title: string; links: PublicLink[] }[] = [
  { title: "Jelajahi", links: PUBLIC_NAV.slice(1, 6) },
  { title: "Learning", links: PUBLIC_NAV.slice(6) },
  {
    title: "Bantuan",
    links: [
      { href: r("/konten"), label: "Pusat Bantuan" },
      { href: r("/konten/syarat-ketentuan"), label: "Syarat & Ketentuan" },
      { href: r("/konten/kebijakan-privasi"), label: "Kebijakan Privasi" },
      { href: r("/konten/hubungi-kami"), label: "Hubungi Kami" },
    ],
  },
];
