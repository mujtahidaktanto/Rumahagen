// app/partner/profil/loading.tsx — keadaan memuat Profil Developer.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function PartnerProfileLoading() {
  return (
    <LoadingRegion label="Memuat profil…" className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
