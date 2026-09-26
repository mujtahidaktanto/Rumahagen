"use client";

// components/notifications/NotificationControls.tsx — aksi Pusat Notifikasi (M08): "Tandai semua dibaca" (PUT /notifications/read-all), dan per baris "Buka" (tandai dibaca lalu ke tujuan), "Tandai dibaca"
// (PUT /notifications/{id}/read), "Sembunyikan" (PUT /notifications/{id}/dismiss; tidak bisa dibatalkan lewat API, jadi diberi konfirmasi singkat). Setelah berhasil daftar dimuat ulang dari server. Galat
// ditampilkan di tempat, tanpa mengubah daftar.
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { api } from "@/lib/api-client";

export function MarkAllReadButton({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="secondary"
        size="sm"
        loading={busy}
        disabled={disabled}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            await api.put("/notifications/read-all");
            router.refresh();
          } catch {
            setError("Belum bisa menandai semua dibaca. Coba lagi.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Tandai semua dibaca
      </Button>
      {error ? (
        <p role="alert" className="text-caption text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function NotificationRowActions({ id, isRead, href, dismissed }: { id: string; isRead: boolean; href: string | null; dismissed: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"idle" | "open" | "read" | "dismiss">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function run(kind: "open" | "read" | "dismiss") {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "dismiss") await api.put(`/notifications/${id}/dismiss`);
      else if (!isRead) await api.put(`/notifications/${id}/read`);
      if (kind === "open" && href) {
        router.push(href as Route);
        return;
      }
      setConfirm(false);
      router.refresh();
    } catch {
      setError(kind === "dismiss" ? "Belum bisa menyembunyikan. Coba lagi." : "Belum bisa menandai dibaca. Coba lagi.");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1.5">
        {href ? (
          <Button size="sm" loading={busy === "open"} disabled={busy !== "idle" && busy !== "open"} onClick={() => void run("open")}>
            Buka
          </Button>
        ) : null}
        {!isRead ? (
          <Button size="sm" variant="secondary" loading={busy === "read"} disabled={busy !== "idle" && busy !== "read"} onClick={() => void run("read")}>
            Tandai dibaca
          </Button>
        ) : null}
        {!dismissed ? (
          <Button size="sm" variant="ghost" disabled={busy !== "idle"} onClick={() => setConfirm(true)}>
            Sembunyikan
          </Button>
        ) : null}
      </div>
      {error && !confirm ? (
        <p role="alert" className="max-w-56 text-right text-caption text-danger-600">
          {error}
        </p>
      ) : null}
      <Dialog
        open={confirm}
        onClose={() => (busy === "dismiss" ? undefined : setConfirm(false))}
        title="Sembunyikan notifikasi?"
        description="Notifikasi tidak lagi tampil di daftar. Anda masih bisa melihatnya lewat 'Tampilkan yang disembunyikan', tetapi tidak bisa dikembalikan ke daftar."
        footer={
          <>
            <Button variant="secondary" disabled={busy === "dismiss"} onClick={() => setConfirm(false)}>
              Batal
            </Button>
            <Button loading={busy === "dismiss"} onClick={() => void run("dismiss")}>
              Sembunyikan
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
