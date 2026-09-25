// app/(publik)/project/[slug]/not-found.tsx — "Proyek tidak ditemukan" (tautan salah, proyek tidak aktif, atau developer nonaktif: RLS tidak membedakan).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Proyek tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function ProjectNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Proyek tidak ditemukan" message="Tautan yang Anda buka salah, atau proyek ini sudah tidak tersedia." />
      <div className="flex justify-center">
        <LinkButton href="/developer" size="sm">
          Lihat proyek lain
        </LinkButton>
      </div>
    </div>
  );
}
