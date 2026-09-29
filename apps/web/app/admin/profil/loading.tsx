// app/admin/profil/loading.tsx — keadaan memuat Profil Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AdminProfileLoading() {
  return (
    <LoadingRegion label="Memuat profil…" className="flex flex-col gap-4 p-4 lg:max-w-2xl lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-20 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </LoadingRegion>
  );
}
