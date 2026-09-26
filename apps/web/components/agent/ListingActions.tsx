"use client";

// components/agent/ListingActions.tsx — aksi Detail Listing Agent (M03 Listing-Detail): Terbitkan (draft -> published, memakai kuota), Tandai Terjual/Tersewa, Hapus, dan kartu Refresh Listing.
// Semua lewat /api dengan Idempotency-Key (status: PATCH /listings/{id}/status; hapus: DELETE /listings/{id}; refresh: POST /listings/{id}/refresh). Aksi yang mengubah status
// meminta konfirmasi. Server tetap penentu aturan (kuota, lifecycle, izin); pesan galatnya ditampilkan apa adanya.
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";
import { publishErrorMessage, type DetailActions, type RefreshState } from "@/lib/agent/listing-rules";

type Confirm = null | "sold" | "rented" | "delete" | "publish";

export function ListingActions({ id, title, actions }: { id: string; title: string; actions: DetailActions }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: Exclude<Confirm, null>) {
    setBusy(true);
    setError(null);
    try {
      if (kind === "delete") {
        await api.delete(`/listings/${id}`);
        router.push("/agent/listing" as Route);
        router.refresh();
        return;
      }
      const status = kind === "publish" ? "published" : kind;
      await api.patch(`/listings/${id}/status`, { status }, { idempotency: true });
      setConfirm(null);
      router.refresh();
    } catch (err) {
      setError(kind === "publish" ? publishErrorMessage(err instanceof ApiClientError ? err : null) : err instanceof ApiClientError ? err.message : "Terjadi gangguan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const copy: Record<Exclude<Confirm, null>, { title: string; text: string; ok: string; danger?: boolean }> = {
    publish: { title: "Terbitkan listing?", text: "Listing langsung tayang publik dan memakai 1 jatah kuota penerbitan (Gratis → Pro → Slot beli).", ok: "Terbitkan" },
    sold: { title: "Tandai terjual?", text: "Listing tidak lagi tampil di pencarian publik. Tindakan ini tercatat sebagai penjualan pada statistik Anda.", ok: "Tandai Terjual" },
    rented: { title: "Tandai tersewa?", text: "Listing tidak lagi tampil di pencarian publik. Tindakan ini tercatat sebagai penyewaan pada statistik Anda.", ok: "Tandai Tersewa" },
    delete: { title: "Hapus listing ini?", text: `“${title}” dihapus permanen beserta foto dan datanya. Tindakan ini tidak bisa dibatalkan.`, ok: "Hapus Permanen", danger: true },
  };
  const c = confirm ? copy[confirm] : null;

  return (
    <>
      <div className="flex flex-wrap gap-2.5">
        {actions.publish ? <Button onClick={() => setConfirm("publish")}>Lanjutkan & Terbitkan</Button> : null}
        {actions.resubmit ? (
          <LinkButton href={`/agent/listing/${id}/edit` as Route}>Perbaiki & Ajukan Ulang →</LinkButton>
        ) : null}
        {actions.edit ? (
          <LinkButton href={`/agent/listing/${id}/edit` as Route} variant="secondary">
            Edit Listing
          </LinkButton>
        ) : null}
        {actions.markSold ? (
          <Button variant="secondary" onClick={() => setConfirm("sold")}>
            Tandai Terjual
          </Button>
        ) : null}
        {actions.markRented ? (
          <Button variant="secondary" onClick={() => setConfirm("rented")}>
            Tandai Tersewa
          </Button>
        ) : null}
        {actions.duplicate ? (
          <LinkButton href={`/agent/listing/baru?salin=${id}` as Route} variant="secondary">
            Duplikat Listing
          </LinkButton>
        ) : null}
        {actions.remove ? (
          <Button variant="ghost" className="text-danger-600" onClick={() => setConfirm("delete")}>
            Hapus Listing
          </Button>
        ) : null}
      </div>

      <Dialog
        open={confirm !== null}
        onClose={() => {
          if (!busy) {
            setConfirm(null);
            setError(null);
          }
        }}
        title={c?.title ?? ""}
        description={c?.text}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setConfirm(null)}>
              Batal
            </Button>
            <Button variant={c?.danger ? "danger" : "primary"} loading={busy} onClick={() => confirm && run(confirm)}>
              {c?.ok}
            </Button>
          </>
        }
      >
        {error ? (
          <p role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3 text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </>
  );
}

/** Kartu "Refresh Listing": naikkan listing ke atas hasil pencarian (kuota harian agen, maksimal 1x per listing per hari). */
export function RefreshCard({ id, state, used, allowance, defaultDaily, extraDaily, stockRemaining, lastRefreshedAt }: { id: string; state: RefreshState; used: number | null; allowance: number | null; defaultDaily?: number | null; extraDaily?: number | null; stockRemaining?: number | null; lastRefreshedAt: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function refresh() {
    setBusy(true);
    setMsg(null);
    try {
      await api.post(`/listings/${id}/refresh`, undefined, { idempotency: true });
      setMsg({ kind: "ok", text: "Listing di-refresh dan naik ke atas hasil pencarian." });
      router.refresh();
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof ApiClientError ? refreshReason(err.message) : "Gagal me-refresh listing. Coba lagi." });
    } finally {
      setBusy(false);
    }
  }

  const disabled = state === "sudah_hari_ini" || state === "kuota_habis" || state === "tanpa_jatah" || state === "tidak_tersedia";
  return (
    <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
      <h2 className="text-title-md">Refresh Listing</h2>
      {allowance !== null && used !== null ? (
        <div className="flex justify-between gap-3">
          <span className="text-body-md">Kuota hari ini</span>
          <span className="text-body-md font-bold">
            {used}/{allowance}
          </span>
        </div>
      ) : null}
      {extraDaily && extraDaily > 0 && defaultDaily != null ? (
        <p className="text-caption">
          Jatah gratis {defaultDaily} + tambahan {extraDaily} per hari.
        </p>
      ) : null}
      {stockRemaining != null && stockRemaining > 0 ? (
        <div className="flex justify-between gap-3">
          <span className="text-body-md">Saldo paket refresh</span>
          <span className="text-body-md font-bold">{stockRemaining}</span>
        </div>
      ) : null}
      <p className="text-caption">
        Jatah harian (gratis, lalu bonus) reset otomatis 00.00 WIB dan tidak terbawa ke hari berikutnya.
        {stockRemaining != null && stockRemaining > 0 ? " Saldo paket dari pembelian tidak hangus dan tidak reset; dipakai setelah jatah harian habis." : ""} Maks 1× sukses per listing per hari.
      </p>
      {state === "tanpa_jatah" ? <p className="text-body-md text-ink-500">Akun Anda belum memiliki jatah refresh harian. Hubungi tim RumahAgen bila seharusnya ada.</p> : null}
      {state === "tidak_tersedia" ? <p className="text-body-md text-ink-500">Refresh hanya tersedia untuk listing yang sedang tayang (published).</p> : null}
      <Button loading={busy} disabled={disabled} onClick={refresh} className="w-full">
        {state === "sudah_hari_ini" ? "Sudah Di-refresh Hari Ini" : state === "kuota_habis" ? "Kuota Refresh Harian Habis" : state === "tanpa_jatah" ? "Belum Ada Jatah Refresh" : "Refresh Sekarang"}
      </Button>
      {msg ? (
        <p role={msg.kind === "err" ? "alert" : "status"} className={msg.kind === "err" ? "text-caption text-danger-600" : "text-caption text-success-600"}>
          {msg.text}
        </p>
      ) : null}
      {lastRefreshedAt ? <p className="text-caption">Terakhir di-refresh: {formatDateTime(lastRefreshedAt)}</p> : null}
    </div>
  );
}

function refreshReason(reason: string): string {
  if (reason === "listing_already_refreshed_today") return "Listing ini sudah di-refresh hari ini.";
  if (reason === "agent_daily_quota_exhausted") return "Kuota refresh harian habis. Jatah kembali 00.00 WIB.";
  if (reason === "agent_refresh_allowance_none") return "Akun Anda belum memiliki jatah refresh harian. Hubungi tim RumahAgen bila seharusnya ada.";
  if (reason === "listing_not_published") return "Hanya listing yang tayang yang bisa di-refresh.";
  return reason;
}
