"use client";

// components/agent/ClaimActions.tsx — aksi per klaim proyek (M06, wireframe 01-Agent/M06-Klaim-Proyek): "Batalkan Klaim" (PUT /claims/{id} status=withdrawn; hanya pending; status akhir, tidak bisa diajukan
// ulang lewat aplikasi), "Buat Listing dari Proyek" (POST /listings/from-project/{project_id} dengan nomor WhatsApp wajib; hasilnya draf milik Agent, terbit terpisah) dan "Lihat Marketing Kit"
// (GET /developer-projects/{id}/marketing-kit, dimuat saat dibuka; unduhan hanya tautan https).
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { ApiClientError, api, newIdempotencyKey } from "@/lib/api-client";
import { approvalPdfHref, canCreateListing, canOpenApprovalPdf, canWithdraw, kitTypeLabel, safeKitUrl, validateWhatsapp } from "@/lib/agent/claim-rules";
import type { ClaimItem } from "@/lib/agent/claim-data";

type Kit = { id: string; file_name: string; file_type: string; download_url?: string | null; file_url?: string | null };

function errText(e: unknown, fallback: string) {
  return e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" && e.code !== "NETWORK_ERROR" ? e.message : fallback;
}

export function ClaimActions({ claim, defaultWhatsapp }: { claim: ClaimItem; defaultWhatsapp: string }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<null | "withdraw" | "listing">(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wa, setWa] = useState(defaultWhatsapp);
  const [waError, setWaError] = useState<string | null>(null);
  const [kitOpen, setKitOpen] = useState(false);
  const [kit, setKit] = useState<"memuat" | "gagal" | Kit[]>("memuat");
  const [listingKey] = useState(() => newIdempotencyKey());

  async function withdraw() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/claims/${claim.id}`, { status: "withdrawn" }, { idempotency: true });
      setDialog(null);
      router.refresh();
    } catch (e) {
      setError(errText(e, "Klaim belum berhasil dibatalkan. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy(false);
    }
  }

  async function createListing() {
    const problem = validateWhatsapp(wa);
    setWaError(problem);
    if (problem) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ id: string }>(`/listings/from-project/${claim.projectId}`, { whatsapp_number: wa.trim() }, { idempotency: listingKey });
      setDialog(null);
      router.push(`/agent/listing/${res.data.id}` as Route);
    } catch (e) {
      setError(errText(e, "Draf listing belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy(false);
    }
  }

  async function toggleKit() {
    const next = !kitOpen;
    setKitOpen(next);
    if (next && kit === "memuat") {
      try {
        setKit((await api.get<Kit[]>(`/developer-projects/${claim.projectId}/marketing-kit`)).data);
      } catch {
        setKit("gagal");
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {canCreateListing(claim.status, claim.listing !== null) ? (
          <Button
            size="sm"
            onClick={() => {
              setError(null);
              setWaError(null);
              setDialog("listing");
            }}
          >
            Buat Listing dari Proyek
          </Button>
        ) : null}
        {claim.listing ? (
          <Link href={`/agent/listing/${claim.listing.id}` as Route} className="inline-flex h-9 items-center rounded-md border-[1.5px] border-blue-600 px-3 text-label-lg text-blue-600 no-underline hover:bg-blue-50 hover:no-underline">
            Draft listing dibuat — Lihat Listing
          </Link>
        ) : null}
        {canOpenApprovalPdf(claim.status) ? (
          <a href={approvalPdfHref(claim.id)} target="_blank" rel="noopener" className="inline-flex h-9 items-center rounded-md border-[1.5px] border-ink-100 px-3 text-label-lg text-ink-700 no-underline hover:border-blue-500 hover:no-underline">
            Approval PDF
          </a>
        ) : null}
        <Button size="sm" variant="secondary" aria-expanded={kitOpen} onClick={() => void toggleKit()}>
          {kitOpen ? "Sembunyikan Kit" : "Lihat Marketing Kit"}
        </Button>
        {canWithdraw(claim.status) ? (
          <Button
            size="sm"
            variant="ghost"
            className="text-danger-600"
            onClick={() => {
              setError(null);
              setDialog("withdraw");
            }}
          >
            Batalkan Klaim
          </Button>
        ) : null}
      </div>

      {kitOpen ? (
        <div className="rounded-sm bg-ink-50 p-3">
          {kit === "memuat" ? (
            <p role="status" className="text-caption">
              Memuat marketing kit…
            </p>
          ) : kit === "gagal" ? (
            <p role="alert" className="text-caption text-danger-600">
              Marketing kit gagal dimuat. Tutup lalu buka lagi untuk mencoba ulang.
            </p>
          ) : kit.length === 0 ? (
            <p className="text-caption">Developer belum mengunggah marketing kit untuk proyek ini.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {kit.map((k) => {
                const url = safeKitUrl(k.download_url ?? k.file_url);
                return (
                  <li key={k.id} className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 text-body-md break-words">
                      {k.file_name} <span className="text-caption">· {kitTypeLabel(k.file_type)}</span>
                    </span>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-label-lg text-blue-600">
                        Unduh
                      </a>
                    ) : (
                      <span className="text-caption">Tautan tidak tersedia</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      <Dialog
        open={dialog === "withdraw"}
        onClose={() => (busy ? undefined : setDialog(null))}
        title="Batalkan Klaim?"
        description={`Anda akan membatalkan klaim atas "${claim.projectName}". Pembatalan bersifat final: klaim yang ditarik tidak bisa diajukan lagi dari aplikasi; hubungi tim RumahAgen bila ingin mengajukan kembali.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void withdraw()}>
              Ya, Batalkan Klaim
            </Button>
          </>
        }
      >
        {error && dialog === "withdraw" ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={dialog === "listing"}
        onClose={() => (busy ? undefined : setDialog(null))}
        title="Buat Listing dari Proyek"
        description={`Draft listing dibuat dari data resmi "${claim.projectName}" (harga awal, spesifikasi, dan media). Listing menjadi milik Anda dan berstatus draft: terbitkan terpisah dari Listing Saya. Perubahan Anda tidak mengubah proyek developer.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDialog(null)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void createListing()}>
              Buat Draft Listing
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Nomor WhatsApp listing" required error={waError ?? undefined}>
            {(a) => <Input inputMode="tel" maxLength={20} placeholder="0812-3456-7890" value={wa} onChange={(e) => setWa(e.target.value)} {...a} />}
          </Field>
          {error && dialog === "listing" ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
