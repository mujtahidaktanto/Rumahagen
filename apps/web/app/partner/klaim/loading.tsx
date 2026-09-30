// app/partner/klaim/loading.tsx — keadaan memuat Klaim Masuk.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function ReviewClaimsLoading() {
  return (
    <LoadingRegion label="Memuat klaim…" className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
