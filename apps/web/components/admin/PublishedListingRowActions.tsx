"use client";

// components/admin/PublishedListingRowActions.tsx — "Suspend"/"Aktifkan Kembali" di tab Listing Terbit & Suspend (Moderasi Listing): PATCH /listings/{id}/status { status }. Suspend hanya
// butuh m03.listing.suspend (ketiga role staf lolos). Reaktivasi (suspended->published) butuh KEDUA m03.listing.suspend DAN m03.listing.publish (trigger enforce_listing_lifecycle_rules
// mengecek dua IF block terpisah untuk transisi ini) — Manager tidak punya m03.listing.publish, jadi tombolnya tetap tampil transparan dengan catatan peringatan yang sama seperti Setujui.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";

export function PublishedListingRowActions({ listingId, title, status, canReactivate }: { listingId: string; title: string; status: "published" | "suspended"; canReactivate: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm(nextStatus: "suspended" | "published") {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/listings/${listingId}/status`, { status: nextStatus }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil diproses. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "published") {
    return (
      <>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
        >
          Suspend
        </Button>
        <Dialog
          open={open}
          onClose={() => (busy ? undefined : setOpen(false))}
          title={`Suspend "${title}"?`}
          description="Seluruh listing ditangguhkan (bukan per foto): langsung hilang dari publik dan pemilik tidak bisa mengaktifkannya kembali. Pakai bila foto atau isi listing melanggar ketentuan platform. Hanya staf yang dapat mengaktifkannya kembali."
          footer={
            <>
              <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button variant="danger" loading={busy} onClick={() => void confirm("suspended")}>
                Suspend Listing
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

  return (
    <div className="flex flex-col gap-1">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        Aktifkan Kembali
      </Button>
      {!canReactivate ? <span className="text-caption text-danger-600">Role Anda punya izin suspend tapi tidak publish — Aktifkan Kembali akan gagal 403.</span> : null}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Aktifkan kembali "${title}"?`}
        description="Listing kembali tampil di publik. Pastikan pelanggaran sudah diperbaiki pemiliknya."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void confirm("published")}>
              Aktifkan Kembali
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
