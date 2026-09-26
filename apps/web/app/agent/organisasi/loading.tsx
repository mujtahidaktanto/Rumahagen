// app/agent/organisasi/loading.tsx — keadaan memuat Organisasi (kepala, angka, kuota, anggota).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function OrganizationLoading() {
  return (
    <LoadingRegion label="Memuat organisasi…" className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-40 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-20 rounded-md" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-md" />
      <Skeleton className="h-52 rounded-md" />
    </LoadingRegion>
  );
}
