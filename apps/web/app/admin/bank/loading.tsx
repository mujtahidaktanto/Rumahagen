// app/admin/bank/loading.tsx — keadaan memuat Bank Master.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function BankMasterLoading() {
  return (
    <LoadingRegion label="Memuat bank master…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
