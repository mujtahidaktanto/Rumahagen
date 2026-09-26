"use client";

// components/admin/PromotionFormDialog.tsx — Buat/Ubah Promosi (Superadmin+Admin): POST/PUT /admin/commercial/promotions. Benefit tepat SATU dari percent_off/amount_off (migration 0131).
// Kelayakan (eligibility) di sini hanya field inti (roles, hanya pembelian pertama, batas pemakaian) — rule_configuration lanjutan (jam/hari, kode produk, dst., migration 0145) belum ada
// di form ini, dicatat di audit/FRONTEND_GAPS.md.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { PromotionRow } from "@/lib/admin/commercial-catalog-data";
import { ApiClientError, api } from "@/lib/api-client";

const ROLE_OPTIONS = [
  { value: "agent", label: "Agent" },
  { value: "developer_partner", label: "Developer Partner" },
  { value: "buyer", label: "Pembeli" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Superadmin" },
];

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PromotionFormDialog({ promotion, trigger }: { promotion?: PromotionRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!promotion;
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(promotion?.code ?? "");
  const [name, setName] = useState(promotion?.name ?? "");
  const [benefitType, setBenefitType] = useState<"percent_off" | "amount_off">(promotion?.percentOff ? "percent_off" : "amount_off");
  const [benefitValue, setBenefitValue] = useState(promotion ? String(promotion.percentOff ?? promotion.amountOff ?? "") : "");
  const [validFrom, setValidFrom] = useState(toLocalInput(promotion?.validFrom ?? null));
  const [validTo, setValidTo] = useState(toLocalInput(promotion?.validTo ?? null));
  const [roles, setRoles] = useState<string[]>(promotion?.eligibilityRoles ?? []);
  const [maxRedemptions, setMaxRedemptions] = useState(promotion?.maxRedemptions ? String(promotion.maxRedemptions) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setCode(promotion?.code ?? "");
    setName(promotion?.name ?? "");
    setBenefitType(promotion?.percentOff ? "percent_off" : "amount_off");
    setBenefitValue(promotion ? String(promotion.percentOff ?? promotion.amountOff ?? "") : "");
    setValidFrom(toLocalInput(promotion?.validFrom ?? null));
    setValidTo(toLocalInput(promotion?.validTo ?? null));
    setRoles(promotion?.eligibilityRoles ?? []);
    setMaxRedemptions(promotion?.maxRedemptions ? String(promotion.maxRedemptions) : "");
    setError(null);
    setOpen(true);
  }

  function toggleRole(role: string) {
    setRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }

  const canSave = /^[A-Za-z0-9_.-]+$/.test(code.trim()) && name.trim().length > 0 && Number(benefitValue) > 0;

  async function save() {
    setBusy(true);
    setError(null);
    const eligibility: Record<string, unknown> = {};
    if (roles.length > 0) eligibility.roles = roles;
    if (maxRedemptions.trim()) eligibility.max_redemptions = Number(maxRedemptions);
    const body = {
      code: code.trim(),
      name: name.trim(),
      benefit: benefitType === "percent_off" ? { percent_off: Number(benefitValue) } : { amount_off: Number(benefitValue) },
      eligibility: Object.keys(eligibility).length > 0 ? eligibility : undefined,
      valid_from: validFrom ? new Date(validFrom).toISOString() : undefined,
      valid_to: validTo ? new Date(validTo).toISOString() : undefined,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/commercial/promotions/${promotion.id}`, body, { idempotency: true });
      } else {
        await api.post("/admin/commercial/promotions", body, { idempotency: true });
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Promosi gagal disimpan. Data Anda masih di form; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog open={open} onClose={() => (busy ? undefined : setOpen(false))} title={isEdit ? `Ubah — ${promotion.name}` : "Buat Promosi"}>
        <div className="flex flex-col gap-3.5">
          <Field label="Kode" required hint="Unik.">
            {(a) => <Input {...a} className="font-mono" value={code} onChange={(e) => setCode(e.target.value)} maxLength={100} />}
          </Field>
          <Field label="Nama" required>
            {(a) => <Input {...a} value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Jenis potongan">
              {(a) => (
                <Select {...a} value={benefitType} onChange={(e) => setBenefitType(e.target.value as "percent_off" | "amount_off")}>
                  <option value="percent_off">Persen (%)</option>
                  <option value="amount_off">Potongan tetap (Rp)</option>
                </Select>
              )}
            </Field>
            <Field label={benefitType === "percent_off" ? "Persen" : "Jumlah (Rp)"} required>
              {(a) => <Input {...a} type="number" min={1} max={benefitType === "percent_off" ? 100 : undefined} value={benefitValue} onChange={(e) => setBenefitValue(e.target.value)} />}
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Berlaku dari" hint="Opsional.">
              {(a) => <Input {...a} type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />}
            </Field>
            <Field label="Berlaku sampai" hint="Opsional.">
              {(a) => <Input {...a} type="datetime-local" value={validTo} onChange={(e) => setValidTo(e.target.value)} />}
            </Field>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Peran yang berhak (opsional)</span>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={roles.includes(r.value)}
                  onClick={() => toggleRole(r.value)}
                  className={`rounded-pill border px-3 py-1.5 text-[13px] font-bold ${roles.includes(r.value) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-ink-100 bg-white text-ink-500"}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <span className="text-caption">Kosong = berlaku untuk semua peran yang boleh membeli.</span>
          </div>

          <Field label="Batas pemakaian total" hint="Opsional — kosong berarti tanpa batas.">
            {(a) => <Input {...a} type="number" min={1} value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)} className="max-w-[200px]" />}
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
