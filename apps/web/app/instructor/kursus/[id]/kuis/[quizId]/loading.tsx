// app/instructor/kursus/[id]/kuis/[quizId]/loading.tsx — keadaan memuat Editor Kuis.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function QuizEditorLoading() {
  return (
    <LoadingRegion label="Memuat kuis…" className="mx-auto flex w-full max-w-[860px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 rounded-md" />
      <Skeleton className="h-48 rounded-md" />
    </LoadingRegion>
  );
}
