// app/partner/proyek/[id]/loading.tsx — keadaan memuat Detail/Ubah Proyek.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function ProjectDetailLoading() {
  return (
    <LoadingRegion label="Memuat proyek…" className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-md" />
      <Skeleton className="h-48 rounded-md" />
      <Skeleton className="h-32 rounded-md" />
    </LoadingRegion>
  );
}
