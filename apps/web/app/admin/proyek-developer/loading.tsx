// app/admin/proyek-developer/loading.tsx — keadaan memuat Proyek Developer.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function DeveloperProjectLoading() {
  return (
    <LoadingRegion label="Memuat proyek developer…" className="flex flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
