"use client";

// components/partner/PartnerProfileView.tsx — Profil Developer (M06, wireframe 03-Developer-Partner/M06-Profil-Developer). Mengedit developer_partners milik sendiri lewat
// PUT /developer-partners/{id} (RLS developer_partners_update_own, migration 0126) — nama, logo, Tentang Developer, PIC dikirim (user_id/status TIDAK, itu ditolak 403
// untuk mitra sesuai trigger trg_developer_partner_self_edit_columns). Logo (migration 0172) diunggah+dipangkas kotak lewat CropDialog (pola sama seperti logo
// Organisasi, OrgBrandingDialog.tsx) — upload ditunda sampai "Simpan Perubahan" ditekan, sama seperti field teks lain di form ini.
// Berkas Legalitas (DeveloperLegalDocsPanel, PRIVAT) dan Riwayat Perumahan (DeveloperProjectHistoryPanel, PUBLIK) adalah resource terpisah dari developer_partners
// sendiri (tabel+endpoint sendiri, migration 0172) — dirender di bawah form ini, tiap panel menyimpan sendiri (bukan bagian dari tombol Simpan Perubahan profil).
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { BuildingIcon, UserIcon } from "@/components/ui/icons";
import { SUPPORT_EMAIL } from "@/lib/config";
import type { LegalDocumentRow, MyPartnerProfile, ProjectHistoryRow } from "@/lib/partner/profile-data";
import { validatePartnerProfileForm, type PartnerProfileForm } from "@/lib/partner/profile-rules";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";
import { CropDialog } from "@/components/media/CropDialog";
import { loadSource, pickProblem, putToSignedUrl, type Encoded, type Source } from "@/lib/media/image-processing";
import { DEVELOPER_LOGO_SIZE } from "@/lib/media/variants";
import { DeveloperLegalDocsPanel } from "./DeveloperLegalDocsPanel";
import { DeveloperProjectHistoryPanel } from "./DeveloperProjectHistoryPanel";

const LOGO_FRAME = { w: 220, h: 220 };
type Picked = { enc: Encoded; preview: string } | null;
type UploadTarget = { upload_url: string; public_url: string };

function formFrom(p: MyPartnerProfile): PartnerProfileForm {
  return { companyName: p.companyName, companyLogo: p.companyLogo ?? "", description: p.description ?? "", picName: p.picName ?? "", picContact: p.picContact ?? "" };
}

export function PartnerProfileView({
  profile,
  name,
  email,
  legalDocuments,
  projectHistory,
}: {
  profile: MyPartnerProfile | null;
  name: string;
  email: string | null;
  legalDocuments: Part<LegalDocumentRow[]> | null;
  projectHistory: Part<ProjectHistoryRow[]> | null;
}) {
  if (!profile) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Profil Developer</h1>
        <div className="flex flex-col items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-8 text-center">
          <BuildingIcon size={28} />
          <span className="text-title-md text-ink-900">Akun Anda belum terhubung ke perusahaan developer</span>
          <p className="text-body-md text-ink-500">Tim RumahAgen perlu menghubungkan akun ini ke data perusahaan Anda. Selama belum terhubung, proyek, marketing kit, dan klaim belum bisa dikelola.</p>
          <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hubungkan akun Developer Partner")}` as Route}>Hubungi Tim RumahAgen</LinkButton>
        </div>
        <AccountCard name={name} email={email} />
      </div>
    );
  }

  return <ProfileForm profile={profile} name={name} email={email} legalDocuments={legalDocuments} projectHistory={projectHistory} />;
}

function AccountCard({ name, email }: { name: string; email: string | null }) {
  return (
    <div className="flex items-center gap-4 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <UserIcon size={22} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-label-lg text-ink-900">{name}</p>
        <p className="truncate text-caption">{email ?? "—"}</p>
      </div>
    </div>
  );
}

function ProfileForm({
  profile,
  name,
  email,
  legalDocuments,
  projectHistory,
}: {
  profile: MyPartnerProfile;
  name: string;
  email: string | null;
  legalDocuments: Part<LegalDocumentRow[]> | null;
  projectHistory: Part<ProjectHistoryRow[]> | null;
}) {
  const router = useRouter();
  const initial = formFrom(profile);
  const [f, setF] = useState<PartnerProfileForm>(initial);
  const [logoPick, setLogoPick] = useState<Picked>(null);
  const [cropping, setCropping] = useState<Source | null>(null);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const errors = tried ? validatePartnerProfileForm(f) : {};
  const dirty = JSON.stringify(f) !== JSON.stringify(initial) || logoPick !== null;
  const logoPreview = logoPick ? logoPick.preview : f.companyLogo || null;

  function set<K extends keyof PartnerProfileForm>(k: K, v: PartnerProfileForm[K]) {
    setF((x) => ({ ...x, [k]: v }));
    setSaved(false);
    setError(null);
  }

  function resetAll() {
    setF(initial);
    if (logoPick) URL.revokeObjectURL(logoPick.preview);
    setLogoPick(null);
    setSaved(false);
    setError(null);
  }

  async function onPickLogo(files: FileList | null) {
    const file = files?.[0];
    if (logoFileRef.current) logoFileRef.current.value = "";
    if (!file) return;
    setError(null);
    const problem = pickProblem(file);
    if (problem) return setError(problem);
    try {
      setCropping(await loadSource(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto tidak bisa dibuka. Coba foto lain.");
    }
  }

  function applyCroppedLogo(enc: Encoded) {
    setCropping(null);
    setLogoPick((old) => {
      if (old) URL.revokeObjectURL(old.preview);
      return { enc, preview: URL.createObjectURL(enc.blob) };
    });
    setSaved(false);
  }

  async function save() {
    setTried(true);
    const errs = validatePartnerProfileForm(f);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      let companyLogo = f.companyLogo.trim() || undefined;
      if (logoPick) {
        const t = await api.post<UploadTarget>(`/developer-partners/${profile.id}/media-upload-url`, { kind: "logo", content_type: logoPick.enc.type }, { idempotency: true });
        await putToSignedUrl(t.data.upload_url, logoPick.enc.blob, logoPick.enc.type);
        companyLogo = t.data.public_url;
      }
      await api.put(
        `/developer-partners/${profile.id}`,
        {
          company_name: f.companyName.trim(),
          company_logo: companyLogo,
          description: f.description.trim() || undefined,
          pic_name: f.picName.trim() || undefined,
          pic_contact: f.picContact.trim() || undefined,
        },
        { idempotency: true },
      );
      if (logoPick) URL.revokeObjectURL(logoPick.preview);
      setLogoPick(null);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Profil gagal disimpan. Perubahan Anda belum tersimpan; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 pb-28 lg:p-8 lg:pb-28">
      <h1 className="text-headline">Profil Developer</h1>

      {profile.status !== "active" ? (
        <div className="rounded-md border border-warning-600/30 bg-warning-100 p-3.5">
          <p className="text-label-lg text-ink-900">Perusahaan Anda berstatus Nonaktif</p>
          <p className="text-body-md text-ink-700">Proyek Anda tidak tampil di halaman publik selama perusahaan nonaktif. Hubungi tim RumahAgen untuk mengaktifkan kembali.</p>
        </div>
      ) : null}

      <AccountCard name={name} email={email} />

      <div className="rounded-md border border-ink-100 bg-white p-5">
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <h2 className="text-title-md">Profil perusahaan</h2>
          <Badge tone={profile.status === "active" ? "success" : "neutral"}>{profile.status === "active" ? "Aktif" : "Nonaktif"}</Badge>
        </div>
        <div className="flex flex-col gap-3.5">
          <Field label="Nama perusahaan" required hint={`${f.companyName.length}/200 karakter`} error={errors.companyName}>
            {(a) => <Input {...a} value={f.companyName} onChange={(e) => set("companyName", e.target.value)} maxLength={200} />}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Logo perusahaan (opsional)</span>
            <div className="flex items-center gap-3">
              <span className="flex aspect-square h-16 flex-none items-center justify-center overflow-hidden rounded-md bg-ink-100 text-caption">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  "Belum ada"
                )}
              </span>
              <span className="flex flex-col gap-1.5">
                <input ref={logoFileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => void onPickLogo(e.target.files)} />
                <Button variant="secondary" size="sm" disabled={busy} onClick={() => logoFileRef.current?.click()}>
                  {logoPreview ? "Ganti & Atur" : "Unggah"}
                </Button>
                {logoPreview ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger-600"
                    disabled={busy}
                    onClick={() => {
                      if (logoPick) URL.revokeObjectURL(logoPick.preview);
                      setLogoPick(null);
                      set("companyLogo", "");
                    }}
                  >
                    Hapus
                  </Button>
                ) : null}
              </span>
            </div>
            <p className="text-caption">JPG, PNG, atau WebP hingga 25 MB. Persegi 1:1. Tampil di halaman publik Developer/Proyek.</p>
          </div>
          <Field label="Tentang Developer" hint="Deskripsi perusahaan yang tampil di publik. Ini BUKAN deskripsi proyek maupun listing.">
            {(a) => <Textarea {...a} rows={4} value={f.description} onChange={(e) => set("description", e.target.value)} />}
          </Field>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Nama PIC">{(a) => <Input {...a} value={f.picName} onChange={(e) => set("picName", e.target.value)} maxLength={150} />}</Field>
            <Field label="Kontak PIC">{(a) => <Input {...a} value={f.picContact} onChange={(e) => set("picContact", e.target.value)} maxLength={50} />}</Field>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
      {saved && !dirty ? (
        <p role="status" className="text-body-md text-success-600">
          Profil perusahaan tersimpan.
        </p>
      ) : null}

      {dirty ? (
        <div className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 border-t border-ink-100 bg-white p-4 shadow-3">
          <span className="text-body-md text-ink-700">Ada perubahan yang belum disimpan.</span>
          <div className="flex gap-2.5">
            <Button variant="secondary" disabled={busy} onClick={resetAll}>
              Batalkan
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      ) : null}

      <DeveloperLegalDocsPanel developerId={profile.id} initial={legalDocuments} />
      <DeveloperProjectHistoryPanel developerId={profile.id} initial={projectHistory} />

      <CropDialog
        source={cropping}
        frame={LOGO_FRAME}
        output={{ w: DEVELOPER_LOGO_SIZE, h: DEVELOPER_LOGO_SIZE }}
        title="Atur Logo"
        description="Geser dan zoom foto sampai logo pas di dalam bingkai."
        onCancel={() => setCropping(null)}
        onConfirm={applyCroppedLogo}
      />
    </div>
  );
}
