// app/agent/kualifikasi/presentasi/loading.tsx — keadaan memuat Presentasi Title.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function TitlePresentationLoading() {
  return (
    <LoadingRegion label="Memuat presentasi title…" className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <div className="flex flex-col gap-5 lg:flex-row">
        <Skeleton className="h-72 flex-1 rounded-md" />
        <Skeleton className="h-56 w-full rounded-md lg:w-[300px]" />
      </div>
    </LoadingRegion>
  );
}
