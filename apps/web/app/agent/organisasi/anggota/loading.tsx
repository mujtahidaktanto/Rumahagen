// app/agent/organisasi/anggota/loading.tsx — keadaan memuat Kelola Anggota.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MembersLoading() {
  return (
    <LoadingRegion label="Memuat anggota…" className="mx-auto flex w-full max-w-[900px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-36 rounded-md" />
      <Skeleton className="h-56 rounded-md" />
    </LoadingRegion>
  );
}
