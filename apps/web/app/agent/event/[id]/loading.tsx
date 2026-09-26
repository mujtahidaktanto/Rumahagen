// app/agent/event/[id]/loading.tsx — keadaan memuat Kelola Event (kerangka formulir).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function ManageEventLoading() {
  return (
    <LoadingRegion label="Memuat event…" className="mx-auto flex w-full max-w-[720px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-16 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
      <Skeleton className="h-56 rounded-md" />
    </LoadingRegion>
  );
}
