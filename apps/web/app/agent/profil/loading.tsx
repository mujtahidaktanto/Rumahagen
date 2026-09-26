// app/agent/profil/loading.tsx — keadaan memuat Profil Saya.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function AgentProfileLoading() {
  return (
    <LoadingRegion label="Memuat profil…" className="mx-auto w-full max-w-[1200px] p-4 lg:p-8">
      <Skeleton className="mb-5 h-8 w-40" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-32 rounded-md" />
          <Skeleton className="h-64 rounded-md" />
          <Skeleton className="h-72 rounded-md" />
        </div>
        <Skeleton className="h-56 rounded-md" />
      </div>
    </LoadingRegion>
  );
}
