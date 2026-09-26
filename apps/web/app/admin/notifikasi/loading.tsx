// loading.tsx — keadaan memuat Pusat Notifikasi (judul, filter, baris notifikasi).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function NotificationsLoading() {
  return (
    <LoadingRegion label="Memuat notifikasi…" className="mx-auto flex w-full max-w-[900px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-64 rounded-pill" />
      {Array.from({ length: 5 }, (_, i) => (
        <Skeleton key={i} className="h-20 rounded-md" />
      ))}
    </LoadingRegion>
  );
}
