// app/admin/provider-ai/loading.tsx — keadaan memuat Provider AI.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AiProviderCatalogueLoading() {
  return (
    <LoadingRegion label="Memuat provider AI…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
