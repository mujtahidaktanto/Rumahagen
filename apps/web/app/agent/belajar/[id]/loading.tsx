// app/agent/belajar/[id]/loading.tsx — keadaan memuat Belajar-Course (bilah atas, daftar materi, area konten).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CourseRunLoading() {
  return (
    <LoadingRegion label="Memuat course…" className="flex min-h-[60dvh] flex-col">
      <Skeleton className="h-16 rounded-none" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row lg:p-8">
        <Skeleton className="h-56 lg:w-72" />
        <div className="flex flex-1 flex-col gap-4">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-8 w-2/3" />
        </div>
      </div>
    </LoadingRegion>
  );
}
