// app/admin/konten/konten-publik/[id]/loading.tsx — keadaan memuat Form Konten Publik.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function EditStaticContentLoading() {
  return (
    <LoadingRegion label="Memuat…" className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-64 rounded-md" />
      <Skeleton className="h-48 rounded-md" />
    </LoadingRegion>
  );
}
