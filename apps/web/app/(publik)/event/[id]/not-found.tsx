// app/(publik)/event/[id]/not-found.tsx — "Event tidak ditemukan" (tautan salah, atau event belum terbit/dibatalkan/tidak publik: RLS tidak membedakan).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Event tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function EventNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Event tidak ditemukan" message="Tautan yang Anda buka salah, atau event ini belum dipublikasikan atau sudah tidak tersedia." />
      <div className="flex justify-center">
        <LinkButton href="/event" size="sm">
          Lihat event lain
        </LinkButton>
      </div>
    </div>
  );
}
