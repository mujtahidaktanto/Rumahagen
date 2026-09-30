// app/partner/event/baru/loading.tsx — keadaan memuat Ajukan Event.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function NewPartnerEventLoading() {
  return (
    <LoadingRegion label="Memuat…" className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-4 h-48 rounded-md" />
      <Skeleton className="mt-4 h-48 rounded-md" />
    </LoadingRegion>
  );
}
