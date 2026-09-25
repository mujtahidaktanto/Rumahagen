// app/(publik)/listing/[slug]/not-found.tsx — keadaan "Listing tidak ditemukan" (wireframe M11 Detail-Listing). Listing yang tidak terbit juga tampil begini bagi pengunjung (RLS menyembunyikannya).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Listing tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function ListingNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Listing tidak ditemukan" message="Tautan yang Anda buka salah, atau listing ini sudah tidak tersedia." />
      <div className="flex justify-center">
        <LinkButton href="/listing" size="sm">
          Cari listing lain
        </LinkButton>
      </div>
    </div>
  );
}
