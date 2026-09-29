// app/admin/konten/loading.tsx — keadaan memuat Konten & Notifikasi.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function ContentNotifLoading() {
  return (
    <LoadingRegion label="Memuat konten…" className="flex flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-lg" />
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-20 rounded-md" />
      ))}
    </LoadingRegion>
  );
}
