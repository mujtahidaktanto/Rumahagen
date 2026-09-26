// app/admin/paket/loading.tsx — keadaan memuat Paket Langganan.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function PlanCatalogLoading() {
  return (
    <LoadingRegion label="Memuat paket langganan…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
