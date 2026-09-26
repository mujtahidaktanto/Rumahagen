// app/admin/jalur-penghargaan/loading.tsx — keadaan memuat Jalur Penghargaan.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AwardingPathAdminLoading() {
  return (
    <LoadingRegion label="Memuat jalur penghargaan…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
