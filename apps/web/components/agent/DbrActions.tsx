"use client";

// components/agent/DbrActions.tsx — aksi hasil simulasi DBR (M07, wireframe 01-Agent/M07-Kalkulator-DBR dan M07-Riwayat-DBR): Ekspor PDF (GET /calculator/dbr/{id}/export-pdf), Bagikan (POST .../share membuat
// tautan untuk prospek tanpa login; POST .../revoke-share mencabut seketika) dan Simpan sebagai Prospek (POST .../save-as-prospect; hanya nama dan telepon yang berubah, hasil hitung tetap). Membuat link
// share BARU mengganti tautan lama (token baru), jadi dialog memperingatkan bila tautan sudah aktif. Keadaan berbagi/prospek disimpan lokal dan diteruskan ke pemanggil lewat onChange.
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";
import { prospectLabel, shareState, shareUrl } from "@/lib/agent/dbr-rules";
import type { DbrSimulation } from "@/lib/agent/dbr-types";

type Row = { prospect_name: string | null; prospect_phone: string | null; share_token: string | null; shared_at: string | null; revoked_at: string | null };

function errText(e: unknown, fallback: string) {
  return e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" && e.code !== "NETWORK_ERROR" ? e.message : fallback;
}

const PHONE = /^[0-9+\-\s()]{6,20}$/;

export function DbrActions({ simulation, onChange }: { simulation: DbrSimulation; onChange?: (s: DbrSimulation) => void }) {
  const [sim, setSim] = useState(simulation);
  const [shareOpen, setShareOpen] = useState(false);
  const [prospectOpen, setProspectOpen] = useState(false);
  const [name, setName] = useState(simulation.prospectName ?? "");
  const [phone, setPhone] = useState(simulation.prospectPhone ?? "");
  const [fieldError, setFieldError] = useState<{ name?: string; phone?: string }>({});
  const [busy, setBusy] = useState<"idle" | "share" | "revoke" | "prospect">("idle");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"ya" | "gagal" | null>(null);

  // Origin dibaca setelah hidrasi (bukan saat render) agar HTML server dan klien sama.
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const state = shareState(sim);
  const link = state === "aktif" && sim.shareToken && origin ? shareUrl(origin, sim.shareToken) : null;

  function apply(row: Row) {
    const next = { ...sim, prospectName: row.prospect_name, prospectPhone: row.prospect_phone, shareToken: row.share_token, sharedAt: row.shared_at, revokedAt: row.revoked_at };
    setSim(next);
    onChange?.(next);
  }

  async function share() {
    setBusy("share");
    setError(null);
    setCopied(null);
    try {
      apply((await api.post<Row>(`/calculator/dbr/${sim.id}/share`, undefined, { idempotency: true })).data);
    } catch (e) {
      setError(errText(e, "Link share belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy("idle");
    }
  }

  async function revoke() {
    setBusy("revoke");
    setError(null);
    try {
      apply((await api.post<Row>(`/calculator/dbr/${sim.id}/revoke-share`, undefined, { idempotency: true })).data);
      setShareOpen(false);
    } catch (e) {
      setError(errText(e, "Akses share belum berhasil dicabut. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy("idle");
    }
  }

  async function saveProspect() {
    const errs: { name?: string; phone?: string } = {};
    if (!name.trim()) errs.name = "Isi nama prospek.";
    else if (name.trim().length > 150) errs.name = "Nama paling banyak 150 karakter.";
    if (!PHONE.test(phone.trim())) errs.phone = "Isi nomor telepon 6-20 karakter (angka, +, -, spasi).";
    setFieldError(errs);
    if (errs.name || errs.phone) return;
    setBusy("prospect");
    setError(null);
    try {
      apply((await api.post<Row>(`/calculator/dbr/${sim.id}/save-as-prospect`, { prospect_name: name.trim(), prospect_phone: phone.trim() }, { idempotency: true })).data);
      setProspectOpen(false);
    } catch (e) {
      setError(errText(e, "Prospek belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy("idle");
    }
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied("ya");
    } catch {
      setCopied("gagal");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <a
          href={`/api/calculator/dbr/${sim.id}/export-pdf`}
          className="inline-flex h-11 items-center justify-center rounded-md border-[1.5px] border-blue-600 bg-white px-4 text-label-lg text-blue-600 no-underline hover:bg-blue-50 hover:no-underline"
        >
          Ekspor PDF
        </a>
        <Button
          variant="secondary"
          onClick={() => {
            setError(null);
            setCopied(null);
            setShareOpen(true);
          }}
        >
          {state === "aktif" ? "Kelola Link Share" : "Bagikan"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setError(null);
            setFieldError({});
            setProspectOpen(true);
          }}
        >
          {sim.prospectName ? "Ubah Prospek" : "+ Simpan sebagai Prospek"}
        </Button>
      </div>
      <p className="text-caption">
        Prospek: {prospectLabel(sim.prospectName, sim.prospectPhone)}
        {state === "aktif" ? " · Link share aktif" : state === "dicabut" ? " · Link share dicabut" : ""}
      </p>

      <Dialog
        open={shareOpen}
        onClose={() => (busy === "share" || busy === "revoke" ? undefined : setShareOpen(false))}
        title="Bagikan Hasil Simulasi"
        description="Prospek bisa melihat hasil ini tanpa perlu login. Anda bisa mencabut akses kapan saja."
        footer={
          <>
            {state === "aktif" ? (
              <Button variant="danger" loading={busy === "revoke"} disabled={busy === "share"} onClick={() => void revoke()}>
                Cabut Akses Share
              </Button>
            ) : null}
            <Button variant={state === "aktif" ? "secondary" : "primary"} loading={busy === "share"} disabled={busy === "revoke"} onClick={() => void share()}>
              {state === "aktif" ? "Buat Link Baru" : "Buat Link Share"}
            </Button>
            <Button variant="secondary" disabled={busy !== "idle"} onClick={() => setShareOpen(false)}>
              Tutup
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          {state === "aktif" && link ? (
            <>
              <div className="flex gap-2">
                <input readOnly aria-label="Link share" value={link} onFocus={(e) => e.currentTarget.select()} className="h-11 min-w-0 flex-1 rounded-md border-[1.5px] border-ink-100 bg-ink-50 px-3 text-body-md" />
                <Button variant="secondary" onClick={() => void copy()}>
                  Salin
                </Button>
              </div>
              {copied === "ya" ? <p role="status" className="text-caption text-success-600">Link disalin.</p> : null}
              {copied === "gagal" ? <p role="status" className="text-caption text-warning-600">Belum bisa menyalin otomatis. Pilih link lalu salin manual.</p> : null}
              <p className="text-caption">Membuat link baru mengganti link lama: link yang sudah Anda kirim berhenti berlaku. Halaman berbagi hanya menampilkan hasil, bank, dan plafon; penghasilan, cicilan berjalan, dan nomor telepon tidak ditampilkan.</p>
            </>
          ) : (
            <p className="text-body-md">{state === "dicabut" ? "Akses share simulasi ini sudah dicabut. Buat link baru bila ingin membagikannya lagi." : "Belum ada link share untuk simulasi ini."}</p>
          )}
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={prospectOpen}
        onClose={() => (busy === "prospect" ? undefined : setProspectOpen(false))}
        title="Simpan sebagai Prospek"
        description="Nama dan telepon prospek dilampirkan ke simulasi ini. Hasil perhitungan tidak berubah."
        footer={
          <>
            <Button variant="secondary" disabled={busy === "prospect"} onClick={() => setProspectOpen(false)}>
              Batal
            </Button>
            <Button loading={busy === "prospect"} onClick={() => void saveProspect()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Nama Prospek" required error={fieldError.name}>
            {(a) => <Input maxLength={150} value={name} onChange={(e) => setName(e.target.value)} {...a} />}
          </Field>
          <Field label="Nomor Telepon" required error={fieldError.phone}>
            {(a) => <Input inputMode="tel" maxLength={20} placeholder="0812-3456-7890" value={phone} onChange={(e) => setPhone(e.target.value)} {...a} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
