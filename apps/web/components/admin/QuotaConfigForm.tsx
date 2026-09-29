"use client";

// components/admin/QuotaConfigForm.tsx — tab Kuota Listing (Konfigurasi Sistem, M09/M03×M14): 7 kunci `listing_quota.*` di system_configs (migration 0140). Tidak ada endpoint batch — disimpan lewat
// PUT /admin/config/system/{key} berurutan per kunci yang berubah (kunci yang tidak diubah tidak dikirim ulang). Superadmin-only (m09.system_configuration.manage); pemanggil memastikan hanya
// Superadmin yang melihat tombol Simpan (Admin/Manager selalu readOnly).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ApiClientError, api, newIdempotencyKey } from "@/lib/api-client";
import { QUOTA_KEYS, validateQuotaForm, type QuotaForm } from "@/lib/admin/system-config-rules";

const LABELS: Record<keyof QuotaForm, { label: string; hint: string }> = {
  freePersonal: { label: "Kuota gratis pribadi (per bulan)", hint: "listing_quota.free_personal" },
  freeOrganization: { label: "Kuota gratis organisasi (per bulan)", hint: "listing_quota.free_organization" },
  proPersonal: { label: "Kuota Pro pribadi (per siklus bulanan)", hint: "listing_quota.pro_personal" },
  proOrganization: { label: "Kuota Pro organisasi (per siklus bulanan)", hint: "listing_quota.pro_organization" },
  validityDays: { label: "Masa tayang tiap jatah (hari)", hint: "listing_quota.validity_days" },
  graceDays: { label: "Masa tenggang (hari)", hint: "listing_quota.grace_days" },
  proProductCodes: { label: "Kode produk langganan Pro", hint: "listing_quota.pro_product_codes — dipisah koma. Langganan aktif dengan kode ini memberi kuota Pro." },
};
const ORDER: (keyof QuotaForm)[] = ["freePersonal", "freeOrganization", "proPersonal", "proOrganization", "validityDays", "graceDays", "proProductCodes"];

export function QuotaConfigForm({ initial, readOnly }: { initial: QuotaForm; readOnly: boolean }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const errors = tried ? validateQuotaForm(v) : {};

  function set(k: keyof QuotaForm, val: string) {
    setV((x) => ({ ...x, [k]: val }));
    setSaved(false);
    setError(null);
  }

  async function save() {
    setTried(true);
    const errs = validateQuotaForm(v);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      // Hanya kunci yang berubah dari nilai awal yang dikirim — mengurangi tulisan tak perlu dan risiko konflik pada kunci yang tidak disentuh.
      const changed = ORDER.filter((k) => v[k].trim() !== initial[k].trim());
      for (const k of changed) {
        await api.put(`/admin/config/system/${QUOTA_KEYS[k]}`, { config_value: v[k].trim() }, { idempotency: newIdempotencyKey() });
      }
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <p className="text-body-md text-ink-500">Batas kuota penerbitan listing. Dibaca saat dipakai: perubahan berlaku untuk penerbitan berikutnya, listing yang sudah terbit tidak berubah.</p>
      <p className="rounded-sm bg-ink-50 p-3 text-caption">
        Tetap (tidak bisa diubah di sini): reset kuota Gratis tiap tanggal 1 pukul 00:00 WIB tanpa carry over; reset kuota Pro tiap siklus bulanan langganan (beli baru = reset); slot beli tidak reset dan tidak
        kedaluwarsa sebelum dipakai; urutan pemakaian Gratis → Pro → Slot beli.
      </p>
      {ORDER.map((k) => (
        <Field key={k} label={LABELS[k].label} hint={LABELS[k].hint} error={errors[k]}>
          {(a) => <Input {...a} disabled={readOnly} value={v[k]} onChange={(e) => set(k, e.target.value)} />}
        </Field>
      ))}
      {!readOnly ? (
        <div className="flex items-center gap-3">
          <Button loading={busy} onClick={() => void save()}>
            Simpan Konfigurasi
          </Button>
          {saved ? (
            <p role="status" className="text-caption text-success-600">
              Tersimpan. Batas baru dipakai pada penerbitan berikutnya.
            </p>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      {tried && Object.keys(errors).length > 0 ? (
        <p role="alert" className="text-caption text-danger-600">
          Periksa isian bertanda merah sebelum menyimpan.
        </p>
      ) : null}
    </div>
  );
}
