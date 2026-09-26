"use client";

// components/agent/ProfileForm.tsx — formulir Profil Saya (M02, wireframe 01-Agent/M02-Profil-Saya): foto, informasi pribadi dan profesional, KTP (slot), organisasi, title, privasi, dan ringkasan
// di kanan. Simpan = PUT /users/profile (upsert; profil pertama dibuat server dengan slug publik). Empat keadaan: idle, menyimpan, sukses, gagal. Bilah simpan muncul saat ada perubahan.
// Belum ada: unggah foto profil (API hanya menerima avatar_url berupa teks) dan mengosongkan provinsi/kota (API tidak menerima null) — lihat audit/FRONTEND_GAPS.md.
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { BuildingIcon, CheckCircleIcon, CloseIcon, InfoIcon, TrophyIcon } from "@/components/ui/icons";
import { Switch } from "@/components/ui/Switch";
import { ApiClientError, api } from "@/lib/api-client";
import { SITE_PROFILE_PREFIX, SLUG_REASON_TEXT, canChangeSlug, finalizeSlug, nextSlugChangeAt, normalizeSlugInput, slugShapeError, type SlugReason } from "@/lib/agent/slug";
import { formatDate } from "@/lib/format";
import { BIO_MAX, addSpecialization, toProfilePayload, validateProfile, type ProfileErrors, type ProfileFormValues } from "@/lib/validation/profile-form";

type Option = { id: string; name: string };
export type ProfileFormProps = {
  exists: boolean;
  initial: ProfileFormValues;
  avatarUrl: string | null;
  publicSlug: string | null;
  /** Terakhir kali alamat profil diganti (null = belum pernah); dasar batas 1x per bulan kalender WIB. */
  slugChangedAt: string | null;
  soldCount: number;
  rentedCount: number;
  provinceName: string | null;
  cityName: string | null;
  organization: { name: string; slug: string | null } | null;
  titles: { name: string; kind: "primary" | "additional" }[];
  /** Kartu Verifikasi KTP (komponen klien terpisah) disisipkan di antara Informasi Profesional dan Organisasi. */
  ktpSlot: ReactNode;
};

function Card({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function ToggleRow({ id, title, hint, children }: { id: string; title: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-ink-100 py-3.5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p id={id} className="text-label-lg">
          {title}
        </p>
        <p className="text-caption">{hint}</p>
      </div>
      {children}
    </div>
  );
}

type SlugCheck = { state: "idle" | "checking" | "ok" | "bad" | "error"; text: string | null };
type SlugAvailability = { available: boolean; reason: SlugReason | null; can_change: boolean; next_change_at: string | null };

export function ProfileForm(p: ProfileFormProps) {
  const router = useRouter();
  const [saved, setSaved] = useState<ProfileFormValues>(p.initial);
  const [v, setV] = useState<ProfileFormValues>(p.initial);
  const [tried, setTried] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [tag, setTag] = useState("");
  const [tagError, setTagError] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<Option[]>(p.initial.provinceId && p.provinceName ? [{ id: p.initial.provinceId, name: p.provinceName }] : []);
  const [cities, setCities] = useState<Option[]>(p.initial.cityId && p.cityName ? [{ id: p.initial.cityId, name: p.cityName }] : []);
  const [regionError, setRegionError] = useState(false);
  const [slugCheck, setSlugCheck] = useState<SlugCheck>({ state: "idle", text: null });
  const [confirmSlug, setConfirmSlug] = useState(false);

  const dirty = useMemo(() => JSON.stringify(v) !== JSON.stringify(saved), [v, saved]);
  const slugChanged = p.exists && v.publicSlug !== saved.publicSlug;
  const mayChangeSlug = canChangeSlug(p.slugChangedAt);
  const nextChange = formatDate(nextSlugChangeAt().toISOString());
  const errors: ProfileErrors = tried ? validateProfile(v) : {};
  const set = <K extends keyof ProfileFormValues>(k: K, val: ProfileFormValues[K]) => {
    setV((x) => ({ ...x, [k]: val }));
    setNotice(null);
  };

  useEffect(() => {
    let live = true;
    api
      .get<Option[]>("/ref-provinces", { limit: 100 })
      .then((r) => live && setProvinces(r.data))
      .catch(() => live && setRegionError(true));
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    if (!v.provinceId) return;
    let live = true;
    api
      .get<Option[]>("/ref-cities", { province_id: v.provinceId, limit: 100 })
      .then((r) => live && setCities(r.data))
      .catch(() => live && setRegionError(true));
    return () => {
      live = false;
    };
  }, [v.provinceId]);

  // Pengecekan alamat profil: bentuk diperiksa langsung, ketersediaan ke server setelah berhenti mengetik.
  useEffect(() => {
    if (!slugChanged) {
      setSlugCheck({ state: "idle", text: null });
      return;
    }
    const slug = finalizeSlug(v.publicSlug);
    const shape = slugShapeError(slug);
    if (shape) {
      setSlugCheck({ state: "bad", text: shape });
      return;
    }
    setSlugCheck({ state: "checking", text: "Memeriksa ketersediaan…" });
    let live = true;
    const t = setTimeout(() => {
      api
        .get<SlugAvailability>("/agents/me/slug-availability", { slug }, { redirectOnUnauthenticated: false })
        .then((r) => {
          if (!live) return;
          if (r.data.reason === "sama") setSlugCheck({ state: "idle", text: null });
          else if (r.data.reason) setSlugCheck({ state: "bad", text: SLUG_REASON_TEXT[r.data.reason] ?? "Alamat tidak bisa dipakai." });
          else setSlugCheck({ state: "ok", text: "Alamat tersedia." });
        })
        .catch(() => live && setSlugCheck({ state: "error", text: "Ketersediaan belum bisa diperiksa. Coba lagi beberapa saat lagi." }));
    }, 450);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [slugChanged, v.publicSlug]);

  function addTag() {
    const res = addSpecialization(v.specialization, tag);
    setTagError(res.error ?? null);
    if (!res.error && res.list !== v.specialization) {
      set("specialization", res.list);
      setTag("");
    }
  }

  function requestSave() {
    setTried(true);
    if (Object.keys(validateProfile(v)).length > 0) {
      setNotice({ kind: "err", text: "Periksa kembali isian yang ditandai." });
      return;
    }
    if (slugChanged) {
      if (!mayChangeSlug || slugCheck.state !== "ok") {
        setNotice({ kind: "err", text: mayChangeSlug ? "Alamat profil belum bisa disimpan. Periksa alamat yang Anda pilih." : `Alamat profil hanya bisa diganti 1 kali per bulan. Bisa diganti lagi mulai ${nextChange}.` });
        return;
      }
      setConfirmSlug(true);
      return;
    }
    void save();
  }

  async function save() {
    setConfirmSlug(false);
    setSaving(true);
    setNotice(null);
    try {
      await api.put("/users/profile", toProfilePayload({ ...v, publicSlug: finalizeSlug(v.publicSlug) }, { slugChanged }));
      const done = { ...v, publicSlug: finalizeSlug(v.publicSlug) };
      setV(done);
      setSaved(done);
      setTried(false);
      setNotice({ kind: "ok", text: "Profil berhasil disimpan." });
      router.refresh();
    } catch (err) {
      setNotice({ kind: "err", text: err instanceof ApiClientError && err.code !== "NETWORK_ERROR" ? err.message : "Gagal menyimpan perubahan. Periksa koneksi Anda dan coba lagi." });
    } finally {
      setSaving(false);
    }
  }

  const displayName = (saved.fullName || v.fullName).trim() || "Agent";
  const place = [saved.coverageArea.trim()].filter(Boolean).join("");

  return (
    <div className="mx-auto w-full max-w-[1200px] p-4 lg:p-8">
      <div className="mb-5">
        <h1 className="text-headline">Profil Saya</h1>
        <p className="text-body-md text-ink-500">Profil yang lengkap tampil lebih dipercaya di pencarian publik dan meningkatkan peluang closing.</p>
      </div>

      {!p.exists ? (
        <div role="status" className="mb-5 flex items-start gap-3 rounded-md border border-blue-200 bg-info-100 p-4">
          <InfoIcon size={18} className="mt-0.5 flex-none text-info-600" />
          <div>
            <p className="text-label-lg">Lengkapi profil Anda</p>
            <p className="text-body-md text-ink-700">Isi nama dan nomor WhatsApp lalu simpan. Setelah itu Anda bisa memverifikasi KTP dan profil publik Anda dibuat.</p>
          </div>
        </div>
      ) : null}

      {notice ? (
        <div
          role={notice.kind === "err" ? "alert" : "status"}
          className={`mb-5 flex items-center gap-2.5 rounded-md border p-3.5 text-body-md ${notice.kind === "ok" ? "border-success-600/30 bg-success-100 text-success-600" : "border-danger-600/30 bg-danger-100 text-danger-600"}`}
        >
          {notice.kind === "ok" ? <CheckCircleIcon size={18} /> : null}
          {notice.text}
        </div>
      ) : null}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card title="Foto Profil">
            <div className="flex items-center gap-4">
              <Avatar name={displayName} imageUrl={p.avatarUrl} size={72} />
              <div className="flex flex-col gap-1.5">
                <Button variant="secondary" size="sm" disabled className="self-start">
                  Ganti Foto
                </Button>
                <p className="text-caption">Unggah foto profil belum tersedia. Sementara ini tampil inisial nama Anda.</p>
              </div>
            </div>
          </Card>

          <Card title="Informasi Pribadi">
            <Field label="Nama Lengkap" required error={errors.fullName}>
              {(a) => <Input maxLength={150} autoComplete="name" value={v.fullName} onChange={(e) => set("fullName", e.target.value)} {...a} />}
            </Field>
            <Field label="Nomor WhatsApp" required hint="Selalu tampil di profil publik agar calon klien bisa menghubungi Anda." error={errors.whatsapp}>
              {(a) => <Input inputMode="tel" autoComplete="tel" maxLength={20} placeholder="08xx-xxxx-xxxx" value={v.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} {...a} />}
            </Field>
            <Field label="Bio" error={errors.bio} hint={`${v.bio.length.toLocaleString("id-ID")}/${BIO_MAX.toLocaleString("id-ID")}`}>
              {(a) => <Textarea rows={4} value={v.bio} onChange={(e) => set("bio", e.target.value)} {...a} />}
            </Field>
          </Card>

          {p.exists ? (
            <Card title="Alamat Profil Publik">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="slug" className="text-label-lg">
                  Alamat profil Anda
                </label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <span className="flex-none text-body-md text-ink-500">{SITE_PROFILE_PREFIX}</span>
                  <Input
                    id="slug"
                    value={v.publicSlug}
                    maxLength={60}
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    disabled={!mayChangeSlug}
                    aria-invalid={slugCheck.state === "bad" ? true : undefined}
                    aria-describedby="slug-status"
                    onChange={(e) => set("publicSlug", normalizeSlugInput(e.target.value))}
                    className="min-w-0 flex-1"
                  />
                </div>
                <p id="slug-status" role={slugCheck.state === "bad" || slugCheck.state === "error" ? "alert" : "status"} className={`min-h-5 text-caption ${slugCheck.state === "bad" || slugCheck.state === "error" ? "text-danger-600" : slugCheck.state === "ok" ? "text-success-600" : ""}`}>
                  {slugCheck.text}
                </p>
              </div>
              <p className="text-caption">
                {mayChangeSlug
                  ? "Alamat ini dipakai untuk membagikan profil Anda. Bisa diganti 1 kali per bulan kalender (reset tanggal 1). Tautan lama otomatis dialihkan ke yang baru."
                  : `Alamat sudah diganti bulan ini. Bisa diganti lagi mulai ${nextChange}.`}
              </p>
            </Card>
          ) : null}

          <Card title="Informasi Profesional">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="spec" className="text-label-lg">
                Spesialisasi
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-sm border-[1.5px] border-ink-100 p-2.5">
                {v.specialization.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 rounded-pill bg-blue-50 py-1 pr-1 pl-3 text-[12px] font-bold text-blue-600">
                    {s}
                    <button type="button" aria-label={`Hapus ${s}`} onClick={() => set("specialization", v.specialization.filter((x) => x !== s))} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-blue-100">
                      <CloseIcon size={12} />
                    </button>
                  </span>
                ))}
                <input
                  id="spec"
                  value={tag}
                  maxLength={40}
                  placeholder={v.specialization.length === 0 ? "mis. Rumah Tapak" : "Tambah…"}
                  onChange={(e) => {
                    setTag(e.target.value);
                    setTagError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="h-9 min-w-32 flex-1 bg-transparent text-body-md outline-none"
                />
                <Button type="button" variant="ghost" size="sm" onClick={addTag} disabled={!tag.trim()}>
                  + Tambah
                </Button>
              </div>
              {tagError || errors.specialization ? (
                <p role="alert" className="text-caption text-danger-600">
                  {tagError ?? errors.specialization}
                </p>
              ) : (
                <p className="text-caption">Tekan Enter untuk menambah. Maksimal 8.</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Area Cakupan" error={errors.coverageArea}>
                {(a) => <Input maxLength={255} placeholder="mis. BSD City & sekitarnya" value={v.coverageArea} onChange={(e) => set("coverageArea", e.target.value)} {...a} />}
              </Field>
              <Field label="Nomor Lisensi (opsional)" hint="Tampil di profil publik sebagai branding Anda." error={errors.licenseNumber}>
                {(a) => <Input maxLength={50} value={v.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} {...a} />}
              </Field>
            </div>
            <Field label="Nama Kantor (opsional)" hint="Tampil di profil publik di samping nama organisasi." error={errors.officeName}>
              {(a) => <Input maxLength={150} value={v.officeName} onChange={(e) => set("officeName", e.target.value)} {...a} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Provinsi" hint={regionError ? "Daftar wilayah gagal dimuat. Muat ulang halaman." : undefined}>
                {(a) => (
                  <Select
                    value={v.provinceId}
                    onChange={(e) => {
                      set("provinceId", e.target.value);
                      set("cityId", "");
                      setCities([]);
                    }}
                    {...a}
                  >
                    <option value="">Pilih provinsi</option>
                    {provinces.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Kota/Kabupaten" error={errors.cityId}>
                {(a) => (
                  <Select value={v.cityId} disabled={!v.provinceId} onChange={(e) => set("cityId", e.target.value)} {...a}>
                    <option value="">{v.provinceId ? "Pilih kota/kabupaten" : "Pilih provinsi dulu"}</option>
                    {cities.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
          </Card>

          {p.ktpSlot}

          <Card title="Organisasi">
            {p.organization ? (
              <div className="flex items-center gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 flex-none items-center justify-center rounded-sm bg-gold-100 text-gold-700">
                  <BuildingIcon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-label-lg">{p.organization.name}</p>
                  <p className="text-caption">Nama kantor tampil di profil publik Anda</p>
                </div>
                {p.organization.slug ? (
                  <LinkButton href={`/organisasi/${p.organization.slug}` as Route} variant="secondary" size="sm">
                    Lihat
                  </LinkButton>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-body-md text-ink-500">Anda belum tergabung ke organisasi manapun. Bergabung membuat listing Anda tampil di bawah nama kantor.</p>
                <LinkButton href={"/organisasi" as Route} variant="secondary" size="sm">
                  Jelajahi Organisasi
                </LinkButton>
              </div>
            )}
          </Card>

          <Card title="Title & Penghargaan">
            {p.titles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {p.titles.map((t) => (
                  <span key={t.name} className="inline-flex items-center gap-1.5 rounded-pill bg-gold-100 px-3 py-1.5 text-[12px] font-bold text-gold-700">
                    <TrophyIcon size={14} />
                    {t.name}
                    {t.kind === "primary" ? <span className="font-normal">· utama</span> : null}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-body-md text-ink-500">Belum ada title yang ditampilkan di profil. Ajukan bukti kualifikasi untuk mulai mendapatkan title/penghargaan.</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-md text-caption">Maksimal 1 title utama + 3 tambahan yang tampil di profil publik Anda. Anda memilih dan mengurutkannya di Kelola Presentasi.</p>
              <Badge tone="neutral" dot={false}>
                Kelola Presentasi · segera hadir
              </Badge>
            </div>
          </Card>

          <Card title="Privasi & Visibilitas">
            <div>
              <ToggleRow id="pv-public" title="Profil Publik" hint="Saat nonaktif, profil Anda tidak muncul di pencarian dan tidak bisa diakses lewat tautan langsung.">
                <Switch checked={v.profileVisibility === "public"} onChange={(on) => set("profileVisibility", on ? "public" : "private")} aria-labelledby="pv-public" />
              </ToggleRow>
              <ToggleRow id="pv-wa" title="Kontak WhatsApp" hint="Selalu tampil di profil publik agar calon klien yang mencari agen di wilayah Anda dapat menghubungi. Ubah nomornya di Informasi Pribadi.">
                <Badge tone="info" dot={false} className="mt-1">
                  Selalu tampil
                </Badge>
              </ToggleRow>
              <ToggleRow id="pv-cta" title="Tombol CTA di Hasil Pencarian" hint="Opt-in eksplisit untuk menampilkan tombol hubungi langsung di kartu hasil pencarian Agen.">
                <Switch checked={v.publicCtaEnabled} onChange={(on) => set("publicCtaEnabled", on)} aria-labelledby="pv-cta" />
              </ToggleRow>
            </div>
          </Card>
        </div>

        <aside aria-label="Ringkasan profil" className="flex flex-col items-center gap-3 rounded-md border border-ink-100 bg-white p-5 text-center lg:sticky lg:top-6">
          <Avatar name={displayName} imageUrl={p.avatarUrl} size={84} />
          <div className="min-w-0">
            <p className="text-title-md break-words">{displayName}</p>
            {place ? <p className="text-caption break-words">{place}</p> : null}
          </div>
          {p.publicSlug && saved.profileVisibility === "public" ? (
            <Link href={`/agen/${p.publicSlug}` as Route} target="_blank" rel="noopener" className="flex min-h-11 w-full items-center justify-center rounded-pill border-[1.5px] border-ink-100 text-label-lg no-underline hover:bg-ink-50 hover:no-underline">
              Lihat sebagai Publik
            </Link>
          ) : (
            <p className="text-caption">{p.exists ? "Profil publik nonaktif." : "Profil publik dibuat setelah Anda menyimpan."}</p>
          )}
          <dl className="flex w-full justify-center gap-8 border-t border-ink-100 pt-3.5">
            <div>
              <dd className="text-title-md">{p.soldCount}</dd>
              <dt className="text-caption">Terjual</dt>
            </div>
            <div>
              <dd className="text-title-md">{p.rentedCount}</dd>
              <dt className="text-caption">Tersewa</dt>
            </div>
          </dl>
          <p className="text-caption">Statistik dihitung otomatis oleh sistem, tidak bisa diubah manual.</p>
        </aside>
      </div>

      <Dialog
        open={confirmSlug}
        onClose={() => setConfirmSlug(false)}
        title="Ganti alamat profil?"
        description={`Alamat baru: ${SITE_PROFILE_PREFIX}${finalizeSlug(v.publicSlug)}. Tautan lama tetap berfungsi (dialihkan otomatis), tetapi Anda baru bisa mengganti lagi mulai ${nextChange}.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmSlug(false)}>
              Batal
            </Button>
            <Button loading={saving} onClick={save}>
              Ganti dan Simpan
            </Button>
          </>
        }
      />

      {dirty || saving ? (
        <div className="sticky bottom-0 z-20 -mx-4 mt-6 flex items-center justify-between gap-3 border-t border-ink-100 bg-white px-4 py-3 shadow-[0_-4px_14px_rgba(11,20,31,.06)] lg:-mx-8 lg:-mb-8 lg:px-8">
          <span className="text-body-md text-ink-700">Ada perubahan yang belum disimpan.</span>
          <div className="flex gap-2.5">
            <Button
              variant="secondary"
              disabled={saving}
              onClick={() => {
                setV(saved);
                setTried(false);
                setNotice(null);
              }}
            >
              Batalkan
            </Button>
            <Button loading={saving} disabled={slugChanged && (slugCheck.state === "checking" || slugCheck.state === "bad")} onClick={requestSave}>
              {saving ? "Menyimpan…" : "Simpan Perubahan"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
