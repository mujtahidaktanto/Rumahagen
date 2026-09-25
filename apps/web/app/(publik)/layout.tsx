// app/(publik)/layout.tsx — Global Public Shell (M11): header + isi + footer untuk semua halaman publik (Beranda, Discovery, Detail, Konten, Promo).
import type { ReactNode } from "react";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PublicHeader />
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
