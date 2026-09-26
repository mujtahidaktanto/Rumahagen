// app/agent/kualifikasi/loading.tsx — keadaan memuat Bukti Kualifikasi.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function QualificationEvidenceLoading() {
  return (
    <LoadingRegion label="Memuat bukti kualifikasi…" className="mx-auto flex w-full max-w-[920px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-16 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
