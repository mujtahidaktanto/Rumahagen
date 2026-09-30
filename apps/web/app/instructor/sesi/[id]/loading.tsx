// app/instructor/sesi/[id]/loading.tsx — keadaan memuat Detail Sesi.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function SessionDetailLoading() {
  return (
    <LoadingRegion label="Memuat sesi…" className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
      <Skeleton className="h-48 rounded-md" />
    </LoadingRegion>
  );
}
