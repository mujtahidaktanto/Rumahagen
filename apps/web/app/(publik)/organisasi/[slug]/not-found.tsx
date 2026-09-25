// app/(publik)/organisasi/[slug]/not-found.tsx — "Organisasi tidak ditemukan" (tautan salah, atau organisasi sudah ditutup/dibekukan/tidak aktif sehingga tidak tampil publik).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Organisasi tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function OrganizationNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Organisasi tidak ditemukan" message="Tautan yang Anda buka salah, atau organisasi ini sudah tidak aktif." />
      <div className="flex justify-center">
        <LinkButton href="/organisasi" size="sm">
          Cari organisasi lain
        </LinkButton>
      </div>
    </div>
  );
}
