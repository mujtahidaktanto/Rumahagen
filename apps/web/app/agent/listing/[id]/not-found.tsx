// app/agent/listing/[id]/not-found.tsx — listing tidak ada atau bukan milik Anda (tidak dibedakan, agar keberadaan listing orang lain tidak bocor).
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function MyListingNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1200px] p-4 py-16 lg:p-8">
      <EmptyState title="Listing tidak ditemukan" message="Tautan salah, atau listing ini bukan milik akun Anda atau sudah dihapus." />
      <div className="flex justify-center">
        <LinkButton href="/agent/listing" size="sm">
          Kembali ke Listing Saya
        </LinkButton>
      </div>
    </div>
  );
}
