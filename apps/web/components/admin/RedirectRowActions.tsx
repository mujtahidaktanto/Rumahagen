"use client";

// components/admin/RedirectRowActions.tsx — Ubah/Hapus baris Pengalihan URL: PUT (lewat RedirectFormDialog) dan DELETE /url-redirects/{id} dengan konfirmasi.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RedirectFormDialog } from "@/components/admin/RedirectFormDialog";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { RedirectRow } from "@/lib/admin/url-redirect-data";
import { ApiClientError, api } from "@/lib/api-client";

export function RedirectRowActions({ redirect }: { redirect: RedirectRow }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/url-redirects/${redirect.id}`, { idempotency: true });
      setConfirm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dihapus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2">
      <RedirectFormDialog redirect={redirect} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah</Button>} />
      <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => { setError(null); setConfirm(true); }}>
        Hapus
      </Button>
      <Dialog
        open={confirm}
        onClose={() => (busy ? undefined : setConfirm(false))}
        title="Hapus pengalihan URL?"
        description={`Pengunjung yang membuka "${redirect.oldPath}" tidak lagi diarahkan ke "${redirect.newPath}" setelah dihapus.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setConfirm(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void del()}>
              Ya, Hapus
            </Button>
          </>
        }
      >
        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
