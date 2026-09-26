// app/agent/dbr/riwayat/[id]/not-found.tsx — simulasi tidak ada atau bukan milik pengguna.
import type { Route } from "next";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function DbrNotFound() {
  return (
    <div className="mx-auto w-full max-w-[1200px] p-4 lg:p-8">
      <EmptyState title="Simulasi tidak ditemukan" message="Simulasi ini tidak ada atau bukan milik Anda." />
      <div className="flex justify-center">
        <LinkButton href={"/agent/dbr/riwayat" as Route} variant="secondary" size="sm">
          Kembali ke Riwayat
        </LinkButton>
      </div>
    </div>
  );
}
