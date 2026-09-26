// app/agent/listing/loading.tsx — keadaan memuat Listing Saya (kartu kuota, filter, kerangka daftar).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MyListingsLoading() {
  return (
    <LoadingRegion label="Memuat listing…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-44 rounded-md" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-pill" />
        ))}
      </div>
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-28 rounded-md" />
      ))}
    </LoadingRegion>
  );
}
