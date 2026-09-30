// app/partner/marketing-kit/loading.tsx — keadaan memuat Marketing Kit.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MarketingKitLoading() {
  return (
    <LoadingRegion label="Memuat berkas…" className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
