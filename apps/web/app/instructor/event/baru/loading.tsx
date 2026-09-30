// app/instructor/event/baru/loading.tsx — keadaan memuat Buat Event.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function NewInstructorEventLoading() {
  return (
    <LoadingRegion label="Memuat…" className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-96 rounded-md" />
    </LoadingRegion>
  );
}
