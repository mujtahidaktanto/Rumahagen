// app/(publik)/learning/[id]/not-found.tsx — "Course tidak ditemukan" (tautan salah, atau course belum terbit/sudah tidak tersedia).
import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export const metadata: Metadata = { title: "Course tidak ditemukan | RumahAgen", robots: { index: false, follow: false } };

export default function CourseNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-16 sm:px-6 xl:px-10">
      <EmptyState title="Course tidak ditemukan" message="Tautan yang Anda buka salah, atau course ini belum tersedia." />
      <div className="flex justify-center">
        <LinkButton href="/learning" size="sm">
          Lihat course lain
        </LinkButton>
      </div>
    </div>
  );
}
