"use client";

// components/agent/OrgLeaveButton.tsx — "Keluar dari Organisasi" untuk anggota biasa (M12): dialog konfirmasi lalu DELETE /organization-members/{id} (keanggotaan sendiri = left). Leader tidak keluar sendiri
// (keluarnya leader menutup organisasi); mereka memakai alur Tutup Organisasi.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";

export function OrgLeaveButton({ membershipId, orgName }: { membershipId: string; orgName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/organization-members/${membershipId}`, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil keluar. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="border-danger-600 text-danger-600"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Keluar dari Organisasi
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Keluar dari organisasi?"
        description={`Anda tidak lagi menjadi anggota "${orgName}". Listing Anda tetap milik Anda. Anda bisa bergabung lagi bila diundang atau diterima leader.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void leave()}>
              Ya, Keluar
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
    </>
  );
}
