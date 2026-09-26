// app/admin/ekonomi-belajar/loading.tsx — keadaan memuat Ekonomi Pembelajaran.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function LearningEconomyLoading() {
  return (
    <LoadingRegion label="Memuat ekonomi pembelajaran…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
