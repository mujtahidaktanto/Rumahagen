// app/instructor/sesi/loading.tsx — keadaan memuat Sesi Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MySessionsLoading() {
  return (
    <LoadingRegion label="Memuat sesi…" className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
