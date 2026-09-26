// app/admin/staf/loading.tsx — keadaan memuat Staf Internal.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function StaffInternalLoading() {
  return (
    <LoadingRegion label="Memuat staf internal…" className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
