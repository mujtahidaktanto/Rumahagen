// app/admin/konfigurasi/loading.tsx — keadaan memuat Konfigurasi Sistem.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function SystemConfigLoading() {
  return (
    <LoadingRegion label="Memuat konfigurasi…" className="flex flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-80 max-w-xl rounded-md" />
    </LoadingRegion>
  );
}
