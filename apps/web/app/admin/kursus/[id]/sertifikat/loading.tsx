// app/admin/kursus/[id]/sertifikat/loading.tsx — keadaan memuat Sertifikat Kursus.
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function CourseCertificateLoading() {
  return (
    <LoadingRegion label="Memuat konfigurasi sertifikat…" className="flex w-full flex-col gap-5 p-4 lg:p-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="h-28 rounded-md" />
      <Skeleton className="h-40 rounded-md" />
      <Skeleton className="h-40 rounded-md" />
    </LoadingRegion>
  );
}
