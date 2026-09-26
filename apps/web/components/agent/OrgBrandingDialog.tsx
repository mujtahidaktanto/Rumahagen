"use client";

// components/agent/OrgBrandingDialog.tsx — "Edit Branding" organisasi (M12): logo (1:1, 512 px), banner (3:1, 1500x500 px), deskripsi, website, Instagram. Foto dipilih dari perangkat (hingga 25 MB), dipotong
// otomatis dari tengah sesuai rasio dan dikecilkan di browser (<3 MB); saat Simpan: POST .../branding/upload-url -> PUT berkas -> PUT /organizations/{id}/branding (URL hasil unggah). Nama, jenis, alamat,
// dan telepon terkunci permanen sejak dibuat. Hanya leader pada organisasi aktif.
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { OrgInfo } from "@/lib/agent/org-data";
import { instagramOf, toBrandingPayload, validateBranding, type BrandingErrors } from "@/lib/agent/org-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { loadSource, makeCoverImage, pickProblem, putToSignedUrl, type Encoded } from "@/lib/media/image-processing";

type Kind = "logo" | "banner";
type Picked = { enc: Encoded; preview: string } | "remove" | null;
type Target = { path: string; upload_url: string; public_url: string };

const SIZES: Record<Kind, { w: number; h: number; label: string; hint: string }> = {
  logo: { w: 512, h: 512, label: "Logo", hint: "Persegi 1:1. Bagian tengah foto dipakai." },
  banner: { w: 1500, h: 500, label: "Banner", hint: "Lebar 3:1. Bagian tengah foto dipakai." },
};

export function OrgBrandingDialog({ org }: { org: OrgInfo }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState(org.description ?? "");
  const [website, setWebsite] = useState(org.website ?? "");
  const [instagram, setInstagram] = useState(instagramOf(org.social));
  const [pick, setPick] = useState<Record<Kind, Picked>>({ logo: null, banner: null });
  const [errors, setErrors] = useState<BrandingErrors>({});
  const [busy, setBusy] = useState<"idle" | "read" | "save">("idle");
  const [error, setError] = useState<string | null>(null);
  const refs = { logo: useRef<HTMLInputElement>(null), banner: useRef<HTMLInputElement>(null) };

  function reset() {
    for (const k of ["logo", "banner"] as const) {
      const p = pick[k];
      if (p && p !== "remove") URL.revokeObjectURL(p.preview);
    }
    setPick({ logo: null, banner: null });
    setDescription(org.description ?? "");
    setWebsite(org.website ?? "");
    setInstagram(instagramOf(org.social));
    setErrors({});
    setError(null);
  }

  async function onPick(kind: Kind, files: FileList | null) {
    const f = files?.[0];
    if (refs[kind].current) refs[kind].current.value = "";
    if (!f) return;
    setError(null);
    const problem = pickProblem(f);
    if (problem) return setError(problem);
    setBusy("read");
    try {
      const enc = await makeCoverImage(await loadSource(f), SIZES[kind].w, SIZES[kind].h);
      setPick((cur) => {
        const old = cur[kind];
        if (old && old !== "remove") URL.revokeObjectURL(old.preview);
        return { ...cur, [kind]: { enc, preview: URL.createObjectURL(enc.blob) } };
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto tidak bisa dibuka. Coba foto lain.");
    } finally {
      setBusy("idle");
    }
  }

  async function save() {
    const v = { description, website, instagram };
    const errs = validateBranding(v);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy("save");
    setError(null);
    try {
      const body: Record<string, unknown> = toBrandingPayload(v, org.social);
      for (const kind of ["logo", "banner"] as const) {
        const p = pick[kind];
        if (p === "remove") body[`${kind}_url`] = null;
        else if (p) {
          const t = await api.post<Target>(`/organizations/${org.id}/branding/upload-url`, { content_type: p.enc.type, kind }, { idempotency: true });
          await putToSignedUrl(t.data.upload_url, p.enc.blob, p.enc.type);
          body[`${kind}_url`] = t.data.public_url;
        }
      }
      await api.put(`/organizations/${org.id}/branding`, body, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Perubahan belum tersimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy("idle");
    }
  }

  const current = (kind: Kind) => {
    const p = pick[kind];
    if (p === "remove") return null;
    if (p) return p.preview;
    return kind === "logo" ? org.logoUrl : org.bannerUrl;
  };

  const saving = busy === "save";
  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        Edit Branding
      </Button>
      <Dialog
        open={open}
        onClose={() => (saving ? undefined : setOpen(false))}
        title="Edit Branding"
        description="Logo, banner, deskripsi, website, dan Instagram bisa diperbarui kapan saja."
        footer={
          <>
            <Button variant="secondary" disabled={saving} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={saving} disabled={busy === "read"} onClick={() => void save()}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </>
        }
      >
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
          {(["logo", "banner"] as const).map((kind) => {
            const url = current(kind);
            return (
              <div key={kind} className="flex flex-col gap-1.5">
                <span className="text-label-lg">{SIZES[kind].label}</span>
                <div className="flex items-center gap-3">
                  <span className={`flex flex-none items-center justify-center overflow-hidden rounded-md bg-ink-100 text-caption ${kind === "logo" ? "h-16 w-16" : "h-16 w-48"}`}>
                    {url ? (
                      // Pratinjau berkas lokal atau URL tersimpan; gambar biasa tanpa optimasi Next.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      "Belum ada"
                    )}
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <input ref={refs[kind]} type="file" accept="image/*" className="sr-only" onChange={(e) => void onPick(kind, e.target.files)} />
                    <Button variant="secondary" size="sm" loading={busy === "read"} disabled={saving} onClick={() => refs[kind].current?.click()}>
                      {url ? "Ganti" : "Unggah"}
                    </Button>
                    {url ? (
                      <Button variant="ghost" size="sm" className="text-danger-600" disabled={saving} onClick={() => setPick((c) => ({ ...c, [kind]: "remove" }))}>
                        Hapus
                      </Button>
                    ) : null}
                  </span>
                </div>
                <p className="text-caption">JPG, PNG, atau WebP hingga 25 MB. {SIZES[kind].hint}</p>
              </div>
            );
          })}
          <Field label="Deskripsi">{(a) => <Textarea {...a} rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ceritakan tentang organisasi Anda…" />}</Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Website" error={errors.website}>
              {(a) => <Input {...a} inputMode="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />}
            </Field>
            <Field label="Instagram" error={errors.instagram}>
              {(a) => <Input {...a} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@namaorganisasi" />}
            </Field>
          </div>
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
