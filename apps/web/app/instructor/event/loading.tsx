// app/instructor/event/loading.tsx — keadaan memuat Event Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function InstructorEventsLoading() {
  return (
    <LoadingRegion label="Memuat event…" className="mx-auto flex w-full max-w-[1000px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
