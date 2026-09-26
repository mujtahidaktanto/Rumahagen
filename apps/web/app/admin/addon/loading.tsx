// app/admin/addon/loading.tsx — keadaan memuat Katalog Add-on.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AddonCatalogLoading() {
  return (
    <LoadingRegion label="Memuat katalog add-on…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-9 w-96" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
