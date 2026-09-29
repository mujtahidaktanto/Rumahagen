// app/admin/konfigurasi-belajar/loading.tsx — keadaan memuat Konfigurasi Belajar.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function LearningSettingsLoading() {
  return (
    <LoadingRegion label="Memuat pengaturan belajar…" className="flex flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-96 max-w-xl rounded-md" />
    </LoadingRegion>
  );
}
