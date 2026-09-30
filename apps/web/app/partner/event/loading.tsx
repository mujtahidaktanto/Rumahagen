// app/partner/event/loading.tsx — keadaan memuat Event.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function PartnerEventsLoading() {
  return (
    <LoadingRegion label="Memuat event…" className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
