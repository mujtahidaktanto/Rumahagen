// app/instructor/profil/loading.tsx — keadaan memuat Profil Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function InstructorProfileLoading() {
  return (
    <LoadingRegion label="Memuat profil…" className="flex w-full flex-col gap-4 p-4 lg:max-w-2xl lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </LoadingRegion>
  );
}
