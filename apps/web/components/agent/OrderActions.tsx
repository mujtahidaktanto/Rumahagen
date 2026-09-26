"use client";

// components/agent/OrderActions.tsx — "Bayar Sekarang" dan "Batalkan" untuk pesanan berstatus pending (M14 Pesanan & Kuota). Bayar = POST /commercial/orders/{id}/checkout (percobaan pembayaran baru; Snap
// redirect_url, hanya https milik Midtrans yang diikuti). Batalkan = POST /commercial/orders/{id}/cancel (RPC; hanya pending) setelah konfirmasi. Setelah batal, daftar dimuat ulang dari server.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";
import { safePaymentUrl } from "@/lib/agent/commercial-rules";

function errText(e: unknown, fallback: string) {
  return e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" && e.code !== "NETWORK_ERROR" ? e.message : fallback;
}

export function OrderActions({ orderId, orderNumber }: { orderId: string; orderNumber: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"idle" | "pay" | "cancel">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  async function pay() {
    setBusy("pay");
    setError(null);
    try {
      const res = await api.post<{ redirect_url?: string }>(`/commercial/orders/${orderId}/checkout`, undefined, { idempotency: true });
      const url = safePaymentUrl(res.data.redirect_url);
      if (!url) {
        setError("Alamat pembayaran dari server tidak valid. Coba lagi beberapa saat lagi.");
        setBusy("idle");
        return;
      }
      window.location.assign(url);
    } catch (e) {
      setError(errText(e, "Halaman pembayaran belum bisa dibuka. Periksa koneksi Anda lalu coba lagi."));
      setBusy("idle");
    }
  }

  async function cancel() {
    setBusy("cancel");
    setError(null);
    try {
      await api.post(`/commercial/orders/${orderId}/cancel`, undefined, { idempotency: true });
      setConfirm(false);
      router.refresh();
    } catch (e) {
      setError(errText(e, "Pesanan belum berhasil dibatalkan. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap justify-end gap-2">
        <Button size="sm" loading={busy === "pay"} disabled={busy === "cancel"} onClick={() => void pay()}>
          Bayar Sekarang
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={busy !== "idle"}
          onClick={() => {
            setError(null);
            setConfirm(true);
          }}
        >
          Batalkan
        </Button>
      </div>
      {error && !confirm ? (
        <p role="alert" className="max-w-64 text-right text-caption text-danger-600">
          {error}
        </p>
      ) : null}
      <Dialog
        open={confirm}
        onClose={() => (busy === "cancel" ? undefined : setConfirm(false))}
        title="Batalkan pesanan?"
        description={`Pesanan ${orderNumber} dibatalkan dan tidak bisa dibayar lagi. Anda bisa membuat pesanan baru dari Katalog.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy === "cancel"} onClick={() => setConfirm(false)}>
              Kembali
            </Button>
            <Button variant="danger" loading={busy === "cancel"} onClick={() => void cancel()}>
              Ya, Batalkan
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
