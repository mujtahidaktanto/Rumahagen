"use client";

// components/admin/BannerFormDialog.tsx — Buat/Ubah Banner (Konten & Notifikasi, tab Banner & Promosi): POST/PUT /admin/banners(/{id}) atas public_announcement_promotion (migration 0014/0028).
// Tombol CTA dipilih terstruktur (jenis + isi) lewat lib/admin/cta-builder.ts — admin TIDAK mengetik format "jenis:isi" manual (keputusan produk "CTA promo terstruktur").
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { BannerRow } from "@/lib/admin/content-notif-data";
import { buildCtaReference, parseCtaForEdit, CTA_KINDS, CTA_KIND_LABEL, CTA_PAGE_OPTIONS, type CtaFormValue } from "@/lib/admin/cta-builder";
import { ApiClientError, api } from "@/lib/api-client";

const STATUS_OPTIONS = ["draft", "scheduled", "active", "expired", "archived"] as const;

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

type Form = { title: string; content: string; imageReference: string; campaignReference: string; priority: string; scheduleAt: string; expiresAt: string; status: (typeof STATUS_OPTIONS)[number]; cta: CtaFormValue };

function formFrom(b?: BannerRow): Form {
  return {
    title: b?.title ?? "",
    content: b?.content ?? "",
    imageReference: b?.imageReference ?? "",
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setF(formFrom(banner));
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!f.title.trim()) {
      setError("Judul wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    const body = {
      title: f.title.trim(),
      content: f.content.trim() || undefined,
      image_reference: f.imageReference.trim() || undefined,
      cta_reference: buildCtaReference(f.cta) ?? undefined,
      campaign_reference: f.campaignReference.trim() || undefined,
      priority: Number(f.priority) || 0,
      schedule_at: toIso(f.scheduleAt) ?? undefined,
      expires_at: toIso(f.expiresAt) ?? undefined,
      status: f.status,
    };
    try {
      if (isEdit) await api.put(`/admin/banners/${banner.id}`, body, { idempotency: true });
      else await api.post("/admin/banners", body, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
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
        title={isEdit ? "Ubah Banner" : "Buat Banner"}
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
          <Field label="Judul" required>
            {(a) => <Input {...a} value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />}
          </Field>
          <Field label="Isi">{(a) => <Textarea {...a} rows={2} value={f.content} onChange={(e) => setF((x) => ({ ...x, content: e.target.value }))} />}</Field>
          <Field label="URL Gambar" hint="image_reference — jalur situs atau https">
            {(a) => <Input {...a} value={f.imageReference} onChange={(e) => setF((x) => ({ ...x, imageReference: e.target.value }))} />}
          </Field>

          <fieldset className="flex flex-col gap-2 rounded-sm border border-ink-100 p-3">
            <legend className="px-1 text-label-lg">Tombol CTA</legend>
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
    </>
  );
}
