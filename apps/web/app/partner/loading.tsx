// app/partner/loading.tsx — keadaan memuat Dashboard Developer Partner.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function PartnerLoading() {
  return (
    <LoadingRegion label="Memuat dashboard…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-md" />
        <Skeleton className="h-64 rounded-md" />
      </div>
      <Skeleton className="h-48 rounded-md" />
    </LoadingRegion>
  );
}
