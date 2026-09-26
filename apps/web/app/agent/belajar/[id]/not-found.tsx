// app/agent/belajar/[id]/not-found.tsx — course tidak ada atau sudah dihapus.
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function CourseRunNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1100px] p-4 py-16 lg:p-8">
      <EmptyState title="Course tidak ditemukan" message="Tautan salah atau course ini sudah tidak tersedia." />
      <div className="flex justify-center">
        <LinkButton href="/agent/belajar" size="sm">
          Kembali ke Pembelajaran
        </LinkButton>
      </div>
    </div>
  );
}
