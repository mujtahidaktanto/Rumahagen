"use client";

// components/agent/DbrCalculator.tsx — Kalkulator DBR (M07, wireframe 01-Agent/M07-Kalkulator-DBR): pilih bank (Bank Master aktif), isi data prospek dan properti, "Hitung DBR", lalu hasil + aksi. Perhitungan
// dilakukan SERVER (POST /dbr-simulations; angka anuitas, DBR, dan status kelayakan tidak dihitung di browser) dan tersimpan sebagai riwayat. Isian dicek dulu di klien (aturan sama dengan skema API);
// mencoba ulang dengan isian yang sama memakai kunci idempotensi yang sama, jadi gangguan jaringan tidak membuat simulasi ganda.
import { useRef, useState } from "react";
import { DbrActions } from "@/components/agent/DbrActions";
import { DbrResultCard } from "@/components/agent/DbrResultCard";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { InfoIcon } from "@/components/ui/icons";
import { ApiClientError, api, newIdempotencyKey } from "@/lib/api-client";
import type { DbrBank } from "@/lib/agent/dbr-data";
import { EMPTY_DBR_FORM, TENOR_OPTIONS, formatPercent, tenorLabel, validateDbrForm, type DbrErrors, type DbrForm } from "@/lib/agent/dbr-rules";
import { toSimulation, type DbrSimulation, type SimRow } from "@/lib/agent/dbr-types";
import { formatPriceInput } from "@/lib/agent/listing-wizard";

export function DbrCalculator({ banks }: { banks: DbrBank[] }) {
  const [f, setF] = useState<DbrForm>({ ...EMPTY_DBR_FORM, bankId: banks.length === 1 ? banks[0]!.id : "" });
  const [errors, setErrors] = useState<DbrErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sim, setSim] = useState<DbrSimulation | null>(null);
  const key = useRef<{ sig: string; value: string } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const bank = banks.find((b) => b.id === f.bankId);
  const set = <K extends keyof DbrForm>(k: K, v: DbrForm[K]) => setF((x) => ({ ...x, [k]: v }));
  const money = (k: "netIncome" | "existing" | "price" | "downPayment") => ({ value: f[k], inputMode: "numeric" as const, onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(k, formatPriceInput(e.target.value)) });

  async function calculate() {
    const { errors: errs, payload } = validateDbrForm(f);
    setErrors(errs);
    setError(null);
    if (!payload) return;
    setBusy(true);
    const sig = JSON.stringify(payload);
    if (key.current?.sig !== sig) key.current = { sig, value: newIdempotencyKey() };
    try {
      const res = await api.post<SimRow>("/dbr-simulations", payload, { idempotency: key.current.value });
      setSim(toSimulation({ ...res.data, banks: bank ? { name: bank.name } : null }));
      // Hasil di kolom kanan; pada layar sempit ada di bawah formulir, jadi gulir ke sana.
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(
        e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" && e.code !== "NETWORK_ERROR"
          ? e.message
          : "Simulasi belum berhasil dihitung. Periksa koneksi Anda lalu coba lagi; tidak ada data yang tersimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          void calculate();
        }}
      >
        <fieldset className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <legend className="px-1 text-title-md">Pilih Bank</legend>
          <div role="radiogroup" aria-label="Bank" className="grid gap-2 sm:grid-cols-2">
            {banks.map((b) => (
              <button
                key={b.id}
                type="button"
                role="radio"
                aria-checked={f.bankId === b.id}
                onClick={() => set("bankId", b.id)}
                className={`flex min-h-11 flex-col gap-0.5 rounded-md border-[1.5px] p-3 text-left ${f.bankId === b.id ? "border-blue-600 bg-blue-50" : "border-ink-100 bg-white hover:border-blue-500"}`}
              >
                <span className="text-label-lg break-words text-ink-900">{b.name}</span>
                <span className="text-caption">
                  Threshold DBR {formatPercent(b.thresholdPercent)} · Bunga {formatPercent(b.defaultRate)}/thn
                </span>
              </button>
            ))}
          </div>
          {errors.bankId ? (
            <p role="alert" className="text-caption text-danger-600">
              {errors.bankId}
            </p>
          ) : null}
        </fieldset>

        <fieldset className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5">
          <legend className="px-1 text-title-md">Data Prospek &amp; Properti</legend>
          <Field label="Penghasilan Bersih/Bulan" required error={errors.netIncome} hint="Rp">
            {(a) => <Input placeholder="15.000.000" {...money("netIncome")} {...a} />}
          </Field>
          <Field label="Cicilan Berjalan (opsional)" error={errors.existing} hint="Rp per bulan; kosongkan bila tidak ada">
            {(a) => <Input placeholder="0" {...money("existing")} {...a} />}
          </Field>
          <Field label="Harga Properti" required error={errors.price} hint="Rp">
            {(a) => <Input placeholder="500.000.000" {...money("price")} {...a} />}
          </Field>
          <Field label="Uang Muka (DP)" required error={errors.downPayment} hint="Rp; harus lebih kecil dari harga">
            {(a) => <Input placeholder="100.000.000" {...money("downPayment")} {...a} />}
          </Field>
          <Field label="Tenor" required error={errors.tenor}>
            {(a) => (
              <Select value={f.tenor} onChange={(e) => set("tenor", e.target.value)} {...a}>
                {TENOR_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {tenorLabel(m)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Suku Bunga/Tahun (opsional)" error={errors.rate} hint={bank ? `Kosong = bunga bawaan ${bank.name}: ${formatPercent(bank.defaultRate)}` : "Kosong = bunga bawaan bank"}>
            {(a) => <Input inputMode="decimal" placeholder={bank ? String(bank.defaultRate).replace(".", ",") : "8,5"} value={f.rate} onChange={(e) => set("rate", e.target.value.replace(/[^\d,]/g, ""))} {...a} />}
          </Field>
          <p className="flex items-start gap-2 text-caption">
            <InfoIcon size={14} className="mt-0.5 flex-none" />
            Perhitungan memakai rumus anuitas dan dilakukan di server; hasilnya tersimpan di Riwayat Simulasi dan tidak bisa diubah.
          </p>
        </fieldset>

        {error ? (
          <p role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3.5 text-body-md">
            {error}
          </p>
        ) : null}
        <Button type="submit" size="md" loading={busy} className="self-start">
          Hitung DBR
        </Button>
      </form>

      <div ref={resultRef} className="flex flex-col gap-4 lg:sticky lg:top-24">
        {sim ? (
          <>
            <DbrResultCard result={sim} />
            <DbrActions key={sim.id} simulation={sim} onChange={setSim} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-ink-200 bg-white p-8 text-center">
            <p className="text-title-md">Belum ada hasil</p>
            <p className="text-body-md text-ink-500">Isi data di sebelah kiri lalu klik &quot;Hitung DBR&quot; untuk melihat hasil analisis kelayakan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
