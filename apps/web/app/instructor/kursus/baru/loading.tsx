// app/instructor/kursus/baru/loading.tsx — keadaan memuat Buat Kursus.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function NewCourseLoading() {
  return (
    <LoadingRegion label="Memuat…" className="mx-auto w-full max-w-[600px] p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-4 h-80 rounded-md" />
    </LoadingRegion>
  );
}
