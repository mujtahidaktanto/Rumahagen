"use client";

// components/admin/HeroBannerRowActions.tsx — Ubah (HeroBannerFormDialog) dan Hapus baris Banner Hero Beranda: DELETE /admin/home-hero-banners/{id} dengan
// konfirmasi (gambar di storage ikut dihapus di server, lihat app/api/admin/home-hero-banners/[id]/route.ts).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroBannerFormDialog } from "@/components/admin/HeroBannerFormDialog";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { HeroBannerRow } from "@/lib/admin/content-notif-data";
import { ApiClientError, api } from "@/lib/api-client";

export function HeroBannerRowActions({ banner }: { banner: HeroBannerRow }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/admin/home-hero-banners/${banner.id}`);
      setConfirm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dihapus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-none gap-2">
      <HeroBannerFormDialog banner={banner} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah</Button>} />
      <Button
        variant="ghost"
        size="sm"
        className="text-danger-600"
        onClick={() => {
          setError(null);
          setConfirm(true);
        }}
      >
        Hapus
      </Button>
      <Dialog
        open={confirm}
        onClose={() => (busy ? undefined : setConfirm(false))}
        title="Hapus slide banner?"
        description="Slide ini tidak lagi tampil di blok hero Homepage setelah dihapus."
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
