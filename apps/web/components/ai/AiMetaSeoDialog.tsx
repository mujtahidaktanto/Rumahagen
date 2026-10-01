"use client";

// components/ai/AiMetaSeoDialog.tsx — tombol + dialog "Generate MetaSEO" (docs/ai-description-rules.md),
// TERPISAH dari AiDescriptionDialog: input deskripsi SAAT INI di form (bukan data properti penuh
// ulang), biaya kecil, tanpa riset kawasan baru. Sama seperti AiDescriptionDialog, tidak tahu bentuk
// state form pemanggil -- `buildFields()`/`onApply` menjembatani.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SparkleIcon } from "@/components/ui/icons";
import { ApiClientError, api } from "@/lib/api-client";

type GenerateMetaSeoData = { ok: true; meta_title: string; meta_description: string; warnings: string[] } | { ok: false; error: { kind: string; message: string } };

type Props = {
  entityType: "listing" | "developer_project";
  entityId: string | null;
  /** Payload sesuai generateDescriptionFieldsSchema (tanpa description -- dikirim terpisah lewat current_description). */
  buildFields: () => Record<string, unknown>;
  currentDescription: string;
  onApply: (result: { metaTitle: string; metaDescription: string }) => void;
  disabled?: boolean;
};

export function AiMetaSeoDialog({ entityType, entityId, buildFields, currentDescription, onApply, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<GenerateMetaSeoData, { ok: true }> | null>(null);

  function openDialog() {
    setError(null);
    setResult(null);
    setOpen(true);
    void generate();
  }

  async function generate() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post<GenerateMetaSeoData>("/ai/generate-meta-seo", {
        entity_type: entityType,
        entity_id: entityId,
        fields: buildFields(),
        current_description: currentDescription || undefined,
      });
      if (!res.data.ok) {
        setError(res.data.error.message);
        return;
      }
      setResult(res.data);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Terjadi kesalahan tak terduga.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={openDialog}>
        <SparkleIcon size={16} /> Generate MetaSEO
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Generate MetaSEO (AI)"
        description="Dibuat dari deskripsi listing saat ini. Periksa dulu sebelum dipakai."
        footer={
          <>
            <Button variant="secondary" size="sm" disabled={busy} onClick={() => setOpen(false)}>
              {result ? "Tutup" : "Batal"}
            </Button>
            {result ? (
              <>
                <Button variant="secondary" size="sm" disabled={busy} onClick={() => void generate()}>
                  Buat Ulang
                </Button>
                <Button size="sm" onClick={() => (onApply({ metaTitle: result.meta_title, metaDescription: result.meta_description }), setOpen(false))}>
                  Pakai
                </Button>
              </>
            ) : !error ? (
              <Button size="sm" loading={busy} onClick={() => void generate()}>
                Buat Draf
              </Button>
            ) : (
              <Button size="sm" loading={busy} onClick={() => void generate()}>
                Coba Lagi
              </Button>
            )}
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          {busy && !result ? <p className="text-body-md text-ink-500">Membuat draf…</p> : null}
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
          {result ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-label-lg">Meta Title ({result.meta_title.length}/70)</p>
                <p className="rounded-md border border-ink-100 bg-ink-50 p-3 text-body-md text-ink-900">{result.meta_title}</p>
              </div>
              <div>
                <p className="text-label-lg">Meta Description ({result.meta_description.length}/160)</p>
                <p className="rounded-md border border-ink-100 bg-ink-50 p-3 text-body-md text-ink-900">{result.meta_description}</p>
              </div>
              {result.warnings.length > 0 ? (
                <ul className="flex flex-col gap-1 text-caption text-warning-600">
                  {result.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
