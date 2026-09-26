"use client";

// components/agent/EventForm.tsx — Ajukan Event dan Kelola Event (M05, wireframe 01-Agent/M05-Ajukan-Event). Mode baru: POST /events (status awal "Belum Tayang"), lalu pindah ke halaman Kelola.
// Mode kelola: PUT /events/{id}; "Terbitkan Event" = PUT { status: "published" } (Agent punya izin m05.event.publish lingkup sendiri, ditegakkan trigger); event Ditolak diperbaiki lalu diajukan kembali
// (PUT status pending_approval). Waktu diisi dan ditampilkan dalam WIB. Bidang opsional yang sudah tersimpan tidak bisa dikosongkan lewat API (lihat audit/FRONTEND_GAPS.md). Empat keadaan: idle,
// menyimpan, sukses (pesan + halaman dimuat ulang), gagal (pesan server ditampilkan apa adanya).
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { CheckCircleIcon, ChevronLeftIcon } from "@/components/ui/icons";
import type { EventFormOptions, Option } from "@/lib/agent/event-data";
import {
  APPROVAL_MODES,
  EMPTY_EVENT,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABEL,
  EVENT_STATUS_LABEL,
  EVENT_STATUS_TONE,
  VISIBILITIES,
  canPublishEvent,
  canResubmitEvent,
  toEventPayload,
  validateEvent,
  type EventErrors,
  type EventFormValues,
} from "@/lib/agent/event-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type Props = { mode: "baru" | "kelola"; eventId?: string; status?: string; initial?: EventFormValues; options: EventFormOptions; justCreated?: boolean; /** Kartu tambahan di bawah formulir (mis. Pendaftar untuk penyelenggara). */ extra?: ReactNode };

const BANNER: Record<string, { cls: string; title: string; caption: string }> = {
  pending_approval: { cls: "border-warning-600/40 bg-warning-100", title: "Belum Tayang", caption: "Event ini belum terlihat publik. Terbitkan agar Agent lain bisa menemukan dan mendaftar." },
  published: { cls: "border-success-600/40 bg-success-100", title: "Sedang Tayang", caption: "Event ini terlihat publik sesuai visibilitas yang dipilih." },
  rejected: { cls: "border-danger-600/40 bg-danger-100", title: "Ditolak Tim RumahAgen", caption: "Perbaiki informasi di bawah lalu ajukan kembali." },
  cancelled: { cls: "border-ink-200 bg-neutral-100", title: "Dibatalkan", caption: "Event ini sudah dibatalkan dan tidak bisa diubah lagi." },
};

function Card({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
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

function Pick({ id, label, value, onChange, opts, disabled }: { id: string; label: string; value: string; onChange: (v: string) => void; opts: EventFormOptions["courses"]; disabled: boolean }) {
  const list: Option[] = opts.ok ? opts.data : [];
  return (
    <Field label={label} hint={opts.ok ? undefined : "Daftar gagal dimuat. Muat ulang halaman bila ingin memilih."}>
      {(a) => (
        <Select {...a} id={id} value={value} disabled={disabled || (!opts.ok && !value)} onChange={(e) => onChange(e.target.value)}>
          <option value="">Tidak terkait</option>
          {value && !list.some((o) => o.id === value) ? <option value={value}>(pilihan tersimpan)</option> : null}
          {list.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

export function EventForm({ mode, eventId, status = "pending_approval", initial = EMPTY_EVENT, options, justCreated = false, extra }: Props) {
  const router = useRouter();
  const manage = mode === "kelola";
  const locked = manage && status === "cancelled";
  const [v, setV] = useState<EventFormValues>(initial);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState<"idle" | "save" | "publish">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(justCreated ? "Event tersimpan dengan status Belum Tayang. Terbitkan agar terlihat publik." : null);
  const [confirmPublish, setConfirmPublish] = useState(false);

  const set = <K extends keyof EventFormValues>(k: K, val: EventFormValues[K]) => setV((x) => ({ ...x, [k]: val }));
  const errors: EventErrors = shown ? validateEvent(v, { creating: !manage }) : {};
  const banner = BANNER[status] ?? BANNER.pending_approval!;
  const help = APPROVAL_MODES.find((m) => m.value === v.approvalMode)?.help;
  const resubmit = manage && canResubmitEvent(status);

  const errMsg = (e: unknown, fallback: string) => (e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : fallback);

  async function save(publishAfter = false) {
    setShown(true);
    setNotice(null);
    setError(null);
    if (Object.keys(validateEvent(v, { creating: !manage })).length > 0) return;
    setBusy(publishAfter ? "publish" : "save");
    try {
      if (!manage) {
        const res = await api.post<{ id: string }>("/events", toEventPayload(v), { idempotency: true });
        router.push(`/agent/event/${res.data.id}?baru=1` as Route);
        return;
      }
      await api.put(`/events/${eventId}`, { ...toEventPayload(v), ...(publishAfter ? { status: "published" } : resubmit ? { status: "pending_approval" } : {}) });
      setConfirmPublish(false);
      setNotice(publishAfter ? "Event diterbitkan dan kini terlihat publik sesuai visibilitasnya." : resubmit ? "Perubahan tersimpan dan event diajukan kembali." : "Perubahan tersimpan.");
      router.refresh();
    } catch (e) {
      setConfirmPublish(false);
      setError(errMsg(e, "Terjadi gangguan. Periksa koneksi Anda lalu coba lagi."));
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="mx-auto w-full max-w-[720px] p-4 lg:p-8">
      <div className="mb-5 flex items-center gap-3">
        <Link href={"/agent/event" as Route} aria-label="Kembali ke Event Saya" className="flex h-11 w-11 flex-none items-center justify-center rounded-full text-ink-700 hover:bg-ink-50">
          <ChevronLeftIcon size={20} />
        </Link>
        <h1 className="text-headline">{manage ? "Kelola Event" : "Ajukan Event"}</h1>
      </div>

      {manage ? (
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
          {canPublishEvent(status) ? <Button size="sm" onClick={() => setConfirmPublish(true)}>Terbitkan Event</Button> : null}
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
          <Field label="Judul Event" required error={errors.title} hint="Maksimum 200 karakter.">
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

        <Card title="Lokasi & Waktu">
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

        <Card title="Kapasitas & Registrasi">
          <Field label="Kuota Peserta, opsional" error={errors.quota} hint="Informasi saja. Sistem belum membatasi jumlah pendaftar.">
            {(a) => <Input {...a} type="number" min={1} inputMode="numeric" disabled={locked} placeholder="Contoh: 50" value={v.quota} onChange={(e) => set("quota", e.target.value)} className="max-w-[180px]" />}
          </Field>
          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">Mode Registrasi</span>
            <Chips label="Mode registrasi" value={v.approvalMode} onChange={(m) => set("approvalMode", m)} disabled={locked} items={APPROVAL_MODES} />
            {help ? <p className="text-caption">{help}</p> : null}
          </div>
        </Card>

        <Card title="Visibilitas">
          <Chips label="Visibilitas event" value={v.visibility} onChange={(x) => set("visibility", x)} disabled={locked} items={VISIBILITIES} />
          {v.visibility !== "public" ? <p className="text-caption">Hanya event berstatus Tayang dengan visibilitas Publik yang muncul di halaman Event publik.</p> : null}
        </Card>

        <Card title="Terkait" note="(opsional)">
          <div className="grid gap-4 sm:grid-cols-2">
            <Pick id="ev-course" label="Course Terkait" value={v.relatedCourseId} onChange={(x) => set("relatedCourseId", x)} opts={options.courses} disabled={locked} />
            <Pick id="ev-project" label="Proyek Developer Terkait" value={v.relatedProjectId} onChange={(x) => set("relatedProjectId", x)} opts={options.projects} disabled={locked} />
          </div>
        </Card>
      </div>

      {extra ? <div className="mt-5">{extra}</div> : null}

      <div className="sticky bottom-0 z-10 mt-5 -mx-4 border-t border-ink-100 bg-white px-4 py-3 lg:-mx-8 lg:px-8">
        <div className="flex justify-end gap-3">
          <Link href={"/agent/event" as Route} className="inline-flex h-11 items-center rounded-md border-[1.5px] border-ink-100 px-5 text-label-lg no-underline hover:no-underline">
            Batal
          </Link>
          {!locked ? (
            <Button loading={busy === "save"} disabled={busy !== "idle"} onClick={() => void save(false)}>
              {busy === "save" ? "Menyimpan…" : !manage ? "Ajukan Event" : resubmit ? "Simpan & Ajukan Kembali" : "Simpan Perubahan"}
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog
        open={confirmPublish}
        onClose={() => (busy === "publish" ? undefined : setConfirmPublish(false))}
        title="Terbitkan event?"
        description="Event langsung tayang dan Agent lain bisa mendaftar (sesuai visibilitas dan mode registrasi). Perubahan yang sudah Anda isi di formulir ikut tersimpan."
        footer={
          <>
            <Button variant="secondary" disabled={busy === "publish"} onClick={() => setConfirmPublish(false)}>
              Batal
            </Button>
            <Button loading={busy === "publish"} onClick={() => void save(true)}>
              Terbitkan
            </Button>
          </>
        }
      />
    </div>
  );
}
