// app/(publik)/developer/[slug]/not-found.tsx — "Developer tidak ditemukan" (tautan salah, atau perusahaan sudah tidak aktif sehingga tidak tampil publik).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Developer tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function DeveloperNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Developer tidak ditemukan" message="Tautan yang Anda buka salah, atau perusahaan ini sudah tidak aktif." />
      <div className="flex justify-center">
        <LinkButton href="/developer" size="sm">
          Lihat developer lain
        </LinkButton>
      </div>
    </div>
  );
}
