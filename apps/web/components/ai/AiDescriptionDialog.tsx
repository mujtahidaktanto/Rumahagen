"use client";

// components/ai/AiDescriptionDialog.tsx — tombol + dialog "Bantu tulis deskripsi (AI)"
// (docs/ai-description-rules.md), dipakai ListingWizard (agen) dan ProjectFormView (developer).
// Komponen ini TIDAK tahu bentuk state form pemanggil -- `buildFields()` membangun payload sesuai
// generateDescriptionFieldsSchema (lib/validation/ai-generate.ts), `onApply`/`onApplySuggestion`
// menulis hasil balik ke state pemanggil. Hasil generate TIDAK PERNAH disimpan otomatis -- pengguna
// menekan "Pakai Deskripsi" dulu, baru field form terisi (form tetap perlu disimpan seperti biasa).
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { SparkleIcon } from "@/components/ui/icons";
import { ApiClientError, api } from "@/lib/api-client";
import { CERTIFICATE_LABEL, FURNISHING_LABEL, IMB_LABEL, WATER_LABEL } from "@/lib/public/listing-labels";
import { PROPERTY_TYPE_LABEL, type PropertyType } from "@/lib/public/listing-params";

type FieldSuggestion = { field: string; nilai: unknown; jenis: "isi_kosong" | "konflik"; bukti: string; keyakinan: "tinggi" | "sedang" | "rendah" };
type GenerateDescriptionData = {
  ok: true;
  judul_saran: string | null;
  deskripsi: string;
  poin_unggulan: string[];
  poin_area: { id: string; teks: string }[];
  saran_field: FieldSuggestion[];
  catatan_verifikasi: string[];
  usage: { remaining_today: number | null };
} | { ok: false; error: { kind: string; message: string } };

const FIELD_LABEL: Record<string, string> = {
  bedrooms: "Kamar tidur",
  bathrooms: "Kamar mandi",
  floors: "Jumlah lantai",
  carport_capacity: "Carport",
  land_area: "Luas tanah (m²)",
  building_area: "Luas bangunan (m²)",
  electrical_power: "Daya listrik (VA)",
  year_built: "Tahun dibangun",
  property_type: "Tipe properti",
  transaction_type: "Jenis transaksi",
  certificate_type: "Sertifikat",
  certificate_transferred: "Sertifikat sudah balik nama",
  imb_status: "IMB/PBG",
  water_source: "Sumber air",
  furnishing: "Furnishing",
  district_id: "Kecamatan",
};
const ENUM_LABEL: Record<string, Record<string, string>> = {
  property_type: PROPERTY_TYPE_LABEL,
  certificate_type: CERTIFICATE_LABEL,
  water_source: WATER_LABEL,
  furnishing: FURNISHING_LABEL,
  imb_status: IMB_LABEL,
  transaction_type: { sale: "Dijual", rent: "Disewakan" },
};
const KEYAKINAN_TONE = { tinggi: "success", sedang: "warning", rendah: "neutral" } as const;

function suggestionValueLabel(field: string, nilai: unknown): string {
  if (typeof nilai === "boolean") return nilai ? "Ya" : "Tidak";
  if (field === "property_type") return PROPERTY_TYPE_LABEL[nilai as PropertyType] ?? String(nilai);
  const map = ENUM_LABEL[field];
  if (map && typeof nilai === "string") return map[nilai] ?? nilai;
  return String(nilai);
}

type Props = {
  entityType: "listing" | "developer_project";
  entityId: string | null;
  /** Payload sesuai generateDescriptionFieldsSchema (tanpa description/keunggulan_tambahan -- ditambahkan komponen ini). */
  buildFields: () => Record<string, unknown>;
  currentDescription: string;
  onApply: (result: { description: string; titleSuggestion: string | null }) => void;
  onApplySuggestion?: (field: string, value: unknown) => void;
};

export function AiDescriptionDialog({ entityType, entityId, buildFields, currentDescription, onApply, onApplySuggestion }: Props) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<GenerateDescriptionData, { ok: true }> | null>(null);
  const [applied, setApplied] = useState<Set<number>>(new Set());

  function openDialog() {
    setError(null);
    setResult(null);
    setApplied(new Set());
    setOpen(true);
  }

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<GenerateDescriptionData>("/ai/generate-description", {
        entity_type: entityType,
        entity_id: entityId,
        mode: currentDescription.trim() ? "improve" : "new",
        fields: { ...buildFields(), description: currentDescription || undefined, keunggulan_tambahan: notes.trim() || undefined },
      });
      if (!res.data.ok) {
        setError(res.data.error.message);
        return;
      }
      setResult(res.data);
      setApplied(new Set());
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Terjadi kesalahan tak terduga.");
    } finally {
      setBusy(false);
    }
  }

  const highlights = result ? [...result.poin_unggulan, ...result.poin_area.map((p) => p.teks)] : [];

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={openDialog}>
        <SparkleIcon size={16} /> Bantu tulis deskripsi (AI)
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Bantu Tulis Deskripsi (AI)"
        description="Draf dibuat dari isian form saat ini. Periksa dulu sebelum dipakai."
        className="max-w-xl"
        footer={
          result ? (
            <>
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => setResult(null)}>
                Buat Ulang
              </Button>
              <Button size="sm" onClick={() => (onApply({ description: result.deskripsi, titleSuggestion: result.judul_saran }), setOpen(false))}>
                Pakai Deskripsi
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" disabled={busy} onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button size="sm" loading={busy} onClick={() => void generate()}>
                Buat Draf
              </Button>
            </>
          )
        }
      >
        <div className="flex flex-col gap-3.5">
          {!result ? (
            <label className="flex flex-col gap-1.5">
              <span className="text-label-lg">Keunggulan tambahan (opsional)</span>
              <Textarea rows={3} maxLength={1000} placeholder="Mis. dekat sekolah, baru direnovasi, bisa KPR…" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={busy} />
            </label>
          ) : null}

          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="flex flex-col gap-3.5">
              <div className="rounded-md border border-ink-100 bg-ink-50 p-3.5">
                <p className="whitespace-pre-wrap text-body-md text-ink-900">{result.deskripsi}</p>
              </div>
              {result.judul_saran ? (
                <p className="text-body-md text-ink-700">
                  <span className="font-bold">Saran judul:</span> {result.judul_saran}
                </p>
              ) : null}
              {highlights.length > 0 ? (
                <ul className="flex list-disc flex-col gap-1 pl-5 text-body-md text-ink-700">
                  {highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              ) : null}
              {result.catatan_verifikasi.length > 0 ? (
                <ul className="flex flex-col gap-1 text-caption text-warning-600">
                  {result.catatan_verifikasi.map((c, i) => (
                    <li key={i}>• {c}</li>
                  ))}
                </ul>
              ) : null}
              {result.saran_field.length > 0 && onApplySuggestion ? (
                <div className="flex flex-col gap-2 rounded-md border border-ink-100 p-3.5">
                  <p className="text-label-lg">Saran isi kolom lain</p>
                  <ul className="flex flex-col gap-2">
                    {result.saran_field.map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-3">
                        <span className="text-body-md text-ink-700">
                          {FIELD_LABEL[s.field] ?? s.field}: <span className="font-bold">{suggestionValueLabel(s.field, s.nilai)}</span>{" "}
                          <Badge tone={KEYAKINAN_TONE[s.keyakinan]} dot={false}>
                            {s.keyakinan}
                          </Badge>
                        </span>
                        {applied.has(i) ? (
                          <span className="text-caption text-success-600">Diterapkan</span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              onApplySuggestion(s.field, s.nilai);
                              setApplied((set) => new Set(set).add(i));
                            }}
                          >
                            Terapkan
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {result.usage.remaining_today !== null ? <p className="text-caption text-ink-500">Sisa pemakaian AI hari ini: {result.usage.remaining_today}</p> : null}
            </div>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}
