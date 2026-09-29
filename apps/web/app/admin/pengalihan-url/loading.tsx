// app/admin/pengalihan-url/loading.tsx — keadaan memuat Pengalihan URL.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function UrlRedirectLoading() {
  return (
    <LoadingRegion label="Memuat pengalihan URL…" className="flex flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
