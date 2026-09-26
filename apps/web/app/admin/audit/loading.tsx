// app/admin/audit/loading.tsx — keadaan memuat Audit & Oversight.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AuditOversightLoading() {
  return (
    <LoadingRegion label="Memuat audit & oversight…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
