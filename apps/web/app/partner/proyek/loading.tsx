// app/partner/proyek/loading.tsx — keadaan memuat Proyek Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MyProjectsLoading() {
  return (
    <LoadingRegion label="Memuat proyek…" className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
