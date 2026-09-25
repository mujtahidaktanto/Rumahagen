// app/komponen/page.tsx — galeri komponen dasar (Fase 1). Tidak diindeks. Sembunyikan di produksi nyata dengan HIDE_DEV_PAGES=1 (env Vercel).
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComponentGallery } from "@/components/dev/ComponentGallery";

export const metadata: Metadata = { title: "Komponen dasar | RumahAgen", robots: { index: false, follow: false } };

export default function KomponenPage() {
  if (process.env.HIDE_DEV_PAGES === "1") notFound();
  return <ComponentGallery />;
}
