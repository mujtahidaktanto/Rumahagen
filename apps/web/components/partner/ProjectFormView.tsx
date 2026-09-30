"use client";

// components/partner/ProjectFormView.tsx — Form Proyek + Detail Proyek gabungan (M06, wireframe 03-Developer-Partner/M06-{Form-Proyek,Detail-Proyek}): buat proyek baru
// (POST /admin/developer-projects) atau ubah + kelola media + ubah status proyek milik sendiri (PUT /admin/developer-projects/{id}, upload lewat
// /developer-projects/{id}/uploads + POST .../media, migration 0147). Status "Aktif" TIDAK ditawarkan — publish hanya tim RumahAgen (SOURCE-Developer-Partner.md §7);
// bila trigger tetap menolak transisi, pesan servernya ditampilkan apa adanya (bukan dikira-kira).
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { ErrorState } from "@/components/ui/States";
import { CERTIFICATE_LABEL, FURNISHING_LABEL, IMB_LABEL, WATER_LABEL } from "@/lib/public/listing-labels";
import { PROPERTY_TYPE_LABEL } from "@/lib/public/listing-params";
import { putToSignedUrl } from "@/lib/media/image-processing";
import type { ProjectDetail, ProjectMediaRow } from "@/lib/partner/project-data";
import { PARTNER_PROJECT_STATUS_OPTIONS, projectStatus, validateProjectForm, type ProjectForm } from "@/lib/partner/project-rules";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";

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
  return items;
}

function n(v: number | null): string {
  return v === null ? "" : String(v);
}

function formFrom(p?: ProjectDetail): ProjectForm {
  return {
    name: p?.name ?? "",
    category: (p?.category as "primary" | "secondary") ?? "primary",
    transactionType: (p?.transactionType as "sale" | "rent") ?? "sale",
    propertyType: p?.propertyType ?? "",
    location: p?.location ?? "",
    provinceId: p?.provinceId ?? "",
    cityId: p?.cityId ?? "",
    districtId: p?.districtId ?? "",
    areaKeyword: p?.areaKeyword ?? "",
    priceMin: n(p?.priceMin ?? null),
    priceMax: n(p?.priceMax ?? null),
    priceUnit: (p?.priceUnit as "total" | "per_bulan" | "per_tahun") ?? "total",
    isNegotiable: p?.isNegotiable ?? false,
    unitAvailability: n(p?.unitAvailability ?? null),
    bedrooms: n(p?.bedrooms ?? null),
    bathrooms: n(p?.bathrooms ?? null),
    landArea: n(p?.landArea ?? null),
    buildingArea: n(p?.buildingArea ?? null),
    floors: n(p?.floors ?? null),
    carportCapacity: n(p?.carportCapacity ?? null),
    electricalPower: n(p?.electricalPower ?? null),
    waterSource: p?.waterSource ?? "",
    furnishing: p?.furnishing ?? "",
    yearBuilt: n(p?.yearBuilt ?? null),
    certificateType: p?.certificateType ?? "",
    certificateTransferred: p?.certificateTransferred ?? false,
    imbStatus: p?.imbStatus ?? "",
    disputeFreeDeclared: p?.disputeFreeDeclared ?? false,
    commissionScheme: p?.commissionScheme ?? "",
    extraCommission: p?.extraCommission ?? "",
  };
}

function numOrUndef(v: string): number | undefined {
  const t = v.trim();
  return t === "" ? undefined : Number(t);
}

function bodyFrom(f: ProjectForm) {
  return {
    name: f.name.trim(),
    category: f.category,
    transaction_type: f.transactionType,
    property_type: f.propertyType || undefined,
    location: f.location.trim() || undefined,
    province_id: f.provinceId,
    city_id: f.cityId,
    district_id: f.districtId,
    area_keyword: f.areaKeyword.trim() || undefined,
    price_min: numOrUndef(f.priceMin),
    price_max: numOrUndef(f.priceMax),
    price_unit: f.priceUnit,
    is_negotiable: f.isNegotiable,
    unit_availability: numOrUndef(f.unitAvailability),
    bedrooms: numOrUndef(f.bedrooms),
    bathrooms: numOrUndef(f.bathrooms),
    land_area: numOrUndef(f.landArea),
    building_area: numOrUndef(f.buildingArea),
    floors: numOrUndef(f.floors),
    carport_capacity: numOrUndef(f.carportCapacity),
    electrical_power: numOrUndef(f.electricalPower),
    water_source: f.waterSource || undefined,
    furnishing: f.furnishing || undefined,
    year_built: numOrUndef(f.yearBuilt),
    certificate_type: f.certificateType || undefined,
    certificate_transferred: f.certificateTransferred,
    imb_status: f.imbStatus || undefined,
    dispute_free_declared: f.disputeFreeDeclared,
    commission_scheme: f.commissionScheme.trim() || undefined,
    extra_commission: f.extraCommission.trim() || undefined,
  };
}

export function ProjectFormView({ developerId, project, media }: { developerId: string; project?: ProjectDetail; media?: Part<ProjectMediaRow[]> }) {
  const router = useRouter();
  const isEdit = !!project;
  const initial = formFrom(project);
  const [f, setF] = useState<ProjectForm>(initial);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors = tried ? validateProjectForm(f) : {};
  const dirty = JSON.stringify(f) !== JSON.stringify(initial);

  const provinces = useOptions("/ref-provinces", {}, true);
  const cities = useOptions("/ref-cities", { province_id: f.provinceId }, !!f.provinceId);
  const districts = useOptions("/ref-districts", { city_id: f.cityId }, !!f.cityId);

  function set<K extends keyof ProjectForm>(k: K, v: ProjectForm[K]) {
    setF((x) => ({ ...x, [k]: v }));
    setError(null);
  }

  async function save() {
    setTried(true);
    const errs = validateProjectForm(f);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/admin/developer-projects/${project.id}`, bodyFrom(f), { idempotency: true });
        router.refresh();
      } else {
        const res = await api.post<{ id: string }>("/admin/developer-projects", { developer_id: developerId, ...bodyFrom(f) }, { idempotency: true });
        router.push(`/partner/proyek/${res.data.id}` as Route);
      }
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-col gap-4 p-4 pb-28 lg:p-8 lg:pb-28">
      <h1 className="text-headline">{isEdit ? project.name : "Buat Proyek Baru"}</h1>

      <Section title="Identitas &amp; Klasifikasi">
        <Field label="Nama Proyek" required error={errors.name}>
          {(a) => <Input {...a} value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={200} />}
        </Field>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Field label="Kategori">
            {(a) => (
              <Select {...a} value={f.category} onChange={(e) => set("category", e.target.value as ProjectForm["category"])}>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </Select>
            )}
          </Field>
          <Field label="Jenis Transaksi">
            {(a) => (
              <Select {...a} value={f.transactionType} onChange={(e) => set("transactionType", e.target.value as ProjectForm["transactionType"])}>
                <option value="sale">Dijual</option>
                <option value="rent">Disewakan</option>
              </Select>
            )}
          </Field>
          <Field label="Tipe Properti">
            {(a) => (
              <Select {...a} value={f.propertyType} onChange={(e) => set("propertyType", e.target.value)}>
                <option value="">—</option>
                {Object.entries(PROPERTY_TYPE_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Section>

      <Section title="Lokasi">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Field label="Provinsi" required error={errors.provinceId}>
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
          <Field label="Kota/Kabupaten" required error={errors.cityId}>
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
          <Field label="Kecamatan" required error={errors.districtId}>
            {(a) => (
              <Select {...a} disabled={!f.cityId} value={f.districtId} onChange={(e) => set("districtId", e.target.value)}>
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
        <Field label="Lokasi (nama area/jalan)">{(a) => <Input {...a} value={f.location} onChange={(e) => set("location", e.target.value)} maxLength={255} />}</Field>
        <Field label="Kata kunci area" hint="Maks. 20 karakter, mis. BSD, Alam Sutera.">
          {(a) => <Input {...a} value={f.areaKeyword} onChange={(e) => set("areaKeyword", e.target.value)} maxLength={20} />}
        </Field>
      </Section>

      <Section title="Harga">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          <Field label="Harga minimum (Rp)">{(a) => <Input {...a} type="number" min={0} value={f.priceMin} onChange={(e) => set("priceMin", e.target.value)} />}</Field>
          <Field label="Harga maksimum (Rp)">{(a) => <Input {...a} type="number" min={0} value={f.priceMax} onChange={(e) => set("priceMax", e.target.value)} />}</Field>
          <Field label="Satuan harga">
            {(a) => (
              <Select {...a} value={f.priceUnit} onChange={(e) => set("priceUnit", e.target.value as ProjectForm["priceUnit"])}>
                <option value="total">Total</option>
                <option value="per_bulan">Per bulan</option>
                <option value="per_tahun">Per tahun</option>
              </Select>
            )}
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-lg">Harga bisa dinego</span>
          <Switch checked={f.isNegotiable} onChange={(v) => set("isNegotiable", v)} aria-label="Harga bisa dinego" />
        </div>
        <Field label="Unit tersedia">{(a) => <Input {...a} type="number" min={0} value={f.unitAvailability} onChange={(e) => set("unitAvailability", e.target.value)} className="max-w-[200px]" />}</Field>
      </Section>

      <Section title="Spesifikasi">
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <Field label="Kamar tidur">{(a) => <Input {...a} type="number" min={0} value={f.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} />}</Field>
          <Field label="Kamar mandi">{(a) => <Input {...a} type="number" min={0} value={f.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} />}</Field>
          <Field label="Luas tanah (m²)">{(a) => <Input {...a} type="number" min={0} value={f.landArea} onChange={(e) => set("landArea", e.target.value)} />}</Field>
          <Field label="Luas bangunan (m²)">{(a) => <Input {...a} type="number" min={0} value={f.buildingArea} onChange={(e) => set("buildingArea", e.target.value)} />}</Field>
          <Field label="Jumlah lantai">{(a) => <Input {...a} type="number" min={0} value={f.floors} onChange={(e) => set("floors", e.target.value)} />}</Field>
          <Field label="Kapasitas carport">{(a) => <Input {...a} type="number" min={0} value={f.carportCapacity} onChange={(e) => set("carportCapacity", e.target.value)} />}</Field>
          <Field label="Daya listrik (watt)">{(a) => <Input {...a} type="number" min={0} value={f.electricalPower} onChange={(e) => set("electricalPower", e.target.value)} />}</Field>
          <Field label="Tahun dibangun">{(a) => <Input {...a} type="number" value={f.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)} />}</Field>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Sumber air">
            {(a) => (
              <Select {...a} value={f.waterSource} onChange={(e) => set("waterSource", e.target.value)}>
                <option value="">—</option>
                {Object.entries(WATER_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Perabotan">
            {(a) => (
              <Select {...a} value={f.furnishing} onChange={(e) => set("furnishing", e.target.value)}>
                <option value="">—</option>
                {Object.entries(FURNISHING_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
      </Section>

      <Section title="Legalitas">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Jenis sertifikat">
            {(a) => (
              <Select {...a} value={f.certificateType} onChange={(e) => set("certificateType", e.target.value)}>
                <option value="">—</option>
                {Object.entries(CERTIFICATE_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="Status IMB">
            {(a) => (
              <Select {...a} value={f.imbStatus} onChange={(e) => set("imbStatus", e.target.value)}>
                <option value="">—</option>
                {Object.entries(IMB_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-lg">Sertifikat bisa dibalik nama</span>
          <Switch checked={f.certificateTransferred} onChange={(v) => set("certificateTransferred", v)} aria-label="Sertifikat bisa dibalik nama" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-label-lg">Bebas sengketa (dinyatakan sendiri)</span>
          <Switch checked={f.disputeFreeDeclared} onChange={(v) => set("disputeFreeDeclared", v)} aria-label="Bebas sengketa" />
        </div>
      </Section>

      <Section title="Komersial">
        <p className="text-caption">Non-eksklusivitas: proyek ini tidak bisa ditandai eksklusif wilayah tertentu.</p>
        <Field label="Skema komisi">{(a) => <Input {...a} value={f.commissionScheme} onChange={(e) => set("commissionScheme", e.target.value)} maxLength={255} />}</Field>
        <Field label="Komisi tambahan">{(a) => <Textarea {...a} rows={2} value={f.extraCommission} onChange={(e) => set("extraCommission", e.target.value)} />}</Field>
      </Section>

      {isEdit ? <StatusSection project={project} /> : null}
      {isEdit ? <MediaSection projectId={project.id} initial={media} /> : null}

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      {!isEdit || dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-ink-100 bg-white p-4 shadow-3">
          <span className="text-body-md text-ink-700">{isEdit ? "Ada perubahan yang belum disimpan." : "Lengkapi field wajib lalu simpan."}</span>
          <div className="flex gap-2.5">
            <LinkButton href={"/partner/proyek" as Route} variant="secondary">
              Batalkan
            </LinkButton>
            <Button loading={busy} onClick={() => void save()}>
              {isEdit ? "Simpan Perubahan" : "Buat Proyek"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <h2 className="mb-3.5 text-title-md">{title}</h2>
      <div className="flex flex-col gap-3.5">{children}</div>
    </div>
  );
}

function StatusSection({ project }: { project: ProjectDetail }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const st = projectStatus(project.status);

  async function changeStatus(status: string) {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/developer-projects/${project.id}`, { status }, { idempotency: true });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Status gagal diubah. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-title-md">Status</h2>
        <Badge tone={st.tone}>{st.label}</Badge>
      </div>
      {project.status === "active" ? (
        <p className="text-body-md text-ink-500">Diaktifkan oleh tim RumahAgen. Anda bisa mengembalikannya ke Coming Soon atau Sold Out di bawah.</p>
      ) : (
        <p className="text-body-md text-ink-500">Status Aktif hanya diberikan tim RumahAgen setelah proyek ditinjau — tidak ada tombol untuk mengaktifkan sendiri di sini.</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        {PARTNER_PROJECT_STATUS_OPTIONS.map((s) => (
          <Button key={s} variant={project.status === s ? "primary" : "secondary"} size="sm" disabled={busy || project.status === s} onClick={() => void changeStatus(s)}>
            {projectStatus(s).label}
          </Button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function MediaSection({ projectId, initial }: { projectId: string; initial?: Part<ProjectMediaRow[]> }) {
  const router = useRouter();
  const [items, setItems] = useState<ProjectMediaRow[]>(initial?.ok ? initial.data : []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      for (const file of files) {
        const kind = "media";
        const up = await api.post<{ upload_url: string; file_url: string; media_type: string }>(
          `/developer-projects/${projectId}/uploads`,
          { kind, file_name: file.name, content_type: file.type, size_bytes: file.size },
          { idempotency: true },
        );
        await putToSignedUrl(up.data.upload_url, file, file.type);
        const created = await api.post<ProjectMediaRow>(`/developer-projects/${projectId}/media`, { type: up.data.media_type, url: up.data.file_url }, { idempotency: true });
        setItems((cur) => [created.data, ...cur]);
      }
      router.refresh();
    } catch (e2) {
      setError(e2 instanceof ApiClientError && e2.code !== "UNKNOWN_ERROR" ? e2.message : "Unggah gagal. Berkas yang sudah berhasil tetap tersimpan; coba lagi untuk sisanya.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <h2 className="mb-1 text-title-md">Media</h2>
      <p className="mb-3.5 text-caption">Foto (JPEG/PNG/WebP) atau video (MP4), maksimal 50 MB per berkas. Ini BUKAN Marketing Kit (brosur/daftar harga PDF).</p>
      {!initial || initial.ok === false ? (
        <ErrorState title="Media gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <>
          {items.length === 0 ? (
            <p className="py-6 text-center text-body-md text-ink-500">Belum ada foto atau video.</p>
          ) : (
            <div className="mb-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {items.map((m) => (
                <div key={m.id} className="flex flex-col gap-1 overflow-hidden rounded-sm border border-ink-100">
                  {m.type === "photo" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt="" className="h-24 w-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center bg-ink-50 text-caption">Video</div>
                  )}
                </div>
              ))}
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-pill border-[1.5px] border-ink-100 px-4 py-2 text-label-lg text-blue-600 hover:border-blue-500">
            {busy ? "Mengunggah…" : "+ Tambah Media"}
            <input type="file" accept="image/jpeg,image/png,image/webp,video/mp4" multiple disabled={busy} onChange={(e) => void onPick(e)} className="hidden" />
          </label>
        </>
      )}
      {error ? (
        <p role="alert" className="mt-2 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
