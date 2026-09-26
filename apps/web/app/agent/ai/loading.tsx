// app/agent/ai/loading.tsx — keadaan memuat Koneksi AI Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AiConnectionsLoading() {
  return (
    <LoadingRegion label="Memuat koneksi AI…" className="mx-auto flex w-full max-w-[920px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-56 rounded-md" />
    </LoadingRegion>
  );
}
