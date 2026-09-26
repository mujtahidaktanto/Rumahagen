// app/admin/kursus/loading.tsx — keadaan memuat Kelola Kursus.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CoursesLoading() {
  return (
    <LoadingRegion label="Memuat kursus…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
