// app/partner/proyek/baru/loading.tsx — keadaan memuat Buat Proyek Baru.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function NewProjectLoading() {
  return (
    <LoadingRegion label="Memuat…" className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-48 rounded-md" />
      <Skeleton className="h-48 rounded-md" />
    </LoadingRegion>
  );
}
