// app/partner/hasil/loading.tsx — keadaan memuat Hasil Kemitraan.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function HasilKemitraanLoading() {
  return (
    <LoadingRegion label="Memuat hasil kemitraan…" className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
