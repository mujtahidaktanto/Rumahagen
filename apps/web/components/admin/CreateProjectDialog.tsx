"use client";

// components/admin/CreateProjectDialog.tsx — Buat Proyek Baru (Proyek Developer, tab Proyek): POST /admin/developer-projects. Wireframe: "Field lengkap sesuai skema createDeveloperProjectSchema —
// form ini hanya field inti, detail lengkap di layar edit proyek (belum dibangun)." province_id/city_id/district_id WAJIB (NOT NULL di skema) meski wireframe menyebut form minimal, jadi tetap
// disertakan sebagai pemilih wilayah berjenjang (pola sama seperti ListingWizard: memuat semua halaman karena API membatasi limit 100/permintaan).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { PartnerRow } from "@/lib/admin/developer-admin-data";
import { ApiClientError, api } from "@/lib/api-client";

type Option = { id: string; name: string };

function useOptions(path: string, params: Record<string, string>, enabled: boolean) {
  const [items, setItems] = useState<Option[]>([]);
  const key = JSON.stringify(params);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    (async () => {
      const all: Option[] = [];
      for (let offset = 0; offset < 2000; ) {
        const r = await api.get<Option[]>(path, { ...params, limit: 100, offset });
        all.push(...r.data);
        if (!r.meta?.pagination?.hasMore || r.data.length === 0) break;
        offset += r.data.length;
      }
      if (live) setItems(all);
    })().catch(() => undefined);
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, enabled]);
  return enabled ? items : [];
}

const EMPTY = { developerId: "", name: "", category: "primary" as "primary" | "secondary", transactionType: "sale" as "sale" | "rent", location: "", provinceId: "", cityId: "", districtId: "" };

export function CreateProjectDialog({ partners, trigger }: { partners: PartnerRow[]; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provinces = useOptions("/ref-provinces", {}, open);
  const cities = useOptions("/ref-cities", { province_id: f.provinceId }, open && !!f.provinceId);
  const districts = useOptions("/ref-districts", { city_id: f.cityId }, open && !!f.cityId);

  function openDialog() {
    setF(EMPTY);
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!f.developerId || !f.name.trim() || !f.provinceId || !f.cityId || !f.districtId) {
      setError("Lengkapi Developer Partner, Nama Proyek, dan wilayah (Provinsi/Kota/Kecamatan).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ id: string }>(
        "/admin/developer-projects",
        { developer_id: f.developerId, name: f.name.trim(), category: f.category, transaction_type: f.transactionType, location: f.location.trim() || undefined, province_id: f.provinceId, city_id: f.cityId, district_id: f.districtId },
        { idempotency: true },
      );
      void res;
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Buat Proyek Baru"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Buat Proyek
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Developer Partner" required>
            {(a) => (
              <Select {...a} value={f.developerId} onChange={(e) => setF((x) => ({ ...x, developerId: e.target.value }))}>
                <option value="">Pilih perusahaan…</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.companyName}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Nama Proyek" required>
            {(a) => <Input {...a} value={f.name} onChange={(e) => setF((x) => ({ ...x, name: e.target.value }))} />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Kategori">
              {(a) => (
                <Select {...a} value={f.category} onChange={(e) => setF((x) => ({ ...x, category: e.target.value as typeof f.category }))}>
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                </Select>
              )}
            </Field>
            <Field label="Jenis Transaksi">
              {(a) => (
                <Select {...a} value={f.transactionType} onChange={(e) => setF((x) => ({ ...x, transactionType: e.target.value as typeof f.transactionType }))}>
                  <option value="sale">Dijual</option>
                  <option value="rent">Disewakan</option>
                </Select>
              )}
            </Field>
          </div>
          <Field label="Lokasi">{(a) => <Input {...a} value={f.location} onChange={(e) => setF((x) => ({ ...x, location: e.target.value }))} />}</Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Provinsi" required>
              {(a) => (
                <Select {...a} value={f.provinceId} onChange={(e) => setF((x) => ({ ...x, provinceId: e.target.value, cityId: "", districtId: "" }))}>
                  <option value="">Pilih…</option>
                  {provinces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Kota/Kabupaten" required>
              {(a) => (
                <Select {...a} disabled={!f.provinceId} value={f.cityId} onChange={(e) => setF((x) => ({ ...x, cityId: e.target.value, districtId: "" }))}>
                  <option value="">Pilih…</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            <Field label="Kecamatan" required>
              {(a) => (
                <Select {...a} disabled={!f.cityId} value={f.districtId} onChange={(e) => setF((x) => ({ ...x, districtId: e.target.value }))}>
                  <option value="">Pilih…</option>
                  {districts.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
          <p className="text-caption">Field lengkap (spesifikasi fisik, harga, legalitas, dll.) sesuai skema createDeveloperProjectSchema — form ini hanya field inti untuk wireframe.</p>
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
