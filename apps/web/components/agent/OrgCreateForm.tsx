"use client";

// components/agent/OrgCreateForm.tsx — Buat Organisasi (M12, wireframe 01-Agent/M12-Buat-Organisasi): nama, jenis, alamat, telepon (terkunci permanen setelah dibuat) dan branding teks (deskripsi, website,
// Instagram). Logo dan banner ditambahkan setelah organisasi dibuat lewat "Edit Branding" (butuh id organisasi untuk unggah). Submit = POST /organizations (Idempotency-Key tetap selama satu percobaan);
// pembuat otomatis menjadi Leader. Empat keadaan: idle, membuat, gagal (pesan server), sukses (Lihat Organisasi / Undang Anggota).
import Link from "next/link";
import type { Route } from "next";
import { useRef, useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { CheckCircleIcon, InfoIcon } from "@/components/ui/icons";
import { EMPTY_ORG, ORG_TYPES, ORG_TYPE_LABEL, toCreateOrgPayload, validateOrgForm, type OrgFormErrors, type OrgFormValues } from "@/lib/agent/org-rules";
import { ApiClientError, api, newIdempotencyKey } from "@/lib/api-client";
import { cn } from "@/lib/cn";

export function OrgCreateForm() {
  const [v, setV] = useState<OrgFormValues>(EMPTY_ORG);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; name: string } | null>(null);
  const key = useRef(newIdempotencyKey());

  const set = <K extends keyof OrgFormValues>(k: K, val: OrgFormValues[K]) => setV((x) => ({ ...x, [k]: val }));
  const errors: OrgFormErrors = shown ? validateOrgForm(v) : {};

  async function submit() {
    setShown(true);
    setError(null);
    if (Object.keys(validateOrgForm(v)).length > 0) return;
    setBusy(true);
    try {
      const res = await api.post<{ id: string; organization_name: string }>("/organizations", toCreateOrgPayload(v), { idempotency: key.current });
      setDone({ id: res.data.id, name: res.data.organization_name });
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Organisasi belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 p-6 py-16 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600">
          <CheckCircleIcon size={32} />
        </span>
        <h1 className="text-headline">Organisasi Berhasil Dibuat</h1>
        <p className="text-body-md text-ink-500">
          “{done.name}” dibuat dan Anda otomatis menjadi Leader. Undang anggota tim untuk mulai berkolaborasi, dan tambahkan logo serta banner lewat Edit Branding.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <LinkButton href={"/agent/organisasi" as Route} variant="secondary">
            Lihat Organisasi
          </LinkButton>
          <LinkButton href={"/agent/organisasi/anggota" as Route}>Undang Anggota</LinkButton>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 pb-4 lg:p-8">
      <h1 className="mb-5 text-headline">Buat Organisasi</h1>

      {error ? (
        <p role="alert" className="mb-4 rounded-md border border-danger-600/30 bg-danger-100 p-3.5 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <div className="mb-5 flex items-start gap-2.5 rounded-md border border-warning-600/30 bg-warning-100 p-3.5 text-body-md text-ink-900">
        <InfoIcon size={17} className="mt-0.5 flex-none text-warning-600" />
        <span>
          Nama, jenis, alamat, dan nomor telepon organisasi <strong>tidak bisa diubah lagi setelah dibuat</strong>. Pastikan sudah benar sebelum melanjutkan.
        </span>
      </div>

      <div className="flex flex-col gap-5 rounded-md border border-ink-100 bg-white p-5 sm:p-6">
        <h2 className="text-title-md">Informasi Dasar</h2>
        <Field label="Nama Organisasi" required error={errors.name} hint="Terkunci setelah dibuat.">
          {(a) => <Input {...a} maxLength={150} value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Contoh: PT Properti Jaya Sejahtera" />}
        </Field>
        <div className="flex flex-col gap-1.5">
          <span id="org-type-label" className="text-label-lg">
            Jenis Organisasi <span className="text-danger-600">*</span> <span className="text-caption font-normal">Terkunci setelah dibuat.</span>
          </span>
          <div role="radiogroup" aria-labelledby="org-type-label" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {ORG_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={v.type === t}
                onClick={() => set("type", t)}
                className={cn("min-h-12 rounded-md border-[1.5px] px-3 text-label-lg", v.type === t ? "border-blue-600 bg-blue-50 text-blue-600" : "border-ink-100 bg-white text-ink-700 hover:border-blue-500")}
              >
                {ORG_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          {errors.type ? (
            <p role="alert" className="text-caption text-danger-600">
              {errors.type}
            </p>
          ) : null}
        </div>
        <Field label="Alamat" required error={errors.address} hint="Terkunci setelah dibuat.">
          {(a) => <Textarea {...a} rows={3} maxLength={500} value={v.address} onChange={(e) => set("address", e.target.value)} placeholder="Ruko Sunburst CBD, BSD City, Tangerang Selatan" />}
        </Field>
        <Field label="Nomor Telepon Kantor" required error={errors.phone} hint="Terkunci setelah dibuat.">
          {(a) => <Input {...a} inputMode="tel" maxLength={20} value={v.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(021) 5551234" />}
        </Field>

        <h2 className="mt-2 text-title-md">
          Branding &amp; Presentasi Publik <span className="text-caption font-normal">bisa diubah kapan saja</span>
        </h2>
        <Field label="Deskripsi">{(a) => <Textarea {...a} rows={3} value={v.description} onChange={(e) => set("description", e.target.value)} placeholder="Ceritakan tentang organisasi Anda…" />}</Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Website" error={errors.website}>
            {(a) => <Input {...a} inputMode="url" value={v.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" />}
          </Field>
          <Field label="Instagram" error={errors.instagram}>
            {(a) => <Input {...a} value={v.instagram} onChange={(e) => set("instagram", e.target.value)} placeholder="@namaorganisasi" />}
          </Field>
        </div>
        <p className="text-caption">Logo dan banner ditambahkan setelah organisasi dibuat, lewat tombol Edit Branding.</p>
      </div>

      <div className="sticky bottom-0 z-10 mt-5 -mx-4 flex justify-end gap-3 border-t border-ink-100 bg-white px-4 py-3 lg:-mx-8 lg:px-8">
        <Link href={"/agent/organisasi" as Route} className="inline-flex h-11 items-center rounded-md border-[1.5px] border-ink-100 px-5 text-label-lg no-underline hover:no-underline">
          Batalkan
        </Link>
        <Button loading={busy} onClick={() => void submit()}>
          {busy ? "Membuat…" : "Buat Organisasi"}
        </Button>
      </div>
    </div>
  );
}
