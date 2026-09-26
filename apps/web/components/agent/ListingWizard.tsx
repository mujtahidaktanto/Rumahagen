"use client";

// components/agent/ListingWizard.tsx — Wizard Buat/Edit Listing (M03, wireframe 01-Agent/M03-Create-Listing-Wizard): 9 langkah (Mulai, Kategori, Lokasi, Detail, Harga, Legalitas, Media, Kontak,
// Terbitkan). Mode: baru (POST /listings lalu fasilitas dan media), salin (isian dari listing lain, tanpa media), edit (PUT /listings/{id} + selisih fasilitas/media). Data disimpan di server hanya saat
// "Simpan sebagai Draf"/"Terbitkan"; API POST /listings butuh semua kolom wajib sehingga tidak bisa menyimpan draf parsial per langkah. Terbit = PATCH status published (memakai kuota; 409 bila habis;
// listing tetap tersimpan sebagai draf). Foto: dipilih dari perangkat (hingga 25 MB), dikecilkan di browser jadi tiga varian WebP/JPEG (<3 MB) dan diunggah setelah listing dibuat; video hanya tautan https. Pemilik kuota (Pribadi atau organisasi yang diikuti) dipilih di langkah Mulai; bawaannya konteks aktif Context Switcher, dan terkunci saat edit.
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { AlertIcon, CheckCircleIcon, InfoIcon } from "@/components/ui/icons";
import { Switch } from "@/components/ui/Switch";
import { ApiClientError, api, newIdempotencyKey } from "@/lib/api-client";
import { loadSource, makeListingVariants, pickProblem } from "@/lib/media/image-processing";
import { uploadListingPhoto, type ProcessedPhoto } from "@/lib/media/upload";
import { listingPhotoUrl } from "@/lib/media/variants";
import type { ContextOrg } from "@/lib/agent/context";
import { quotaLevel } from "@/lib/agent/listing-quota";
import { publishErrorMessage } from "@/lib/agent/listing-rules";
import {
  CERTIFICATES, FURNISHINGS, IMB_STATUSES, MAX_PHOTOS, MAX_VIDEOS, PRICE_UNITS, PROPERTY_TYPES, WATER_SOURCES, WIZARD_STEPS, defaultPriceUnit, diffIds, diffMedia, firstInvalidStep,
  formatPriceInput, isHttpsUrl, parseNumber, specLine, toCreatePayload, toUpdatePayload, validateStep, type StepKey, type StepErrors, type WizardValues,
} from "@/lib/agent/listing-wizard";
import { formatListingPrice } from "@/lib/format";
import { PROPERTY_TYPE_LABEL } from "@/lib/public/listing-params";
import { CERTIFICATE_LABEL, FURNISHING_LABEL, IMB_LABEL, WATER_LABEL } from "@/lib/public/listing-labels";
import type { ListingQuotaSummary } from "@/lib/validation/listing-quota";

type Option = { id: string; name: string };
type Media = { id: string; url: string };
/** Foto yang baru dipilih (sudah dikecilkan di browser) dan menunggu diunggah saat Simpan; di daftar foto diwakili kunci "pending:{id}". */
type Pending = ProcessedPhoto & { preview: string; name: string; uploadedUrl?: string };
const PENDING = "pending:";
export type WizardProps = {
  mode: "baru" | "salin" | "edit";
  initial: WizardValues;
  listingId?: string;
  status?: string;
  /** Sudah pernah terbit: alamat, tipe properti, luas tanah/bangunan dikunci. */
  locked?: boolean;
  existingAmenityIds?: string[];
  existingPhotos?: Media[];
  existingVideos?: (Media & { kind: "video" | "virtual_tour" })[];
  /** Langkah awal (mis. "media" dari tombol Kelola Media). */
  startStep?: StepKey;
  /** Organisasi yang diikuti (pilihan pemilik kuota di langkah Mulai). */
  orgs?: ContextOrg[];
};

const nf = new Intl.NumberFormat("id-ID");
const typeLabel = (t: string) => PROPERTY_TYPE_LABEL[t as keyof typeof PROPERTY_TYPE_LABEL] ?? t;
const UNIT_LABEL: Record<string, string> = { total: "Total", per_bulan: "Per bulan", per_tahun: "Per tahun" };

function useOptions(path: string, params: Record<string, string>, enabled: boolean, seed: Option[] = []) {
  const [items, setItems] = useState<Option[]>(seed);
  const [failed, setFailed] = useState(false);
  const key = JSON.stringify(params);
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    setFailed(false);
    // API membatasi limit maksimal 100 per permintaan: muat halaman demi halaman sampai habis.
    (async () => {
      const all: Option[] = [];
      for (let offset = 0; offset < 2000; ) {
        const r = await api.get<Option[]>(path, { ...params, limit: 100, offset });
        all.push(...r.data);
        if (!r.meta?.pagination?.hasMore || r.data.length === 0) break;
        offset += r.data.length;
      }
      if (live) setItems(all);
    })().catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, enabled]);
  return { items: enabled ? items : [], failed };
}

function Choice({ checked, onClick, title, hint, disabled }: { checked: boolean; onClick: () => void; title: string; hint?: string; disabled?: boolean }) {
  return (
    <button type="button" role="radio" aria-checked={checked} disabled={disabled} onClick={onClick} className={`flex w-full flex-col gap-1 rounded-md border-[1.5px] p-4 text-left disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "border-blue-600 bg-blue-50" : "border-ink-100 bg-white hover:border-blue-500"}`}>
      <span className="text-label-lg text-ink-900">{title}</span>
      {hint ? <span className="text-caption">{hint}</span> : null}
    </button>
  );
}

function Notice({ tone, children }: { tone: "info" | "warn" | "danger"; children: ReactNode }) {
  const cls = { info: "border-blue-200 bg-info-100", warn: "border-warning-600/30 bg-warning-100", danger: "border-danger-600/30 bg-danger-100" }[tone];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={`flex items-start gap-2.5 rounded-md border p-3.5 text-body-md text-ink-900 ${cls}`}>
      {tone === "info" ? <InfoIcon size={17} className="mt-0.5 flex-none text-info-600" /> : <AlertIcon size={17} className="mt-0.5 flex-none" />}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function ListingWizard(p: WizardProps) {
  const locked = p.locked === true;
  const edit = p.mode === "edit";
  const startIdx = Math.max(0, WIZARD_STEPS.findIndex((s) => s.key === p.startStep));
  const [idx, setIdx] = useState(startIdx);
  const [v, setV] = useState<WizardValues>(p.initial);
  const [shown, setShown] = useState<Partial<Record<StepKey, boolean>>>({});
  const [phase, setPhase] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; published: boolean; note: string | null } | null>(null);
  const [quota, setQuota] = useState<{ ok: true; data: ListingQuotaSummary } | { ok: false } | "memuat">("memuat");
  const [processing, setProcessing] = useState(0);
  const [uploadNote, setUploadNote] = useState<string | null>(null);
  const pending = useRef(new Map<string, Pending>());
  const fileRef = useRef<HTMLInputElement>(null);
  const [videoInput, setVideoInput] = useState("");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const createdId = useRef<string | null>(null);
  const createKey = useRef<string>(newIdempotencyKey());

  const step = WIZARD_STEPS[idx]!;
  const set = <K extends keyof WizardValues>(k: K, val: WizardValues[K]) => setV((x) => ({ ...x, [k]: val }));
  const errors: StepErrors = shown[step.key] ? validateStep(step.key, v, { locked }) : {};

  const provinces = useOptions("/ref-provinces", {}, true);
  const cities = useOptions("/ref-cities", { province_id: v.provinceId }, !!v.provinceId);
  const districts = useOptions("/ref-districts", { city_id: v.cityId }, !!v.cityId);
  const amenities = useOptions("/amenities", {}, idx >= 3);

  const orgs = p.orgs ?? [];
  const chosenOrg = orgs.find((o) => o.id === v.organizationId);
  // Organisasi listing yang sudah ada bisa tidak ada di daftar (mis. Anda sudah keluar): tetap ditampilkan sebagai organisasi.
  const ownerLabel = v.organizationId ? (chosenOrg?.name ?? "Organisasi") : "Pribadi";

  useEffect(() => {
    let live = true;
    setQuota("memuat");
    api
      .get<ListingQuotaSummary>("/agents/me/listing-quota", v.organizationId ? { organization_id: v.organizationId } : undefined, { redirectOnUnauthenticated: false })
      .then((r) => live && setQuota({ ok: true, data: r.data }))
      .catch(() => live && setQuota({ ok: false }));
    return () => {
      live = false;
    };
  }, [v.organizationId]);

  const level = quota !== "memuat" && quota.ok ? quotaLevel(quota.data.total_remaining) : null;
  const dirtyPrice = useMemo(() => parseNumber(v.price), [v.price]);

  function next() {
    setShown((s) => ({ ...s, [step.key]: true }));
    if (Object.keys(validateStep(step.key, v, { locked })).length > 0) return;
    setIdx((i) => Math.min(WIZARD_STEPS.length - 1, i + 1));
    window.scrollTo({ top: 0 });
  }
  function back() {
    setIdx((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0 });
  }
  function goto(key: StepKey) {
    setIdx(WIZARD_STEPS.findIndex((s) => s.key === key));
    window.scrollTo({ top: 0 });
  }

  async function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (fileRef.current) fileRef.current.value = "";
    if (files.length === 0) return;
    setMediaError(null);
    let count = v.photoUrls.length;
    const added: string[] = [];
    const problems: string[] = [];
    for (const f of files) {
      if (count >= MAX_PHOTOS) {
        problems.push(`Maksimal ${MAX_PHOTOS} foto; sisanya dilewati.`);
        break;
      }
      const pre = pickProblem(f);
      if (pre) {
        problems.push(`${f.name}: ${pre}`);
        continue;
      }
      setProcessing((n) => n + 1);
      try {
        const photo = await makeListingVariants(await loadSource(f));
        const key = PENDING + crypto.randomUUID();
        pending.current.set(key, { ...photo, preview: URL.createObjectURL(photo.blobs.sm), name: f.name });
        added.push(key);
        count += 1;
      } catch (e) {
        problems.push(`${f.name}: ${e instanceof Error ? e.message : "tidak bisa diproses."}`);
      } finally {
        setProcessing((n) => n - 1);
      }
    }
    if (added.length) setV((x) => ({ ...x, photoUrls: [...x.photoUrls, ...added] }));
    if (problems.length) setMediaError(problems.join(" "));
  }
  function removePhoto(u: string) {
    const p = pending.current.get(u);
    if (p) URL.revokeObjectURL(p.preview);
    pending.current.delete(u);
    set("photoUrls", v.photoUrls.filter((x) => x !== u));
  }
  function addVideo() {
    const u = videoInput.trim();
    if (!u) return;
    if (!isHttpsUrl(u)) return setMediaError("Tautan video harus diawali https://.");
    if (v.videoUrls.length >= MAX_VIDEOS) return setMediaError(`Maksimal ${MAX_VIDEOS} video.`);
    if (v.videoUrls.includes(u)) return setMediaError("Video itu sudah ditambahkan.");
    setMediaError(null);
    set("videoUrls", [...v.videoUrls, u]);
    setVideoInput("");
  }

  async function submit(publish: boolean) {
    const bad = firstInvalidStep(v, { locked });
    if (bad) {
      setShown((s) => ({ ...s, [bad]: true }));
      goto(bad);
      setError("Ada isian yang belum lengkap. Periksa langkah yang ditandai.");
      return;
    }
    setError(null);
    setPhase("saving");
    let id = edit ? p.listingId! : createdId.current;
    let stage = "menyimpan listing";
    try {
      if (edit) {
        await api.put(`/listings/${id}`, toUpdatePayload(v, { locked }));
      } else if (!id) {
        const res = await api.post<{ id: string }>("/listings", toCreatePayload(v), { idempotency: createKey.current });
        id = res.data.id;
        createdId.current = id;
      }
      stage = "fasilitas";
      const am = diffIds(p.existingAmenityIds ?? [], v.amenityIds);
      for (const a of am.attach) await api.post(`/listings/${id}/amenities`, { amenity_id: a }, { idempotency: true });
      for (const a of am.detach) await api.delete(`/listings/${id}/amenities/${a}`);

      stage = "mengunggah foto";
      const desiredPhotos = [...v.photoUrls];
      const toUpload = desiredPhotos.filter((u) => pending.current.get(u) && !pending.current.get(u)!.uploadedUrl);
      let n = 0;
      for (let i = 0; i < desiredPhotos.length; i++) {
        const entry = pending.current.get(desiredPhotos[i]!);
        if (!entry) continue;
        if (!entry.uploadedUrl) {
          n += 1;
          setUploadNote(`Mengunggah foto ${n} dari ${toUpload.length}…`);
          entry.uploadedUrl = await uploadListingPhoto(id!, entry);
        }
        desiredPhotos[i] = entry.uploadedUrl;
      }
      setUploadNote(null);

      stage = "media";
      const ph = diffMedia(p.existingPhotos ?? [], desiredPhotos);
      for (const m of ph.remove) await api.delete(`/listings/${id}/media/${m}`);
      for (const m of ph.add) await api.post(`/listings/${id}/media`, { media_type: "photo", url: m.url, is_cover: m.index === 0, sort_order: m.index }, { idempotency: true });
      const vids = (p.existingVideos ?? []).map((x) => ({ id: x.id, url: x.url }));
      const desiredVideos = [...v.videoUrls, ...(v.virtualTourUrl.trim() ? [v.virtualTourUrl.trim()] : [])];
      const vd = diffMedia(vids, desiredVideos);
      for (const m of vd.remove) await api.delete(`/listings/${id}/media/${m}`);
      for (const m of vd.add) await api.post(`/listings/${id}/media`, { media_type: m.url === v.virtualTourUrl.trim() ? "virtual_tour" : "video", url: m.url }, { idempotency: true });

      let published = edit && p.status === "published";
      let note: string | null = null;
      if (publish && !published) {
        stage = "penerbitan";
        try {
          await api.patch(`/listings/${id}/status`, { status: "published" }, { idempotency: true });
          published = true;
        } catch (err) {
          note = publishErrorMessage(err instanceof ApiClientError ? err : null);
        }
      }
      setDone({ id: id!, published, note });
      setPhase("done");
    } catch (err) {
      setPhase("idle");
      setUploadNote(null);
      const msg = err instanceof ApiClientError ? err.message : "Terjadi gangguan jaringan.";
      const saved = !edit && createdId.current ? " Listing sudah tersimpan sebagai draf; Anda bisa melengkapinya lewat Edit Listing." : "";
      setError(`Gagal pada tahap ${stage}: ${msg}${saved}`);
    }
  }

  // ── Keadaan sukses ──
  if (phase === "done" && done) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckCircleIcon size={32} />
        </span>
        <h1 className="text-headline">{done.published ? "Listing Berhasil Diterbitkan" : edit ? "Perubahan Tersimpan" : "Listing Tersimpan sebagai Draf"}</h1>
        <p className="text-body-md text-ink-500">
          {done.published ? `“${v.title.trim()}” sudah tayang publik dan bisa ditemukan di pencarian.` : `“${v.title.trim()}” tersimpan. ${edit ? "" : "Belum tayang publik."}`}
        </p>
        {done.note ? <Notice tone="warn">{done.note}</Notice> : null}
        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href={`/agent/listing/${done.id}` as Route}>Lihat Detail Listing</LinkButton>
          <LinkButton href={"/agent/listing" as Route} variant="secondary">
            Lihat Listing Saya
          </LinkButton>
        </div>
      </div>
    );
  }

  const isFinal = step.key === "terbit";
  const resubmit = edit && p.status === "rejected";
  const publishLabel = resubmit ? "Simpan & Ajukan Ulang" : edit && p.status === "published" ? "Simpan Perubahan" : "Terbitkan Listing";
  const title = edit ? "Edit Listing" : p.mode === "salin" ? "Duplikat Listing" : "Buat Listing Baru";

  return (
    <div className="mx-auto w-full max-w-[1100px] p-4 lg:p-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">{title}</h1>
          <p className="text-body-md text-ink-500">
            Langkah {idx + 1} dari {WIZARD_STEPS.length} — {step.label}
          </p>
        </div>
        <Link href={(edit ? `/agent/listing/${p.listingId}` : "/agent/listing") as Route} className="text-label-lg">
          Batal
        </Link>
      </div>

      <ol aria-label="Langkah" className="mb-6 flex gap-1.5 overflow-x-auto pb-1">
        {WIZARD_STEPS.map((s, i) => (
          <li key={s.key} className="min-w-0 flex-1">
            <button type="button" onClick={() => (i <= idx || edit ? setIdx(i) : undefined)} aria-current={i === idx ? "step" : undefined} className="flex w-full min-w-16 flex-col items-center gap-1.5 text-center">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-extrabold ${i === idx ? "bg-blue-600 text-white" : i < idx ? "bg-blue-100 text-blue-600" : "bg-ink-100 text-ink-500"}`}>{i < idx ? "✓" : i + 1}</span>
              <span className={`hidden text-[11px] font-bold sm:block ${i === idx ? "text-blue-600" : "text-ink-500"}`}>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>

      {error ? (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      {uploadNote ? (
        <div className="mb-4">
          <Notice tone="info">{uploadNote}</Notice>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 rounded-md border border-ink-100 bg-white p-5 sm:p-7">
        {step.key === "mulai" ? (
          <>
            <Header title="Mulai Listing Baru" text="Beri judul singkat dan tentukan atas nama siapa listing ini diterbitkan." />
            <Field label="Judul Listing" required error={errors.title}>
              {(a) => <Input maxLength={200} placeholder="Contoh: Rumah Minimalis 2 Lantai BSD City" value={v.title} onChange={(e) => set("title", e.target.value)} {...a} />}
            </Field>
            <div className="flex flex-col gap-2.5">
              <span className="text-label-lg">Pemilik Kuota & Konteks</span>
              <div role="radiogroup" aria-label="Pemilik kuota" className="grid gap-3 sm:grid-cols-2">
                <Choice checked={!v.organizationId} disabled={edit} title="Pribadi" hint="Milik akun Anda sendiri · memakai kuota pribadi" onClick={() => set("organizationId", "")} />
                <Choice
                  checked={!!v.organizationId}
                  disabled={edit || orgs.length === 0}
                  title="Organisasi"
                  hint={orgs.length === 0 ? "Anda belum menjadi anggota organisasi aktif" : "Tampil atas nama organisasi · memakai kuota bersama organisasi"}
                  onClick={() => set("organizationId", v.organizationId || orgs[0]!.id)}
                />
              </div>
              {v.organizationId && !edit && orgs.length > 1 ? (
                <Field label="Organisasi">
                  {(a) => (
                    <Select value={v.organizationId} onChange={(e) => set("organizationId", e.target.value)} {...a}>
                      {orgs.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </Field>
              ) : v.organizationId ? (
                <p className="text-body-md">
                  Organisasi: <strong>{ownerLabel}</strong>
                </p>
              ) : null}
              <p className="text-caption">
                {edit ? "Pemilik kuota tidak bisa diganti setelah listing dibuat. " : ""}Menerbitkan listing memakai kuota pemiliknya. Kuota organisasi dipakai bersama seluruh anggota aktif, dan listing tampil atas nama organisasi.
              </p>
            </div>
            <QuotaNote quota={quota} level={level} owner={v.organizationId ? ownerLabel : null} />
          </>
        ) : null}

        {step.key === "kategori" ? (
          <>
            <Header title="Kategori & Transaksi" text="Tentukan jenis properti dan cara transaksinya." />
            <Field label="Kategori" required error={errors.category}>
              {() => (
                <div role="radiogroup" aria-label="Kategori" className="grid gap-3 sm:grid-cols-2">
                  <Choice checked={v.category === "primary"} title="Primary" hint="Properti baru dari developer" onClick={() => set("category", "primary")} />
                  <Choice checked={v.category === "secondary"} title="Secondary" hint="Properti bekas / dijual ulang" onClick={() => set("category", "secondary")} />
                </div>
              )}
            </Field>
            <Field label="Jenis Transaksi" required error={errors.transactionType}>
              {() => (
                <div role="radiogroup" aria-label="Jenis transaksi" className="grid gap-3 sm:grid-cols-2">
                  <Choice checked={v.transactionType === "sale"} title="Dijual" onClick={() => setV((x) => ({ ...x, transactionType: "sale", priceUnit: defaultPriceUnit("sale") }))} />
                  <Choice checked={v.transactionType === "rent"} title="Disewakan" onClick={() => setV((x) => ({ ...x, transactionType: "rent", priceUnit: defaultPriceUnit("rent") }))} />
                </div>
              )}
            </Field>
          </>
        ) : null}

        {step.key === "lokasi" ? (
          <>
            <Header title="Lokasi" text="Alamat lengkap membantu properti tampil akurat di pencarian." />
            {locked ? <Notice tone="info">Alamat terkunci sejak publikasi pertama dan tidak bisa diubah. Wilayah tetap bisa dikoreksi.</Notice> : null}
            <Field label="Alamat Lengkap" required error={errors.address}>
              {(a) => <Textarea rows={2} maxLength={500} disabled={locked} placeholder="Jl. Kenanga Raya No. 12, Cluster Anggrek" value={v.address} onChange={(e) => set("address", e.target.value)} {...a} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Provinsi" required error={errors.provinceId} hint={provinces.failed ? "Daftar wilayah gagal dimuat. Muat ulang halaman." : undefined}>
                {(a) => (
                  <Select value={v.provinceId} onChange={(e) => setV((x) => ({ ...x, provinceId: e.target.value, cityId: "", districtId: "" }))} {...a}>
                    <option value="">Pilih provinsi</option>
                    {provinces.items.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Kota/Kabupaten" required error={errors.cityId}>
                {(a) => (
                  <Select value={v.cityId} disabled={!v.provinceId} onChange={(e) => setV((x) => ({ ...x, cityId: e.target.value, districtId: "" }))} {...a}>
                    <option value="">{v.provinceId ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
                    {cities.items.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Kecamatan" required error={errors.districtId}>
                {(a) => (
                  <Select value={v.districtId} disabled={!v.cityId} onChange={(e) => set("districtId", e.target.value)} {...a}>
                    <option value="">{v.cityId ? "Pilih kecamatan" : "Pilih kota dulu"}</option>
                    {districts.items.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <Field label="Area/Kompleks (opsional)" hint="Contoh: BSD City (maks. 20 karakter)." error={errors.areaKeyword}>
              {(a) => <Input maxLength={20} value={v.areaKeyword} onChange={(e) => set("areaKeyword", e.target.value)} {...a} />}
            </Field>
            <p className="text-caption">Titik peta belum tersedia (peta belum terhubung).</p>
          </>
        ) : null}

        {step.key === "detail" ? (
          <>
            <Header title="Detail Properti" text="Spesifikasi fisik properti." />
            {locked ? <Notice tone="info">Tipe properti serta luas tanah dan bangunan terkunci sejak publikasi pertama.</Notice> : null}
            <Field label="Tipe Properti" required error={errors.propertyType}>
              {() => (
                <div role="radiogroup" aria-label="Tipe properti" className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((t) => (
                    <button key={t} type="button" role="radio" aria-checked={v.propertyType === t} disabled={locked} onClick={() => set("propertyType", t)} className={`h-11 rounded-pill border-[1.5px] px-5 text-label-lg disabled:cursor-not-allowed disabled:opacity-60 ${v.propertyType === t ? "border-blue-600 bg-blue-600 text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500"}`}>
                      {typeLabel(t)}
                    </button>
                  ))}
                </div>
              )}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Num label="Luas Tanah (m²)" k="landArea" v={v} set={set} errors={errors} disabled={locked} decimal />
              <Num label="Luas Bangunan (m²)" k="buildingArea" v={v} set={set} errors={errors} disabled={locked} decimal />
              <Num label="Kamar Tidur" k="bedrooms" v={v} set={set} errors={errors} />
              <Num label="Kamar Mandi" k="bathrooms" v={v} set={set} errors={errors} />
              <Num label="Jumlah Lantai" k="floors" v={v} set={set} errors={errors} />
              <Num label="Kapasitas Carport" k="carport" v={v} set={set} errors={errors} />
              <Num label="Daya Listrik (VA)" k="electricalPower" v={v} set={set} errors={errors} />
              <Num label="Tahun Dibangun" k="yearBuilt" v={v} set={set} errors={errors} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Sumber Air">
                {(a) => (
                  <Select value={v.waterSource} onChange={(e) => set("waterSource", e.target.value)} {...a}>
                    <option value="">Tidak diisi</option>
                    {WATER_SOURCES.map((w) => (
                      <option key={w} value={w}>
                        {WATER_LABEL[w] ?? w}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Perabotan">
                {(a) => (
                  <Select value={v.furnishing} onChange={(e) => set("furnishing", e.target.value)} {...a}>
                    <option value="">Tidak diisi</option>
                    {FURNISHINGS.map((f) => (
                      <option key={f} value={f}>
                        {FURNISHING_LABEL[f] ?? f}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <div className="flex flex-col gap-2.5">
              <span className="text-label-lg">Fasilitas</span>
              {amenities.failed ? <p className="text-caption text-danger-600">Daftar fasilitas gagal dimuat.</p> : null}
              <div className="flex flex-wrap gap-2">
                {amenities.items.map((a) => {
                  const on = v.amenityIds.includes(a.id);
                  return (
                    <button key={a.id} type="button" aria-pressed={on} onClick={() => set("amenityIds", on ? v.amenityIds.filter((x) => x !== a.id) : [...v.amenityIds, a.id])} className={`h-10 rounded-pill border-[1.5px] px-4 text-[13px] font-bold ${on ? "border-blue-600 bg-blue-50 text-blue-600" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500"}`}>
                      {on ? "✓ " : ""}
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        {step.key === "harga" ? (
          <>
            <Header title="Harga" text="Tentukan harga dan satuannya." />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Harga (Rp)" required error={errors.price} hint={dirtyPrice ? formatListingPrice(dirtyPrice, v.priceUnit === "total" ? null : v.priceUnit) : undefined}>
                {(a) => <Input inputMode="numeric" placeholder="850.000.000" value={v.price} onChange={(e) => set("price", formatPriceInput(e.target.value))} {...a} />}
              </Field>
              <Field label="Satuan">
                {(a) => (
                  <Select value={v.priceUnit} onChange={(e) => set("priceUnit", e.target.value as WizardValues["priceUnit"])} {...a}>
                    {PRICE_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {UNIT_LABEL[u]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <label className="flex min-h-11 items-center gap-3">
              <Switch checked={v.isNegotiable} onChange={(on) => set("isNegotiable", on)} aria-label="Harga bisa dinegosiasi" />
              <span className="text-body-md">Harga bisa dinegosiasi</span>
            </label>
          </>
        ) : null}

        {step.key === "legalitas" ? (
          <>
            <Header title="Legalitas" text="Informasi legal membangun kepercayaan calon pembeli. Semua isian opsional." />
            <Field label="Jenis Sertifikat">
              {() => (
                <div role="radiogroup" aria-label="Jenis sertifikat" className="flex flex-wrap gap-2">
                  {CERTIFICATES.map((c) => (
                    <button key={c} type="button" role="radio" aria-checked={v.certificateType === c} onClick={() => set("certificateType", v.certificateType === c ? "" : c)} className={`h-11 rounded-pill border-[1.5px] px-5 text-label-lg ${v.certificateType === c ? "border-blue-600 bg-blue-600 text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500"}`}>
                      {CERTIFICATE_LABEL[c] ?? c}
                    </button>
                  ))}
                </div>
              )}
            </Field>
            <label className="flex min-h-11 items-center gap-3">
              <Switch checked={v.certificateTransferred} onChange={(on) => set("certificateTransferred", on)} disabled={!v.certificateType} aria-label="Sertifikat bisa dibalik nama" />
              <span className="text-body-md">Sertifikat bisa dibalik nama</span>
            </label>
            <Field label="Status IMB">
              {() => (
                <div role="radiogroup" aria-label="Status IMB" className="flex flex-wrap gap-2">
                  {IMB_STATUSES.map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={v.imbStatus === s} onClick={() => set("imbStatus", v.imbStatus === s ? "" : s)} className={`h-11 rounded-pill border-[1.5px] px-5 text-label-lg ${v.imbStatus === s ? "border-blue-600 bg-blue-600 text-white" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500"}`}>
                      {IMB_LABEL[s] ?? s}
                    </button>
                  ))}
                </div>
              )}
            </Field>
            <label className="flex min-h-11 items-start gap-3">
              <input type="checkbox" checked={v.disputeFree} onChange={(e) => set("disputeFree", e.target.checked)} className="mt-1 h-[18px] w-[18px] flex-none accent-blue-600" />
              <span className="text-body-md">Saya menyatakan properti ini bebas sengketa</span>
            </label>
          </>
        ) : null}

        {step.key === "media" ? (
          <>
            <Header title="Media" text="Tambahkan foto dari perangkat Anda. Foto pertama menjadi sampul." />
            <Notice tone="info">
              Pilih foto langsung dari kamera atau galeri (hingga 25 MB per foto, JPG/PNG/WebP). Foto dikecilkan otomatis di perangkat Anda dan diunggah saat listing disimpan. Maksimal {MAX_PHOTOS} foto dan {MAX_VIDEOS} video.
            </Notice>
            <div className="flex flex-col gap-2">
              <input ref={fileRef} id="foto-file" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => void addFiles(e.target.files)} />
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" loading={processing > 0} disabled={v.photoUrls.length >= MAX_PHOTOS || phase === "saving"} onClick={() => fileRef.current?.click()}>
                  {processing > 0 ? `Memproses ${processing} foto…` : "+ Tambah Foto"}
                </Button>
                <span className="text-caption">
                  {v.photoUrls.length} dari {MAX_PHOTOS} foto
                </span>
              </div>
              {mediaError || errors.photoUrls ? (
                <p role="alert" className="text-caption text-danger-600">
                  {mediaError ?? errors.photoUrls}
                </p>
              ) : null}
            </div>
            {v.photoUrls.length === 0 ? (
              <p className="text-body-md text-ink-500">Belum ada foto. Listing dengan foto lebih menarik bagi calon pembeli.</p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {v.photoUrls.map((u, i) => {
                  const pend = pending.current.get(u);
                  return (
                    <li key={u} className="flex items-center gap-3 rounded-md border border-ink-100 p-2.5">
                      {/* Pratinjau foto (varian kecil atau berkas lokal); gambar biasa tanpa optimasi Next. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={pend ? pend.preview : (listingPhotoUrl(u, "sm") ?? u)} alt="" className="h-16 w-20 flex-none rounded-sm bg-ink-100 object-cover" />
                      <div className="min-w-0 flex-1">
                        {i === 0 ? <Badge tone="info" dot={false}>Sampul</Badge> : null}
                        <p className="truncate text-caption">{pend ? `${pend.name} · diunggah saat Simpan` : `Foto ${i + 1}`}</p>
                      </div>
                      <div className="flex flex-none flex-col gap-1">
                        {i > 0 ? (
                          <Button size="sm" variant="ghost" onClick={() => set("photoUrls", [u, ...v.photoUrls.filter((x) => x !== u)])}>
                            Jadikan sampul
                          </Button>
                        ) : null}
                        <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => removePhoto(u)}>
                          Hapus
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <label htmlFor="video-url" className="text-label-lg">
                Tautan video (opsional)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input id="video-url" inputMode="url" placeholder="https://…/tur-rumah.mp4" value={videoInput} onChange={(e) => setVideoInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVideo())} className="min-w-0 flex-1" />
                <Button variant="secondary" onClick={addVideo} disabled={!videoInput.trim()}>
                  Tambah Video
                </Button>
              </div>
              {v.videoUrls.length > 0 ? (
                <ul className="flex flex-col gap-1.5">
                  {v.videoUrls.map((u) => (
                    <li key={u} className="flex items-center justify-between gap-3 rounded-sm bg-ink-50 px-3 py-2">
                      <span className="min-w-0 truncate text-caption">{u}</span>
                      <Button size="sm" variant="ghost" className="text-danger-600" onClick={() => set("videoUrls", v.videoUrls.filter((x) => x !== u))}>
                        Hapus
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Field label="Tautan virtual tour (opsional)" error={errors.virtualTourUrl}>
              {(a) => <Input inputMode="url" placeholder="https://…" value={v.virtualTourUrl} onChange={(e) => set("virtualTourUrl", e.target.value)} {...a} />}
            </Field>
          </>
        ) : null}

        {step.key === "kontak" ? (
          <>
            <Header title="Kontak & Deskripsi" text="Bagaimana calon pembeli bisa menghubungi Anda, dan ceritakan properti ini." />
            <Field label="Nomor WhatsApp" required error={errors.whatsapp} hint="Nomor ini tampil di listing untuk tombol Chat via WhatsApp.">
              {(a) => <Input inputMode="tel" maxLength={20} placeholder="0812-xxxx-xxxx" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} {...a} />}
            </Field>
            <Field label="Deskripsi Listing" hint={`${nf.format(v.description.length)} karakter`}>
              {(a) => <Textarea rows={7} placeholder="Rumah minimalis modern 2 lantai, kondisi siap huni…" value={v.description} onChange={(e) => set("description", e.target.value)} {...a} />}
            </Field>
            <Field label="Meta Title SEO (opsional)" hint={`${v.metaTitle.length}/70`} error={errors.metaTitle}>
              {(a) => <Input maxLength={70} value={v.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} {...a} />}
            </Field>
            <Field label="Meta Description SEO (opsional)" hint={`${v.metaDescription.length}/160`} error={errors.metaDescription}>
              {(a) => <Textarea rows={2} maxLength={160} value={v.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} {...a} />}
            </Field>
          </>
        ) : null}

        {isFinal ? (
          <>
            <Header title="Preview & Terbitkan" text="Periksa kembali sebelum menerbitkan. Listing langsung tayang tanpa menunggu moderasi." />
            <Summary title="Konteks & Kategori" onEdit={() => goto("mulai")} rows={[["Judul", v.title.trim()], ["Pemilik kuota", ownerLabel], ["Kategori / Transaksi", `${v.category === "primary" ? "Primary" : "Secondary"} · ${v.transactionType === "rent" ? "Disewakan" : "Dijual"}`]]} />
            <Summary title="Lokasi & Properti" onEdit={() => goto("lokasi")} rows={[["Alamat", v.address.trim()], ["Wilayah", [districts.items.find((x) => x.id === v.districtId)?.name, cities.items.find((x) => x.id === v.cityId)?.name, provinces.items.find((x) => x.id === v.provinceId)?.name].filter(Boolean).join(", ") || "—"], ["Spesifikasi", specLine(v, typeLabel) || "—"]]} />
            <Summary title="Harga & Legalitas" onEdit={() => goto("harga")} rows={[["Harga", `${dirtyPrice ? formatListingPrice(dirtyPrice, v.priceUnit === "total" ? null : v.priceUnit) : "—"}${v.isNegotiable ? " (nego)" : ""}`], ["Sertifikat", v.certificateType ? `${CERTIFICATE_LABEL[v.certificateType] ?? v.certificateType}${v.certificateTransferred ? " · Bisa dibalik nama" : ""}` : "—"]]} />
            <Summary title="Media & Kontak" onEdit={() => goto("media")} rows={[["Media", `${v.photoUrls.length} foto${v.videoUrls.length ? ` · ${v.videoUrls.length} video` : ""}`], ["WhatsApp", v.whatsapp.trim()]]} />
            {!edit ? (
              <div className="rounded-md border border-ink-100 p-4">
                <p className="mb-2 text-label-lg">Kuota & Masa Tayang</p>
                <QuotaNote quota={quota} level={level} owner={v.organizationId ? ownerLabel : null} />
                {quota !== "memuat" && quota.ok ? <p className="mt-2 text-caption">Masa tayang {quota.data.validity_days} hari + {quota.data.grace_days} hari masa tenggang. Urutan pemakaian: Gratis → Pro → Slot beli.</p> : null}
              </div>
            ) : null}
            <Notice tone="info">Listing langsung tayang publik setelah diterbitkan — tidak ada antrean moderasi sebelum tampil.</Notice>
          </>
        ) : null}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 bg-white px-4 py-3 lg:-mx-8 lg:px-8">
        <Button variant="secondary" onClick={back} disabled={idx === 0 || phase === "saving"}>
          ← Kembali
        </Button>
        {isFinal ? (
          <div className="flex flex-wrap justify-end gap-2.5">
            {!edit || p.status === "draft" ? (
              <Button variant="secondary" loading={phase === "saving"} onClick={() => submit(false)}>
                {edit ? "Simpan Perubahan" : "Simpan sebagai Draf"}
              </Button>
            ) : null}
            {!edit || p.status === "draft" || p.status === "rejected" ? (
              <Button loading={phase === "saving"} onClick={() => submit(true)} disabled={!edit && level === "penuh"}>
                {phase === "saving" ? "Menerbitkan…" : edit && p.status === "draft" ? "Simpan & Terbitkan" : publishLabel}
              </Button>
            ) : (
              <Button loading={phase === "saving"} onClick={() => submit(false)}>
                {phase === "saving" ? "Menyimpan…" : "Simpan Perubahan"}
              </Button>
            )}
          </div>
        ) : (
          <Button onClick={next}>Lanjut →</Button>
        )}
      </div>
    </div>
  );
}

function Header({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h2 className="text-title-lg">{title}</h2>
      <p className="text-body-md text-ink-500">{text}</p>
    </div>
  );
}

function Num({ label, k, v, set, errors, disabled, decimal }: { label: string; k: keyof WizardValues; v: WizardValues; set: <K extends keyof WizardValues>(k: K, val: WizardValues[K]) => void; errors: StepErrors; disabled?: boolean; decimal?: boolean }) {
  return (
    <Field label={label} error={errors[k as string]}>
      {(a) => <Input inputMode={decimal ? "decimal" : "numeric"} disabled={disabled} value={v[k] as string} onChange={(e) => set(k, e.target.value as never)} {...a} />}
    </Field>
  );
}

function Summary({ title, rows, onEdit }: { title: string; rows: [string, string][]; onEdit: () => void }) {
  return (
    <div className="rounded-md border border-ink-100 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-label-lg">{title}</span>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Ubah
        </Button>
      </div>
      <dl className="flex flex-col gap-1.5">
        {rows.map(([k, val]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-caption">{k}</dt>
            <dd className="min-w-0 text-right text-body-md font-bold break-words">{val || "—"}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function QuotaNote({ quota, level, owner }: { quota: { ok: true; data: ListingQuotaSummary } | { ok: false } | "memuat"; level: ReturnType<typeof quotaLevel> | null; owner: string | null }) {
  if (quota === "memuat") return <p className="text-caption">Memeriksa kuota…</p>;
  if (!quota.ok) return <Notice tone="warn">Kuota gagal dimuat. Anda tetap bisa menyusun listing; kuota diperiksa saat menerbitkan (bila habis, listing tetap tersimpan sebagai draf).</Notice>;
  const left = quota.data.total_remaining;
  if (level === "penuh")
    return (
      <Notice tone="danger">
        <strong>Kuota habis.</strong> Anda tetap bisa menyusun listing dan menyimpannya sebagai draf; penerbitan menunggu kuota tersedia (reset tanggal 1 atau beli slot).
      </Notice>
    );
  if (level === "hampir_habis") return <Notice tone="warn">Sisa jatah menipis ({left}). Anda tetap bisa menyusun listing; penerbitan memakai jatah yang tersisa.</Notice>;
  return <p className="text-body-md text-ink-700">{owner ? `Jatah organisasi ${owner}` : "Jatah penerbitan"} tersisa: <strong>{left}</strong>. Menerbitkan memakai 1 jatah.</p>;
}
