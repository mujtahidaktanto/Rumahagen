"use client";

// components/agent/AddAiConnectionDialog.tsx — "+ Tambah Koneksi" (M13 BYOK): pilih provider dari katalog aktif, isi API key (wajib) dan Identifier Publik/Secondary Key (opsional — provider
// multi-kredensial seperti Cloudinary, migration 0080; katalog ai_providers TIDAK punya kolom penanda provider mana yang butuhnya, jadi kedua bidang selalu ditampilkan opsional untuk semua
// provider, bukan ditebak dari nama/kode provider — lihat audit/FRONTEND_GAPS.md). POST /ai-connections lalu router.refresh() supaya daftar ambil data terbaru dari server.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import type { AiProviderInfo } from "@/lib/agent/ai-data";
import { AI_BILLING_LABEL, toCreateConnectionPayload, validateAddConnection, type AddConnectionErrors } from "@/lib/agent/ai-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

const EMPTY = { providerId: "", apiKey: "", publicIdentifier: "", secondaryKey: "" };

export function AddAiConnectionDialog({ providers, label = "+ Tambah Koneksi" }: { providers: AiProviderInfo[]; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<AddConnectionErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setForm(EMPTY);
    setErrors({});
    setError(null);
  }

  const selected = providers.find((p) => p.id === form.providerId) ?? null;

  async function submit() {
    const errs = validateAddConnection(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/ai-connections", toCreateConnectionPayload(form), { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Koneksi belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        disabled={providers.length === 0}
        title={providers.length === 0 ? "Belum ada provider AI di katalog" : undefined}
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        {label}
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Tambah Koneksi AI"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void submit()}>
              Hubungkan
            </Button>
          </>
        }
      >
        <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto pr-1">
          <div>
            <span className="mb-1.5 block text-label-lg">
              Pilih Provider
              <span className="ml-0.5 text-danger-600" aria-hidden="true">
                *
              </span>
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {providers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, providerId: p.id }))}
                  className={cn("rounded-sm border-[1.5px] p-3 text-left transition-colors", form.providerId === p.id ? "border-blue-600 bg-blue-50" : "border-ink-200 hover:border-blue-300")}
                >
                  <span className="block text-label-lg">{p.displayName}</span>
                  <span className="text-caption">{AI_BILLING_LABEL[p.billingType]}</span>
                </button>
              ))}
            </div>
            {errors.providerId ? (
              <p role="alert" className="mt-1.5 text-caption text-danger-600">
                {errors.providerId}
              </p>
            ) : null}
          </div>

          {selected ? (
            <p className="text-caption">
              {selected.usageTermsNote ? `${selected.usageTermsNote} ` : ""}
              <a href={selected.setupInstructionsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                Cara mendapatkan API key →
              </a>
            </p>
          ) : null}

          <Field label="API Key" required error={errors.apiKey}>
            {(a) => <Input {...a} type="password" autoComplete="off" value={form.apiKey} onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))} placeholder="Tempel API key di sini" />}
          </Field>

          <Field label="Identifier Publik" hint="Opsional — untuk provider yang butuh lebih dari satu kredensial (mis. Cloud Name).">
            {(a) => <Input {...a} value={form.publicIdentifier} onChange={(e) => setForm((f) => ({ ...f, publicIdentifier: e.target.value }))} placeholder="Opsional" />}
          </Field>

          <Field label="Secondary Key" hint="Opsional — untuk provider yang butuh lebih dari satu kredensial (mis. API Secret).">
            {(a) => (
              <Input {...a} type="password" autoComplete="off" value={form.secondaryKey} onChange={(e) => setForm((f) => ({ ...f, secondaryKey: e.target.value }))} placeholder="Opsional" />
            )}
          </Field>

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
