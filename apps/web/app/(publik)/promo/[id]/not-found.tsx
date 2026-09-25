// app/(publik)/promo/[id]/not-found.tsx — "Promo tidak ditemukan" (tautan salah, atau promo belum mulai/sudah berakhir/diarsipkan sehingga tidak tampil publik).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Promo tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function PromoNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Promo tidak ditemukan" message="Tautan yang Anda buka salah, atau promo ini belum dimulai, sudah berakhir, atau sudah tidak tersedia." />
      <div className="flex justify-center">
        <LinkButton href="/promo" size="sm">
          Lihat promo lain
        </LinkButton>
      </div>
    </div>
  );
}
