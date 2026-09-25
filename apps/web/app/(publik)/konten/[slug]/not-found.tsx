// app/(publik)/konten/[slug]/not-found.tsx — "Halaman Tidak Ditemukan" (wireframe M11 Konten-Publik-Detail): artikel dipindahkan atau belum dipublikasikan.
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Halaman tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function ContentNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Halaman Tidak Ditemukan" message="Artikel ini mungkin sudah dipindahkan atau belum dipublikasikan." />
      <div className="flex justify-center">
        <LinkButton href="/konten" size="sm">
          Kembali ke Pusat Bantuan
        </LinkButton>
      </div>
    </div>
  );
}
