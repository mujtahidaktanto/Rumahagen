"use client";

// components/agent/SubmitEvidenceDialog.tsx — "Ajukan Bukti Baru" (M15): pilih title/jalur yang dituju (opsional, katalog title_definitions publik), jenis dan sumber bukti, referensi bukti
// (wajib), catatan opsional. POST /qualification-evidence lalu router.refresh(). source_type dibatasi upload/external_link — trigger 0128 menolak nilai lain untuk pengguna biasa.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { TitleOption } from "@/lib/agent/qualification-data";
import { EVIDENCE_TYPE_OPTIONS, SOURCE_TYPE_OPTIONS, toCreateEvidencePayload, validateSubmitEvidence, type SubmitEvidenceErrors, type SubmitEvidenceForm } from "@/lib/agent/qualification-rules";
import { ApiClientError, api } from "@/lib/api-client";

const EMPTY: SubmitEvidenceForm = { titleDefinitionId: "", evidenceType: EVIDENCE_TYPE_OPTIONS[0]!, sourceType: "upload", sourceReference: "", note: "" };

export function SubmitEvidenceDialog({ userId, titles, label = "+ Ajukan Bukti Baru" }: { userId: string; titles: TitleOption[]; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<SubmitEvidenceForm>(EMPTY);
  const [errors, setErrors] = useState<SubmitEvidenceErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function reset() {
    setForm(EMPTY);
    setErrors({});
    setError(null);
    setSubmitted(false);
  }

  async function submit() {
    const errs = validateSubmitEvidence(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      const titleName = titles.find((t) => t.id === form.titleDefinitionId)?.name ?? null;
      await api.post("/qualification-evidence", toCreateEvidencePayload(userId, form, titleName), { idempotency: true });
      setSubmitted(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Bukti belum berhasil diajukan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
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
        title="Ajukan Bukti Kualifikasi"
        footer={
          submitted ? (
            <Button onClick={() => setOpen(false)}>Tutup</Button>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button loading={busy} onClick={() => void submit()}>
                Ajukan Bukti
              </Button>
            </>
          )
        }
      >
        {submitted ? (
          <p className="text-body-md">Bukti terkirim. Status: Menunggu Evaluasi. Anda mendapat notifikasi saat tim RumahAgen atau sistem memutuskan.</p>
        ) : (
          <div className="flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto pr-1">
            <Field label="Title / jalur yang dituju" hint="Opsional — membantu tim RumahAgen memproses bukti Anda.">
              {(a) => (
                <Select {...a} value={form.titleDefinitionId} onChange={(e) => setForm((f) => ({ ...f, titleDefinitionId: e.target.value }))}>
                  <option value="">Tidak spesifik</option>
                  {titles.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Jenis bukti">
                {(a) => (
                  <Select {...a} value={form.evidenceType} onChange={(e) => setForm((f) => ({ ...f, evidenceType: e.target.value }))}>
                    {EVIDENCE_TYPE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Sumber">
                {(a) => (
                  <Select {...a} value={form.sourceType} onChange={(e) => setForm((f) => ({ ...f, sourceType: e.target.value as SubmitEvidenceForm["sourceType"] }))}>
                    {SOURCE_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Field label="Referensi / tautan bukti" required error={errors.sourceReference}>
              {(a) => (
                <Input
                  {...a}
                  value={form.sourceReference}
                  onChange={(e) => setForm((f) => ({ ...f, sourceReference: e.target.value }))}
                  placeholder="URL, nomor dokumen, atau referensi lain"
                />
              )}
            </Field>
            <Field label="Catatan tambahan" hint="Opsional — konteks tambahan untuk membantu proses evaluasi.">
              {(a) => <Textarea {...a} rows={3} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Konteks tambahan…" />}
            </Field>
            <p className="text-caption">Bukti dari pembelajaran RumahAgen tidak diajukan di sini: tercatat otomatis saat Anda menyelesaikan sesi.</p>
            {error ? (
              <p role="alert" className="text-body-md text-danger-600">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </Dialog>
    </>
  );
}
