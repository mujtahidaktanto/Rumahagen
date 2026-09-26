// app/admin/komersial/loading.tsx — keadaan memuat Komersial & Rekonsiliasi.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CommercialReconciliationLoading() {
  return (
    <LoadingRegion label="Memuat komersial & rekonsiliasi…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
