"use client";

// components/admin/BannerFormDialog.tsx — Buat/Ubah Banner (Konten & Notifikasi, tab Banner & Promosi): POST/PUT /admin/banners(/{id}) atas public_announcement_promotion (migration 0014/0028).
// Gambar dipilih dari perangkat (hingga 25 MB), dipangkas dengan CropDialog (bingkai memanjang 4:1, sama seperti banner Organisasi — lib/media/variants.ts ORG_BANNER)
// dan dikecilkan di browser (<3 MB); saat Simpan: POST .../upload-url -> PUT berkas -> image_reference diisi URL hasil unggah (migration 0166, bucket `announcement-media`).
// Tombol CTA (tautan tujuan saat banner diklik) dipilih terstruktur (jenis + isi) lewat lib/admin/cta-builder.ts — admin TIDAK mengetik format "jenis:isi" manual
// (keputusan produk "CTA promo terstruktur").
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { BannerRow } from "@/lib/admin/content-notif-data";
import { buildCtaReference, parseCtaForEdit, CTA_KINDS, CTA_KIND_LABEL, CTA_PAGE_OPTIONS, type CtaFormValue } from "@/lib/admin/cta-builder";
import { ApiClientError, api } from "@/lib/api-client";
import { CropDialog } from "@/components/media/CropDialog";
import { loadSource, pickProblem, putToSignedUrl, type Encoded, type Source } from "@/lib/media/image-processing";
import { ORG_BANNER } from "@/lib/media/variants";

const STATUS_OPTIONS = ["draft", "scheduled", "active", "expired", "archived"] as const;
const BANNER_FRAME = { w: 480, h: 120 };
type Picked = { enc: Encoded; preview: string } | "remove" | null;
type UploadTarget = { upload_url: string; public_url: string };

function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

type Form = { title: string; content: string; campaignReference: string; priority: string; scheduleAt: string; expiresAt: string; status: (typeof STATUS_OPTIONS)[number]; cta: CtaFormValue };

function formFrom(b?: BannerRow): Form {
  return {
    title: b?.title ?? "",
    content: b?.content ?? "",
    campaignReference: b?.campaignReference ?? "",
    priority: String(b?.priority ?? 0),
    scheduleAt: toLocalInput(b?.scheduleAt ?? null),
    expiresAt: toLocalInput(b?.expiresAt ?? null),
    status: (STATUS_OPTIONS as readonly string[]).includes(b?.status ?? "") ? (b!.status as Form["status"]) : "draft",
    cta: parseCtaForEdit(b?.ctaReference ?? null),
  };
}

export function BannerFormDialog({ banner, trigger }: { banner?: BannerRow; trigger: (open: () => void) => React.ReactNode }) {
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
    if (pick && pick !== "remove") URL.revokeObjectURL(pick.preview);
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
      if (old && old !== "remove") URL.revokeObjectURL(old.preview);
      return { enc, preview: URL.createObjectURL(enc.blob) };
    });
  }

  const currentImage = pick === "remove" ? null : pick ? pick.preview : (banner?.imageReference ?? null);

  async function save() {
    if (!f.title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    setBusy("save");
    setError(null);
    try {
      let imageReference: string | undefined;
      if (pick === "remove") imageReference = "";
      else if (pick) {
        const t = await api.post<UploadTarget>("/admin/banners/upload-url", { content_type: pick.enc.type }, { idempotency: true });
        await putToSignedUrl(t.data.upload_url, pick.enc.blob, pick.enc.type);
        imageReference = t.data.public_url;
      }
      const body = {
        title: f.title.trim(),
        content: f.content.trim() || undefined,
        image_reference: imageReference,
        cta_reference: buildCtaReference(f.cta) ?? undefined,
        campaign_reference: f.campaignReference.trim() || undefined,
        priority: Number(f.priority) || 0,
        schedule_at: toIso(f.scheduleAt) ?? undefined,
        expires_at: toIso(f.expiresAt) ?? undefined,
        status: f.status,
      };
      if (isEdit) await api.put(`/admin/banners/${banner.id}`, body, { idempotency: true });
      else await api.post("/admin/banners", body, { idempotency: true });
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
        title={isEdit ? "Ubah Banner" : "Buat Banner"}
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
          <Field label="Judul" required>
            {(a) => <Input {...a} value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />}
          </Field>
          <Field label="Isi">{(a) => <Textarea {...a} rows={2} value={f.content} onChange={(e) => setF((x) => ({ ...x, content: e.target.value }))} />}</Field>

          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Gambar Banner</span>
            <div className="flex items-center gap-3">
              <span className="flex h-16 w-64 flex-none items-center justify-center overflow-hidden rounded-md bg-ink-100 text-caption">
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
                {currentImage ? (
                  <Button variant="ghost" size="sm" className="text-danger-600" disabled={saving} onClick={() => setPick("remove")}>
                    Hapus
                  </Button>
                ) : null}
              </span>
            </div>
            <p className="text-caption">JPG, PNG, atau WebP hingga 25 MB. Memanjang 4:1. Anda bisa geser dan zoom untuk mengatur bagian yang tampil.</p>
          </div>

          <fieldset className="flex flex-col gap-2 rounded-sm border border-ink-100 p-3">
            <legend className="px-1 text-label-lg">Tombol CTA</legend>
            <p className="text-caption">Tautan tujuan saat banner diklik.</p>
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
            <Field label="Kode kampanye">{(a) => <Input {...a} value={f.campaignReference} onChange={(e) => setF((x) => ({ ...x, campaignReference: e.target.value }))} />}</Field>
            <Field label="Prioritas">{(a) => <Input {...a} type="number" value={f.priority} onChange={(e) => setF((x) => ({ ...x, priority: e.target.value }))} />}</Field>
            <Field label="Mulai tayang">{(a) => <Input {...a} type="datetime-local" value={f.scheduleAt} onChange={(e) => setF((x) => ({ ...x, scheduleAt: e.target.value }))} />}</Field>
            <Field label="Berakhir">{(a) => <Input {...a} type="datetime-local" value={f.expiresAt} onChange={(e) => setF((x) => ({ ...x, expiresAt: e.target.value }))} />}</Field>
          </div>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value as Form["status"] }))}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
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
        </div>
      </Dialog>
      <CropDialog
        source={cropping}
        frame={BANNER_FRAME}
        output={ORG_BANNER}
        title="Atur Gambar Banner"
        description="Geser dan zoom foto sampai bagian yang Anda mau pas di dalam bingkai memanjang."
        onCancel={() => setCropping(null)}
        onConfirm={applyCropped}
      />
    </>
  );
}
