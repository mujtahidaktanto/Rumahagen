"use client";

// components/admin/CatalogStatusToggle.tsx — "Aktifkan"/"Nonaktifkan" generik untuk Add-on dan Paket Langganan (Superadmin+Admin): PATCH {endpoint}/status { status }.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";

export function CatalogStatusToggle({
  endpoint,
  id,
  name,
  isActive,
  canActivate,
  activateBlockedReason,
  activateDescription,
  deactivateDescription,
}: {
  endpoint: string;
  id: string;
  name: string;
  isActive: boolean;
  canActivate: boolean;
  activateBlockedReason?: string;
  activateDescription: string;
  deactivateDescription: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextStatus = isActive ? "inactive" : "active";

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`${endpoint}/${id}/status`, { status: nextStatus }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {isActive ? (
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
          Nonaktifkan
        </Button>
      ) : (
        <div className="flex flex-col gap-0.5">
          <Button size="sm" disabled={!canActivate} onClick={() => setOpen(true)}>
            Aktifkan
          </Button>
          {!canActivate && activateBlockedReason ? <span className="text-caption text-danger-600">{activateBlockedReason}</span> : null}
        </div>
      )}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={isActive ? `Nonaktifkan "${name}"?` : `Aktifkan "${name}"?`}
        description={isActive ? deactivateDescription : activateDescription}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void confirm()}>
              Lanjutkan
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
