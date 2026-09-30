// app/instructor/kursus/[id]/loading.tsx — keadaan memuat Detail Kursus.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CourseDetailLoading() {
  return (
    <LoadingRegion label="Memuat kursus…" className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
