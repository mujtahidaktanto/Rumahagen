// app/admin/loading.tsx — keadaan memuat Dashboard Analytics.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AdminHomeLoading() {
  return (
    <LoadingRegion label="Memuat dashboard…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-16 rounded-md" />
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
