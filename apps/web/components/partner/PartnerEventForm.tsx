"use client";

// components/partner/PartnerEventForm.tsx — Ajukan/Ubah Event Mitra (M05, wireframe 03-Developer-Partner/M05-Ajukan-Event-Mitra). Mode baru: POST /developer-partners/events
// (endpoint khusus yang memvalidasi related_project_id benar-benar milik mitra, beda dari POST /events generik). Mode ubah: PUT /events/{id}, hanya diizinkan selagi
// pending_approval (canEditPartnerEvent) — tidak ada tombol Terbitkan sama sekali (mitra tidak punya m05.event.publish). Waktu WIB, empat keadaan (idle/menyimpan/sukses/gagal).
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { CheckCircleIcon, ChevronLeftIcon } from "@/components/ui/icons";
import type { Part } from "@/lib/agent/dashboard-data";
import type { ProjectOption } from "@/lib/partner/marketing-kit-data";
import {
  APPROVAL_MODES,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABEL,
  EVENT_STATUS_LABEL,
  EVENT_STATUS_TONE,
  PARTNER_EMPTY_EVENT,
  PARTNER_VISIBILITIES,
  canEditPartnerEvent,
  toEventPayload,
  validateEvent,
  type EventErrors,
  type EventFormValues,
} from "@/lib/partner/event-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type Props = { mode: "baru" | "ubah"; eventId?: string; status?: string; initial?: EventFormValues; projects: Part<ProjectOption[]> };

const BANNER: Record<string, { cls: string; title: string; caption: string }> = {
  pending_approval: { cls: "border-warning-600/40 bg-warning-100", title: "Menunggu Persetujuan Tim", caption: "Event tampil publik setelah tim RumahAgen menerbitkannya. Anda mendapat notifikasi saat ada keputusan." },
  published: { cls: "border-success-600/40 bg-success-100", title: "Terbit", caption: "Event ini sedang tayang. Perubahan lebih lanjut hanya lewat tim RumahAgen." },
  rejected: { cls: "border-danger-600/40 bg-danger-100", title: "Ditolak Tim", caption: "Pengajuan ini ditolak. Hubungi tim RumahAgen untuk detail; tidak bisa diajukan ulang dari sini." },
  cancelled: { cls: "border-ink-200 bg-neutral-100", title: "Dibatalkan", caption: "Event ini sudah dibatalkan oleh tim RumahAgen." },
};

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5 sm:p-6">
      <h2 className="text-title-md">
        {title}
        {note ? <span className="ml-1.5 text-caption font-normal">{note}</span> : null}
      </h2>
      {children}
    </section>
  );
}

function Chips<T extends string>({ label, value, onChange, items, disabled }: { label: string; value: T; onChange: (v: T) => void; items: readonly { value: T; label: string }[]; disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((i) => (
        <button
          key={i.value}
          type="button"
          role="radio"
          aria-checked={value === i.value}
          disabled={disabled}
          onClick={() => onChange(i.value)}
          className={cn(
            "min-h-11 rounded-pill border px-4 text-[13px] disabled:cursor-not-allowed disabled:opacity-60",
            value === i.value ? "border-blue-600 bg-blue-600 text-white" : "border-ink-200 bg-white text-ink-700 hover:border-blue-500",
          )}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

export function PartnerEventForm({ mode, eventId, status = "pending_approval", initial = PARTNER_EMPTY_EVENT, projects }: Props) {
  const router = useRouter();
  const manage = mode === "ubah";
  const locked = manage && !canEditPartnerEvent(status);
  const [v, setV] = useState<EventFormValues>(initial);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const set = <K extends keyof EventFormValues>(k: K, val: EventFormValues[K]) => setV((x) => ({ ...x, [k]: val }));
  const errors: EventErrors = shown ? validateEvent(v, { creating: !manage }) : {};
  const banner = manage ? (BANNER[status] ?? BANNER.pending_approval!) : null;
  const help = APPROVAL_MODES.find((m) => m.value === v.approvalMode)?.help;
  const projectList = projects.ok ? projects.data : [];

  async function save() {
    setShown(true);
    setNotice(null);
    setError(null);
    if (Object.keys(validateEvent(v, { creating: !manage })).length > 0) return;
    setBusy(true);
    try {
      if (!manage) {
        const res = await api.post<{ id: string }>("/developer-partners/events", toEventPayload(v), { idempotency: true });
        router.push(`/partner/event/${res.data.id}` as Route);
        return;
      }
      await api.put(`/events/${eventId}`, toEventPayload(v));
      setNotice("Perubahan tersimpan.");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Pengajuan gagal terkirim. Data Anda masih di form; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href={"/partner/event" as Route} aria-label="Kembali ke Event" className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-700 hover:bg-ink-50">
          <ChevronLeftIcon size={20} />
        </Link>
        <h1 className="text-headline">{manage ? "Ubah Pengajuan Event" : "Ajukan Event"}</h1>
      </div>

      {!manage ? (
        <p className="mb-5 rounded-md border border-blue-200 bg-info-100 p-3.5 text-body-md text-ink-700">
          Event Anda <strong>tidak langsung tayang</strong>. Tim RumahAgen meninjau setiap pengajuan mitra sebelum diterbitkan.
        </p>
      ) : null}

      {banner ? (
        <div className={cn("mb-5 flex flex-wrap items-center justify-between gap-3 rounded-md border p-4", banner.cls)}>
          <div className="min-w-0">
            <span className="flex items-center gap-2 text-label-lg">
              {banner.title}
              <Badge tone={EVENT_STATUS_TONE[status] ?? "neutral"} dot={false}>
                {EVENT_STATUS_LABEL[status] ?? status}
              </Badge>
            </span>
            <p className="text-caption">{banner.caption}</p>
          </div>
        </div>
      ) : null}

      {notice ? (
        <p role="status" className="mb-5 flex items-center gap-2.5 rounded-md border border-success-600/30 bg-success-100 p-3.5 text-body-md text-success-600">
          <CheckCircleIcon size={18} />
          {notice}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-5 rounded-md border border-danger-600/30 bg-danger-100 p-3.5 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-5">
        <Card title="Informasi Dasar">
          <Field label="Judul Event" required error={errors.title} hint={`${v.title.length}/200`}>
            {(a) => <Input {...a} maxLength={200} disabled={locked} placeholder="Contoh: Open House Perumahan Green Valley" value={v.title} onChange={(e) => set("title", e.target.value)} />}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Kategori</span>
            <Chips label="Kategori event" value={v.category} onChange={(c) => set("category", c)} disabled={locked} items={EVENT_CATEGORIES.map((c) => ({ value: c, label: EVENT_CATEGORY_LABEL[c] ?? c }))} />
            {errors.category ? <p role="alert" className="text-caption text-danger-600">{errors.category}</p> : null}
          </div>
          <Field label="Deskripsi">
            {(a) => <Textarea {...a} rows={4} disabled={locked} placeholder="Ceritakan agenda, siapa yang cocok hadir, dan apa yang didapat peserta…" value={v.description} onChange={(e) => set("description", e.target.value)} />}
          </Field>
        </Card>

        <Card title="Lokasi &amp; Waktu">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p id="ev-online" className="text-label-lg">
                Event Online
              </p>
              <p className="text-caption">Aktifkan jika event diadakan lewat video call atau webinar.</p>
            </div>
            <Switch checked={v.isOnline} onChange={(on) => set("isOnline", on)} disabled={locked} aria-labelledby="ev-online" />
          </div>
          {v.isOnline ? (
            <Field label="Link Meeting" error={errors.meetingLink} hint="Tidak ditampilkan di halaman publik.">
              {(a) => <Input {...a} inputMode="url" disabled={locked} placeholder="https://meet.google.com/xxx-yyyy-zzz" value={v.meetingLink} onChange={(e) => set("meetingLink", e.target.value)} />}
            </Field>
          ) : (
            <Field label="Lokasi" error={errors.location}>
              {(a) => <Input {...a} maxLength={255} disabled={locked} placeholder="Nama gedung atau perumahan, alamat lengkap" value={v.location} onChange={(e) => set("location", e.target.value)} />}
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mulai (WIB)" required error={errors.startAt}>
              {(a) => <Input {...a} type="datetime-local" disabled={locked} value={v.startAt} onChange={(e) => set("startAt", e.target.value)} />}
            </Field>
            <Field label="Selesai (WIB), opsional" error={errors.endAt}>
              {(a) => <Input {...a} type="datetime-local" disabled={locked} value={v.endAt} onChange={(e) => set("endAt", e.target.value)} />}
            </Field>
          </div>
          <Field label="Host / Pembicara, opsional" error={errors.host}>
            {(a) => <Input {...a} maxLength={150} disabled={locked} value={v.host} onChange={(e) => set("host", e.target.value)} />}
          </Field>
        </Card>

        <Card title="Kapasitas, Registrasi &amp; Visibilitas">
          <Field label="Kuota Peserta, opsional" error={errors.quota} hint="Informasi saja. Sistem belum membatasi jumlah pendaftar.">
            {(a) => <Input {...a} type="number" min={1} inputMode="numeric" disabled={locked} placeholder="Contoh: 50" value={v.quota} onChange={(e) => set("quota", e.target.value)} className="max-w-[180px]" />}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Mode Registrasi</span>
            <Chips label="Mode registrasi" value={v.approvalMode} onChange={(m) => set("approvalMode", m)} disabled={locked} items={APPROVAL_MODES} />
            {help ? <p className="text-caption">{help}</p> : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Visibilitas setelah terbit</span>
            <Chips label="Visibilitas event" value={v.visibility} onChange={(x) => set("visibility", x)} disabled={locked} items={PARTNER_VISIBILITIES} />
          </div>
          <Field label="Proyek terkait" hint={projects.ok ? "Hanya proyek milik Anda sendiri." : "Daftar proyek gagal dimuat. Muat ulang halaman bila ingin memilih."}>
            {(a) => (
              <Select {...a} value={v.relatedProjectId} disabled={locked || (!projects.ok && !v.relatedProjectId)} onChange={(e) => set("relatedProjectId", e.target.value)}>
                <option value="">Tidak terkait</option>
                {projectList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            )}
          </Field>
        </Card>
      </div>

      <div className="sticky bottom-0 z-10 mt-5 -mx-4 border-t border-ink-100 bg-white px-4 py-3 lg:-mx-8 lg:px-8">
        <div className="flex justify-end gap-3">
          <Link href={"/partner/event" as Route} className="inline-flex h-11 items-center rounded-md border-[1.5px] border-ink-100 px-5 text-label-lg no-underline hover:no-underline">
            Batal
          </Link>
          {!locked ? (
            <Button loading={busy} disabled={busy} onClick={() => void save()}>
              {busy ? "Mengirim…" : manage ? "Simpan Perubahan" : "Ajukan Event"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
