// app/agent/event/loading.tsx — keadaan memuat Event Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <LoadingRegion label="Memuat event…" className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-56 rounded-md" />
      <Skeleton className="h-44 rounded-md" />
    </LoadingRegion>
  );
}
