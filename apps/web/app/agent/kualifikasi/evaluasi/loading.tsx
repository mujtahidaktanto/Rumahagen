// app/agent/kualifikasi/evaluasi/loading.tsx — keadaan memuat Status Evaluasi & Penghargaan.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function QualificationEvaluationLoading() {
  return (
    <LoadingRegion label="Memuat evaluasi dan penghargaan…" className="mx-auto flex w-full max-w-[1000px] flex-col gap-6 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-40 rounded-md" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-md" />
        ))}
      </div>
    </LoadingRegion>
  );
}
