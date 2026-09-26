// app/(publik)/dbr/shared/[token]/not-found.tsx — tautan simulasi DBR tidak valid atau sudah dicabut agen.
import { EmptyState } from "@/components/ui/States";

export default function SharedDbrNotFound() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-12">
      <EmptyState title="Tautan tidak berlaku" message="Tautan simulasi ini tidak valid atau aksesnya sudah dicabut oleh agen. Hubungi agen Anda untuk tautan terbaru." />
    </div>
  );
}
