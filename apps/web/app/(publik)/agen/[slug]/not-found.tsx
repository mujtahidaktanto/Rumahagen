// app/(publik)/agen/[slug]/not-found.tsx — "Profil Agen Tidak Ditemukan atau Tidak Publik" (wireframe M11 Detail-Agen memisahkan keduanya; view publik tidak membedakan profil privat dari tidak ada).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Profil agen tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function AgentNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Profil agen tidak ditemukan" message="Tautan yang Anda buka salah, atau agen ini memilih untuk tidak menampilkan profilnya secara publik. Coba jelajahi agen lain." />
      <div className="flex justify-center">
        <LinkButton href="/agen" size="sm">
          Cari Agen Lain
        </LinkButton>
      </div>
    </div>
  );
}
