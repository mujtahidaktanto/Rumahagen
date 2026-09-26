"use client";

// components/admin/AddonFormDialog.tsx — Buat/Ubah Add-on (Katalog Add-on, Superadmin+Admin): POST /admin/commercial/addons (create) atau PUT /admin/commercial/addons/{id} (edit). Selalu
// disimpan sebagai draf (status diubah lewat aksi Aktifkan/Nonaktifkan terpisah, PATCH /status) — konsisten dengan wireframe (tombol "Simpan Draf"). Add-on yang sudah punya pesanan: kode,
// masa berlaku, dan kapasitas terkunci (harga/nama/promosi tetap bisa diubah). Preview "Setelah promosi" dihitung dari benefit_configuration promosi (percent_off/amount_off, migration 0131),
// bukan dikira-kira — nilai itu memang bentuk pasti yang divalidasi Zod (lib/validation/commercial-promotions.ts), bukan JSON bebas seperti komentar DB menyiratkan.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { AddonCapacityType, AddonRow, AddonValidityType, PromotionRow } from "@/lib/admin/commercial-catalog-data";
import { ApiClientError, api } from "@/lib/api-client";

const CAPACITY_LABEL: Record<AddonCapacityType, string> = { listing_refresh: "Refresh Listing", learning_point: "Poin Belajar", listing_slot: "Slot Listing" };
const CAPACITY_OPTIONS: AddonCapacityType[] = ["listing_refresh", "learning_point", "listing_slot"];

function formatRp(n: number | null): string {
  if (n == null || n <= 0) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

type CapRow = { type: AddonCapacityType; value: string };

export function AddonFormDialog({ addon, promotions, trigger }: { addon?: AddonRow; promotions: PromotionRow[]; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!addon;
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(addon?.code ?? "");
  const [name, setName] = useState(addon?.name ?? "");
  const [price, setPrice] = useState(addon?.price ? String(addon.price) : "");
  const [promotionId, setPromotionId] = useState<string>(addon?.promotionId ?? "");
  const [validityType, setValidityType] = useState<AddonValidityType>(addon?.validityType ?? "days");
  const [validityDays, setValidityDays] = useState(addon?.validityDays ? String(addon.validityDays) : "30");
  const [capacityType, setCapacityType] = useState<AddonCapacityType>(addon?.capacityType ?? "listing_refresh");
  const [capacityValue, setCapacityValue] = useState(addon?.capacityValue ? String(addon.capacityValue) : "");
  const [caps, setCaps] = useState<CapRow[]>((addon?.additionalCapacities ?? []).map((c) => ({ type: c.capacity_type, value: String(c.capacity_value) })));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = !!addon?.termsLocked;
  const promo = promotions.find((p) => p.id === promotionId) ?? null;
  const basePrice = Number(price) || 0;
  let finalPrice = basePrice;
  if (promo) {
    if (promo.percentOff) finalPrice = Math.round(basePrice * (1 - promo.percentOff / 100));
    else if (promo.amountOff) finalPrice = Math.max(0, basePrice - promo.amountOff);
  }

  function openDialog() {
    setCode(addon?.code ?? "");
    setName(addon?.name ?? "");
    setPrice(addon?.price ? String(addon.price) : "");
    setPromotionId(addon?.promotionId ?? "");
    setValidityType(addon?.validityType ?? "days");
    setValidityDays(addon?.validityDays ? String(addon.validityDays) : "30");
    setCapacityType(addon?.capacityType ?? "listing_refresh");
    setCapacityValue(addon?.capacityValue ? String(addon.capacityValue) : "");
    setCaps((addon?.additionalCapacities ?? []).map((c) => ({ type: c.capacity_type, value: String(c.capacity_value) })));
    setError(null);
    setOpen(true);
  }

  function addCap() {
    if (caps.length >= 10) return;
    setCaps((prev) => [...prev, { type: "learning_point", value: "" }]);
  }
  function removeCap(i: number) {
    setCaps((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateCap(i: number, patch: Partial<CapRow>) {
    setCaps((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  const canSave =
    /^[A-Za-z0-9_.-]+$/.test(code.trim()) &&
    name.trim().length > 0 &&
    Number(price) > 0 &&
    (validityType !== "days" || Number(validityDays) > 0) &&
    Number(capacityValue) > 0 &&
    (capacityType !== "listing_slot" || Number(capacityValue) % 1 === 0);

  async function save() {
    setBusy(true);
    setError(null);
    const body = {
      code: code.trim(),
      name: name.trim(),
      price: Number(price),
      validity_type: validityType,
      validity_days: validityType === "days" ? Number(validityDays) : undefined,
      capacity_type: capacityType,
      capacity_value: Number(capacityValue),
      additional_capacities: caps.filter((c) => Number(c.value) > 0).map((c) => ({ capacity_type: c.type, capacity_value: Number(c.value) })),
      promotion_id: promotionId || undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/commercial/addons/${addon.id}`, body, { idempotency: true });
      } else {
        await api.post("/admin/commercial/addons", body, { idempotency: true });
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Add-on gagal disimpan (mis. kode sudah dipakai). Data Anda masih di form; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog open={open} onClose={() => (busy ? undefined : setOpen(false))} title={isEdit ? `Ubah — ${addon.name}` : "Buat Add-on"}>
        <div className="flex flex-col gap-3.5">
          {locked ? (
            <p className="rounded-sm bg-warning-100 p-3 text-body-md text-warning-600">
              Add-on ini sudah punya pesanan. Kode, masa berlaku, dan kapasitas dikunci. Harga, nama, dan promosi tetap bisa diubah; harga baru hanya berlaku untuk pesanan baru.
            </p>
          ) : null}

          <Field label="Kode" required hint="Unik. Tidak bisa diubah setelah ada pesanan.">
            {(a) => <Input {...a} className="font-mono" value={code} onChange={(e) => setCode(e.target.value)} disabled={locked} maxLength={100} />}
          </Field>
          <Field label="Nama" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />}
          </Field>

          <Field label="Harga (Rp)" required hint="Satu-satunya sumber harga pesanan.">
            {(a) => <Input {...a} type="number" min={1} value={price} onChange={(e) => setPrice(e.target.value)} className="max-w-[240px]" />}
          </Field>
          <Field label="Promosi terkait" hint="Opsional — hanya promosi berstatus Aktif.">
            {(a) => (
              <Select {...a} value={promotionId} onChange={(e) => setPromotionId(e.target.value)}>
                <option value="">Tanpa promosi</option>
                {promotions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.percentOff ? `${p.percentOff}%` : formatRp(p.amountOff)})
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Masa berlaku">
              {(a) => (
                <Select {...a} value={validityType} onChange={(e) => setValidityType(e.target.value as AddonValidityType)} disabled={locked}>
                  <option value="days">Berlaku beberapa hari</option>
                  <option value="unlimited">Tanpa batas waktu</option>
                </Select>
              )}
            </Field>
            {validityType === "days" ? (
              <Field label="Jumlah hari" required>
                {(a) => <Input {...a} type="number" min={1} value={validityDays} onChange={(e) => setValidityDays(e.target.value)} disabled={locked} />}
              </Field>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Kapasitas utama" required>
              {(a) => (
                <Select {...a} value={capacityType} onChange={(e) => setCapacityType(e.target.value as AddonCapacityType)} disabled={locked}>
                  {CAPACITY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {CAPACITY_LABEL[c]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Jumlah" required>
              {(a) => <Input {...a} type="number" min={1} step={capacityType === "listing_slot" ? 1 : "any"} value={capacityValue} onChange={(e) => setCapacityValue(e.target.value)} disabled={locked} />}
            </Field>
          </div>
          {capacityType === "listing_slot" ? (
            <p className="text-caption">
              Slot listing dipakai untuk menerbitkan listing di atas kuota Gratis dan Pro. Tidak reset dan tidak kedaluwarsa sebelum dipakai; tiap slot yang dipakai berlaku 90 hari + 7 hari masa
              tenggang.
            </p>
          ) : null}

          <div className="flex flex-col gap-2">
            <span className="text-label-lg">Kapasitas tambahan (maksimal 10)</span>
            {caps.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select value={c.type} onChange={(e) => updateCap(i, { type: e.target.value as AddonCapacityType })} disabled={locked} className="h-9 flex-1 px-2 text-[13px]">
                  {CAPACITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {CAPACITY_LABEL[opt]}
                    </option>
                  ))}
                </Select>
                <Input type="number" min={1} value={c.value} onChange={(e) => updateCap(i, { value: e.target.value })} disabled={locked} className="w-28" />
                <button type="button" className="text-caption text-danger-600" onClick={() => removeCap(i)} disabled={locked}>
                  Hapus
                </button>
              </div>
            ))}
            <div>
              <Button type="button" variant="secondary" size="sm" disabled={caps.length >= 10 || locked} onClick={addCap}>
                + Tambah kapasitas
              </Button>
            </div>
          </div>

          <div className="rounded-md bg-blue-50 p-3.5">
            <span className="text-label-lg">Harga {formatRp(basePrice)}</span>
            {promo && finalPrice !== basePrice ? <div className="text-label-lg text-success-600">Setelah promosi {formatRp(finalPrice)}</div> : null}
          </div>

          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!canSave} onClick={() => void save()}>
              Simpan Draf
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
