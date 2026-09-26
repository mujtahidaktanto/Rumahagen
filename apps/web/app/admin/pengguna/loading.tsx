// app/admin/pengguna/loading.tsx — keadaan memuat Direktori Pengguna.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function UserDirectoryLoading() {
  return (
    <LoadingRegion label="Memuat direktori pengguna…" className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-8 w-full max-w-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
