"use client";

// components/admin/PartnerFormDialog.tsx — Tambah/Edit Developer Partner (Proyek Developer, tab Developer Partner): POST/PUT /developer-partners(/{id}) atas developer_partners (migration 0033).
// user_id TIDAK diisi di sini (perusahaan bisa terdaftar tanpa akun login untuk atribusi proyek) — menghubungkan akun lewat LinkPartnerAccountDialog terpisah.
// Logo diunggah+dipangkas kotak lewat CropDialog (migration 0172, pola sama seperti components/partner/PartnerProfileView.tsx) -- hanya tersedia saat EDIT karena
// endpoint media-upload-url butuh id developer_partners yang sudah ada; saat TAMBAH logo ditambahkan belakangan lewat Edit setelah baris dibuat.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { PartnerRow } from "@/lib/admin/developer-admin-data";
import { ApiClientError, api } from "@/lib/api-client";
import { CropDialog } from "@/components/media/CropDialog";
import { loadSource, pickProblem, putToSignedUrl, type Encoded, type Source } from "@/lib/media/image-processing";
import { DEVELOPER_LOGO_SIZE } from "@/lib/media/variants";

const LOGO_FRAME = { w: 220, h: 220 };
type Picked = { enc: Encoded; preview: string } | null;
type UploadTarget = { upload_url: string; public_url: string };

type Form = { companyName: string; companyLogo: string; description: string; picName: string; picContact: string; status: "active" | "inactive" };
function formFrom(p?: PartnerRow): Form {
  return { companyName: p?.companyName ?? "", companyLogo: p?.companyLogo ?? "", description: p?.description ?? "", picName: p?.picName ?? "", picContact: p?.picContact ?? "", status: (p?.status as "active" | "inactive") ?? "active" };
}

export function PartnerFormDialog({ partner, trigger }: { partner?: PartnerRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!partner;
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Form>(formFrom(partner));
  const [logoPick, setLogoPick] = useState<Picked>(null);
  const [cropping, setCropping] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);
  const logoPreview = logoPick ? logoPick.preview : f.companyLogo || null;

  function openDialog() {
    setF(formFrom(partner));
    if (logoPick) URL.revokeObjectURL(logoPick.preview);
    setLogoPick(null);
    setError(null);
    setOpen(true);
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
  }

  async function save() {
    if (!f.companyName.trim()) {
      setError("Nama perusahaan wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let companyLogo = f.companyLogo.trim() || undefined;
      if (isEdit && logoPick) {
        const t = await api.post<UploadTarget>(`/developer-partners/${partner.id}/media-upload-url`, { kind: "logo", content_type: logoPick.enc.type }, { idempotency: true });
        await putToSignedUrl(t.data.upload_url, logoPick.enc.blob, logoPick.enc.type);
        companyLogo = t.data.public_url;
      }
      const body = { company_name: f.companyName.trim(), company_logo: companyLogo, description: f.description.trim() || undefined, pic_name: f.picName.trim() || undefined, pic_contact: f.picContact.trim() || undefined, status: f.status };
      if (isEdit) await api.put(`/developer-partners/${partner.id}`, body, { idempotency: true });
      else await api.post("/developer-partners", body, { idempotency: true });
      if (logoPick) URL.revokeObjectURL(logoPick.preview);
      setLogoPick(null);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
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
        title={isEdit ? "Edit Developer Partner" : "Tambah Developer Partner"}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Nama Perusahaan" required>
            {(a) => <Input {...a} value={f.companyName} onChange={(e) => setF((x) => ({ ...x, companyName: e.target.value }))} />}
          </Field>
          {isEdit ? (
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
                        setF((x) => ({ ...x, companyLogo: "" }));
                      }}
                    >
                      Hapus
                    </Button>
                  ) : null}
                </span>
              </div>
              <p className="text-caption">JPG, PNG, atau WebP hingga 25 MB. Persegi 1:1.</p>
            </div>
          ) : (
            <p className="text-caption">Logo perusahaan bisa ditambahkan setelah perusahaan dibuat, lewat Edit.</p>
          )}
          <Field label="Tentang Developer">{(a) => <Textarea {...a} rows={2} value={f.description} onChange={(e) => setF((x) => ({ ...x, description: e.target.value }))} />}</Field>
          <Field label="Nama PIC">{(a) => <Input {...a} value={f.picName} onChange={(e) => setF((x) => ({ ...x, picName: e.target.value }))} />}</Field>
          <Field label="Kontak PIC">{(a) => <Input {...a} value={f.picContact} onChange={(e) => setF((x) => ({ ...x, picContact: e.target.value }))} />}</Field>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value as Form["status"] }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
        frame={LOGO_FRAME}
        output={{ w: DEVELOPER_LOGO_SIZE, h: DEVELOPER_LOGO_SIZE }}
        title="Atur Logo"
        description="Geser dan zoom foto sampai logo pas di dalam bingkai."
        onCancel={() => setCropping(null)}
        onConfirm={applyCroppedLogo}
      />
    </>
  );
}
