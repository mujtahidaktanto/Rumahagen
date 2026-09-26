// app/agent/listing/[id]/loading.tsx — keadaan memuat Detail Listing Agent.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MyListingDetailLoading() {
  return (
    <LoadingRegion label="Memuat listing…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-10 w-3/4" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-72 rounded-md" />
          <Skeleton className="h-48 rounded-md" />
        </div>
        <Skeleton className="h-64 rounded-md" />
      </div>
    </LoadingRegion>
  );
}
