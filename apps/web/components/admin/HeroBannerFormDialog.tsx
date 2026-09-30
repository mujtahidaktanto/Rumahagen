"use client";

// components/admin/HeroBannerFormDialog.tsx — Buat/Ubah slide Banner Hero Beranda (Konten & Notifikasi, tab Banner Hero Beranda): POST/PUT /admin/home-hero-banners(/{id})
// atas home_hero_banners (migration 0167). BUKAN BannerFormDialog.tsx (itu untuk Banner & Promosi/public_announcement_promotion, tampil di /promo) — tabel, bucket, dan
// endpoint berbeda meski pola unggah gambarnya sama. Gambar WAJIB diisi (kolom NOT NULL); dipangkas RASIO 4:3 lewat CropDialog — HARUS SAMA dengan aspect-[4/3] wadah
// blok hero Homepage (bukan ORG_BANNER 4:1 milik banner Organisasi — pernah tertukar, membuat gambar terpotong parah kiri-kanan saat ditampilkan di wadah 4:3).
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import type { HeroBannerRow } from "@/lib/admin/content-notif-data";
import { buildCtaReference, parseCtaForEdit, CTA_KINDS, CTA_KIND_LABEL, CTA_PAGE_OPTIONS, type CtaFormValue } from "@/lib/admin/cta-builder";
import { ApiClientError, api } from "@/lib/api-client";
import { CropDialog } from "@/components/media/CropDialog";
import { loadSource, pickProblem, putToSignedUrl, type Encoded, type Source } from "@/lib/media/image-processing";
import { HOME_HERO_BANNER } from "@/lib/media/variants";

const BANNER_FRAME = { w: 400, h: 300 };
type Picked = { enc: Encoded; preview: string } | null;
type UploadTarget = { upload_url: string; public_url: string };

type Form = { altText: string; displayOrder: string; isActive: boolean; cta: CtaFormValue };

function formFrom(b?: HeroBannerRow): Form {
  return {
    altText: b?.altText ?? "",
    displayOrder: String(b?.displayOrder ?? 0),
    isActive: b?.isActive ?? true,
    cta: parseCtaForEdit(b?.ctaReference ?? null),
  };
}

export function HeroBannerFormDialog({ banner, trigger }: { banner?: HeroBannerRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!banner;
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Form>(formFrom(banner));
  const [pick, setPick] = useState<Picked>(null);
  const [cropping, setCropping] = useState<Source | null>(null);
  const [busy, setBusy] = useState<"idle" | "read" | "save">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openDialog() {
    setF(formFrom(banner));
    if (pick) URL.revokeObjectURL(pick.preview);
    setPick(null);
    setError(null);
    setOpen(true);
  }

  async function onPickFile(files: FileList | null) {
    const file = files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setError(null);
    const problem = pickProblem(file);
    if (problem) return setError(problem);
    setBusy("read");
    try {
      setCropping(await loadSource(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto tidak bisa dibuka. Coba foto lain.");
    } finally {
      setBusy("idle");
    }
  }

  function applyCropped(enc: Encoded) {
    setCropping(null);
    setPick((old) => {
      if (old) URL.revokeObjectURL(old.preview);
      return { enc, preview: URL.createObjectURL(enc.blob) };
    });
  }

  const currentImage = pick ? pick.preview : (banner?.imageReference ?? null);

  async function save() {
    if (!currentImage) {
      setError("Gambar wajib diunggah.");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      // pick === null di sini hanya mungkin saat Ubah tanpa mengganti gambar (currentImage sudah dipastikan ada di pengecekan atas — creation baru tanpa pick tertangkap di sana).
      let imageReference: string | undefined;
      if (pick) {
        const t = await api.post<UploadTarget>("/admin/home-hero-banners/upload-url", { content_type: pick.enc.type }, { idempotency: true });
        await putToSignedUrl(t.data.upload_url, pick.enc.blob, pick.enc.type);
        imageReference = t.data.public_url;
      }
      const body = {
        image_reference: imageReference,
        alt_text: f.altText.trim() || undefined,
        cta_reference: buildCtaReference(f.cta) ?? undefined,
        display_order: Number(f.displayOrder) || 0,
        is_active: f.isActive,
      };
      if (isEdit) await api.put(`/admin/home-hero-banners/${banner.id}`, body, { idempotency: true });
      else await api.post("/admin/home-hero-banners", body, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy("idle");
    }
  }

  const saving = busy === "save";
  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (saving ? undefined : setOpen(false))}
        title={isEdit ? "Ubah Slide Banner" : "Buat Slide Banner"}
        description="Tampil di blok hero Homepage (samping pencarian), bergantian dengan slide lain bila lebih dari satu aktif."
        footer={
          <>
            <Button variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={saving} disabled={busy === "read"} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">
              Gambar <span className="text-danger-600">*</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="flex aspect-[4/3] h-16 flex-none items-center justify-center overflow-hidden rounded-md bg-ink-100 text-caption">
                {currentImage ? (
                  // Pratinjau berkas lokal atau URL tersimpan; gambar biasa tanpa optimasi Next.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentImage} alt="" className="h-full w-full object-cover" />
                ) : (
                  "Belum ada"
                )}
              </span>
              <span className="flex flex-col gap-1.5">
                <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => void onPickFile(e.target.files)} />
                <Button variant="secondary" size="sm" loading={busy === "read"} disabled={saving} onClick={() => fileRef.current?.click()}>
                  {currentImage ? "Ganti & Atur" : "Unggah"}
                </Button>
              </span>
            </div>
            <p className="text-caption">JPG, PNG, atau WebP hingga 25 MB. Rasio 4:3 (sama seperti wadah tampil di Homepage). Anda bisa geser dan zoom untuk mengatur bagian yang tampil.</p>
          </div>

          <Field label="Teks Alternatif" hint="Dibaca pembaca layar dan mesin pencari; kosongkan bila gambar murni dekoratif.">
            {(a) => <Input {...a} value={f.altText} onChange={(e) => setF((x) => ({ ...x, altText: e.target.value }))} />}
          </Field>

          <fieldset className="flex flex-col gap-2 rounded-sm border border-ink-100 p-3">
            <legend className="px-1 text-label-lg">Tautan Tujuan</legend>
            <p className="text-caption">Ke mana pengunjung diarahkan saat slide ini diklik. Kosongkan ("Tanpa tombol CTA") bila gambar tidak perlu diklik.</p>
            <Field label="Jenis">
              {(a) => (
                <Select {...a} value={f.cta.kind} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, kind: e.target.value as CtaFormValue["kind"] } }))}>
                  {CTA_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {CTA_KIND_LABEL[k]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
            {f.cta.kind === "project" ? (
              <Field label="Slug proyek">{(a) => <Input {...a} value={f.cta.slugOrId} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, slugOrId: e.target.value } }))} />}</Field>
            ) : null}
            {f.cta.kind === "course" || f.cta.kind === "event" ? (
              <Field label="ID (UUID)">{(a) => <Input {...a} value={f.cta.slugOrId} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, slugOrId: e.target.value } }))} />}</Field>
            ) : null}
            {f.cta.kind === "page" ? (
              <Field label="Halaman">
                {(a) => (
                  <Select {...a} value={f.cta.pageKey} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, pageKey: e.target.value } }))}>
                    {CTA_PAGE_OPTIONS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            ) : null}
            {f.cta.kind === "whatsapp" ? (
              <>
                <Field label="Nomor WhatsApp">{(a) => <Input {...a} value={f.cta.phone} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, phone: e.target.value } }))} />}</Field>
                <Field label="Pesan (opsional)">{(a) => <Input {...a} value={f.cta.waText} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, waText: e.target.value } }))} />}</Field>
              </>
            ) : null}
            {f.cta.kind === "url" ? (
              <Field label="URL (https)">{(a) => <Input {...a} value={f.cta.url} onChange={(e) => setF((x) => ({ ...x, cta: { ...x.cta, url: e.target.value } }))} />}</Field>
            ) : null}
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Urutan Tampil" hint="Angka kecil tampil lebih dulu.">
              {(a) => <Input {...a} type="number" value={f.displayOrder} onChange={(e) => setF((x) => ({ ...x, displayOrder: e.target.value }))} />}
            </Field>
            <label className="flex items-center gap-2 self-end pb-2.5 text-body-md text-ink-900">
              <input type="checkbox" checked={f.isActive} onChange={(e) => setF((x) => ({ ...x, isActive: e.target.checked }))} className="h-4 w-4" />
              Aktif (tampil di halaman utama)
            </label>
          </div>

          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
      <CropDialog
        source={cropping}
        frame={BANNER_FRAME}
        output={HOME_HERO_BANNER}
        title="Atur Gambar Slide"
        description="Geser dan zoom foto sampai bagian yang Anda mau pas di dalam bingkai."
        onCancel={() => setCropping(null)}
        onConfirm={applyCropped}
      />
    </>
  );
}
