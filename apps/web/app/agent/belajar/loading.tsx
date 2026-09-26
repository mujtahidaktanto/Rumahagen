// app/agent/belajar/loading.tsx — keadaan memuat Pembelajaran (kartu LP, kerangka course, sertifikat, sesi).
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function LearningLoading() {
  return (
    <LoadingRegion label="Memuat pembelajaran…" className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-44" />
      <Skeleton className="h-28 rounded-lg" />
      <Skeleton className="h-64 rounded-md" />
      <Skeleton className="h-40 rounded-md" />
      <Skeleton className="h-32 rounded-md" />
    </LoadingRegion>
  );
}
