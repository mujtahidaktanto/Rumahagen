// app/(publik)/learning-session/[id]/not-found.tsx — "Sesi tidak ditemukan" (tautan salah, atau Anda tidak berhak melihat sesi ini: RLS tidak membedakan keduanya).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Sesi tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function SessionNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Sesi tidak ditemukan" message="Tautan yang Anda buka salah, atau Anda tidak memiliki akses ke sesi ini." />
      <div className="flex justify-center">
        <LinkButton href="/learning-session" size="sm">
          Lihat sesi lain
        </LinkButton>
      </div>
    </div>
  );
}
