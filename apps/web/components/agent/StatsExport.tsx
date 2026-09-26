"use client";

// components/agent/StatsExport.tsx — tombol "Export" Statistik Saya (M08): menu Excel/PDF, dialog ringkasan (cakupan, rentang, perbandingan), lalu unduh lewat GET /agents/me/statistics/export. Berkas diambil dengan
// fetch agar galat (izin, batas laju, rentang) tampil di dialog, bukan sebagai halaman JSON. Setiap export dicatat di riwayat aktivitas akun oleh server; berkas hanya berisi data cakupan yang dipilih.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

type Kind = "xlsx" | "pdf";
const LABEL: Record<Kind, string> = { xlsx: "Excel (.xlsx)", pdf: "PDF" };

export function StatsExport({ hrefs, scopeLabel, rangeText, compareText }: { hrefs: Record<Kind, string>; scopeLabel: string; rangeText: string; compareText: string }) {
  const [kind, setKind] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download(k: Kind) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(hrefs[k], { credentials: "same-origin" });
      if (!res.ok) {
        let msg = "Export belum berhasil. Coba lagi beberapa saat lagi.";
        try {
          const body = (await res.json()) as { error?: { message?: string } };
          if (res.status === 401) {
            window.location.assign("/login");
            return;
          }
          if (body.error?.message) msg = body.error.message;
        } catch {
          // badan bukan JSON: pakai pesan umum
        }
        setError(msg);
        return;
      }
      const blob = await res.blob();
      const name = /filename="?([^";]+)"?/i.exec(res.headers.get("Content-Disposition") ?? "")?.[1] ?? `statistik.${k}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setKind(null);
    } catch {
      setError("Export belum berhasil. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <details className="relative">
        <summary className="inline-flex h-11 cursor-pointer list-none items-center gap-2 rounded-md border-[1.5px] border-blue-600 bg-white px-4 text-label-lg text-blue-600 hover:bg-blue-50 [&::-webkit-details-marker]:hidden">Export ▾</summary>
        <div className="absolute right-0 z-20 mt-2 w-72 overflow-hidden rounded-md border border-ink-100 bg-white shadow-3">
          {(["xlsx", "pdf"] as const).map((k) => (
            <button
              key={k}
              type="button"
              className="flex w-full flex-col gap-0.5 px-4 py-3 text-left hover:bg-ink-50"
              onClick={(e) => {
                e.currentTarget.closest("details")?.removeAttribute("open");
                setError(null);
                setKind(k);
              }}
            >
              <span className="text-label-lg">{LABEL[k]}</span>
              <span className="text-caption">{k === "xlsx" ? "Data per hari dan per listing, siap diolah" : "Laporan ringkas dengan grafik, bisa dibagikan"}</span>
            </button>
          ))}
        </div>
      </details>

      <Dialog
        open={kind !== null}
        onClose={() => (busy ? undefined : setKind(null))}
        title={`Export ${kind ? LABEL[kind] : ""}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setKind(null)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => kind && void download(kind)}>
              Unduh {kind ? LABEL[kind] : ""}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
            <dt className="text-caption">Cakupan data</dt>
            <dd className="text-body-md">{scopeLabel}</dd>
            <dt className="text-caption">Rentang</dt>
            <dd className="text-body-md">{rangeText}</dd>
            <dt className="text-caption">Perbandingan</dt>
            <dd className="text-body-md">{compareText}</dd>
          </dl>
          <p className="text-caption">Export hanya berisi data cakupan di atas dan dicatat di riwayat aktivitas akun.</p>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
