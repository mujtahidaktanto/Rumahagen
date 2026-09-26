// app/agent/komersial/loading.tsx — keadaan memuat Katalog Komersial (judul, pengalih, kartu add-on).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CatalogLoading() {
  return (
    <LoadingRegion label="Memuat katalog…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full max-w-md rounded-pill" />
      <Skeleton className="h-16 rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-56 rounded-md" />
        ))}
      </div>
    </LoadingRegion>
  );
}
