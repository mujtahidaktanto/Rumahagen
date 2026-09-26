// app/agent/klaim/loading.tsx — keadaan memuat Klaim Proyek (judul dan kartu klaim).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function ClaimsLoading() {
  return (
    <LoadingRegion label="Memuat klaim proyek…" className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-32 rounded-md" />
      ))}
    </LoadingRegion>
  );
}
