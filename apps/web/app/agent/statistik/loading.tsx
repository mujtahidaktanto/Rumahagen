// app/agent/statistik/loading.tsx — keadaan memuat Statistik Saya (judul, filter, kartu ringkasan, grafik).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function StatsLoading() {
  return (
    <LoadingRegion label="Memuat statistik…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 rounded-md" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-md" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 rounded-md" />
        <Skeleton className="h-56 rounded-md" />
      </div>
    </LoadingRegion>
  );
}
