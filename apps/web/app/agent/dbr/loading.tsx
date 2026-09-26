// app/agent/dbr/loading.tsx — keadaan memuat layar DBR (judul, tab, kerangka isi).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function DbrLoading() {
  return (
    <LoadingRegion label="Memuat kalkulator…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-10 w-72 rounded-pill" />
      <div className="grid gap-5 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-md" />
        <Skeleton className="h-80 rounded-md" />
      </div>
    </LoadingRegion>
  );
}
