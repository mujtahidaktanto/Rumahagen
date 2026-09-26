// app/admin/moderasi-listing/loading.tsx — keadaan memuat Moderasi Listing.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function ListingModerationLoading() {
  return (
    <LoadingRegion label="Memuat moderasi listing…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
