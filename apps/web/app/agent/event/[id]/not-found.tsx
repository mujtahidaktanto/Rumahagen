// app/agent/event/[id]/not-found.tsx — event tidak ada atau bukan milik Anda (tidak dibedakan).
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function ManageEventNotFound() {
  return (
    <div className="mx-auto w-full max-w-[720px] p-4 py-16 lg:p-8">
      <EmptyState title="Event tidak ditemukan" message="Tautan salah, atau event ini bukan milik akun Anda atau sudah dihapus." />
      <div className="flex justify-center">
        <LinkButton href="/agent/event" size="sm">
          Kembali ke Event Saya
        </LinkButton>
      </div>
    </div>
  );
}
