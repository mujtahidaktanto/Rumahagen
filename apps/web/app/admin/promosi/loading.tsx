// app/admin/promosi/loading.tsx — keadaan memuat Promosi.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function PromotionLoading() {
  return (
    <LoadingRegion label="Memuat promosi…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
