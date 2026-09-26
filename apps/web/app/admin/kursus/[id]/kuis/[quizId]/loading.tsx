// app/admin/kursus/[id]/kuis/[quizId]/loading.tsx — keadaan memuat Editor Kuis.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function QuizEditorLoading() {
  return (
    <LoadingRegion label="Memuat editor kuis…" className="mx-auto flex w-full max-w-[860px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-28 rounded-md" />
      <Skeleton className="h-40 rounded-md" />
    </LoadingRegion>
  );
}
