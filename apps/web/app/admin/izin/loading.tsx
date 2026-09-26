// app/admin/izin/loading.tsx — keadaan memuat Matriks Izin.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function PermissionMatrixLoading() {
  return (
    <LoadingRegion label="Memuat matriks izin…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-80 rounded-md" />
    </LoadingRegion>
  );
}
