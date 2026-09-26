// app/agent/ai/asisten/loading.tsx — keadaan memuat AI Assistant.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AiAssistantLoading() {
  return (
    <LoadingRegion label="Memuat AI Assistant…" className="mx-auto flex w-full max-w-[820px] flex-col gap-4 p-4 lg:p-8">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 rounded-md" />
      <Skeleton className="h-14 rounded-md" />
    </LoadingRegion>
  );
}
