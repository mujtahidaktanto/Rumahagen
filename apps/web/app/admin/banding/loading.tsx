// app/admin/banding/loading.tsx — keadaan memuat Banding Penghargaan.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AwardAppealLoading() {
  return (
    <LoadingRegion label="Memuat banding penghargaan…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
