"use client";

// components/admin/PlanFormDialog.tsx — Buat/Ubah Paket Langganan (Superadmin+Admin): POST /admin/commercial/plans (create, code wajib) atau PUT /admin/commercial/plans/{id} (edit, code
// tidak diminta ulang di sini karena updatePlanSchema tetap menerimanya tapi kita kirim sama seperti semula — kode/durasi terkunci di UI setelah paket terjual).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { PlanRow, PromotionRow } from "@/lib/admin/commercial-catalog-data";
import { ApiClientError, api } from "@/lib/api-client";

function formatRp(n: number | null): string {
  if (n == null || n <= 0) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function PlanFormDialog({ plan, promotions, trigger }: { plan?: PlanRow; promotions: PromotionRow[]; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!plan;
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(plan?.code ?? "");
  const [name, setName] = useState(plan?.name ?? "");
  const [description, setDescription] = useState(plan?.description ?? "");
  const [months, setMonths] = useState(plan ? String(plan.durationMonths) : "1");
  const [pricePersonal, setPricePersonal] = useState(plan?.pricePersonal ? String(plan.pricePersonal) : "");
  const [priceOrganization, setPriceOrganization] = useState(plan?.priceOrganization ? String(plan.priceOrganization) : "");
  const [promotionId, setPromotionId] = useState(plan?.promotionId ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = !!plan?.termsLocked;

  function openDialog() {
    setCode(plan?.code ?? "");
    setName(plan?.name ?? "");
    setDescription(plan?.description ?? "");
    setMonths(plan ? String(plan.durationMonths) : "1");
    setPricePersonal(plan?.pricePersonal ? String(plan.pricePersonal) : "");
    setPriceOrganization(plan?.priceOrganization ? String(plan.priceOrganization) : "");
    setPromotionId(plan?.promotionId ?? "");
    setError(null);
    setOpen(true);
  }

  const canSave = /^[a-z0-9_]+$/.test(code.trim()) && name.trim().length > 0 && Number(months) >= 1 && Number(months) <= 36;

  async function save() {
    setBusy(true);
    setError(null);
    const body = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || undefined,
      duration_months: Number(months),
      price_personal: pricePersonal.trim() ? Number(pricePersonal) : undefined,
      price_organization: priceOrganization.trim() ? Number(priceOrganization) : undefined,
      promotion_id: promotionId || undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/commercial/plans/${plan.id}`, body, { idempotency: true });
      } else {
        await api.post("/admin/commercial/plans", body, { idempotency: true });
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Paket gagal disimpan. Data Anda masih di form; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog open={open} onClose={() => (busy ? undefined : setOpen(false))} title={isEdit ? `Ubah — ${plan.name}` : "Buat Paket"}>
        <div className="flex flex-col gap-3.5">
          {locked ? <p className="rounded-sm bg-warning-100 p-3 text-body-md text-warning-600">Paket ini sudah terjual. Kode dan durasi dikunci; buat paket baru untuk syarat berbeda.</p> : null}

          <Field label="Kode" required hint="Huruf kecil, angka, dan garis bawah.">
            {(a) => <Input {...a} className="font-mono" value={code} onChange={(e) => setCode(e.target.value)} disabled={locked} maxLength={100} />}
          </Field>
          <Field label="Nama paket" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />}
          </Field>
          <Field label="Deskripsi" hint="Opsional.">
            {(a) => <Textarea {...a} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />}
          </Field>
          <Field label="Durasi (bulan)" required>
            {(a) => <Input {...a} type="number" min={1} max={36} value={months} onChange={(e) => setMonths(e.target.value)} disabled={locked} className="max-w-[160px]" />}
          </Field>
          <Field label="Harga pribadi (Rp)" hint="Kosong = tidak dijual untuk pribadi.">
            {(a) => <Input {...a} type="number" min={1} value={pricePersonal} onChange={(e) => setPricePersonal(e.target.value)} />}
          </Field>
          <Field label="Harga organisasi (Rp)" hint="Kosong = tidak dijual untuk organisasi. Hanya leader organisasi yang bisa membeli.">
            {(a) => <Input {...a} type="number" min={1} value={priceOrganization} onChange={(e) => setPriceOrganization(e.target.value)} />}
          </Field>
          <Field label="Promosi terhubung" hint="Opsional — hanya promosi berstatus Aktif.">
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
              Simpan
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
