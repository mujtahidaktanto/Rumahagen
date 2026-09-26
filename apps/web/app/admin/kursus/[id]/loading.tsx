// app/admin/kursus/[id]/loading.tsx — keadaan memuat Detail Kursus.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CourseDetailLoading() {
  return (
    <LoadingRegion label="Memuat detail kursus…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-28 rounded-md" />
      <Skeleton className="h-64 rounded-md" />
    </LoadingRegion>
  );
}
