// app/instructor/kursus/loading.tsx — keadaan memuat Kursus Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function MyCoursesLoading() {
  return (
    <LoadingRegion label="Memuat kursus…" className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-96 rounded-md" />
    </LoadingRegion>
  );
}
