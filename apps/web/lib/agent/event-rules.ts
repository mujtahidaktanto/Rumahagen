// lib/agent/event-rules.ts — aturan murni layar Event Agent (M05 Event Saya, Ajukan/Kelola Event): waktu WIB untuk input datetime-local, label dan nada status (nilai CHECK apa adanya),
// validasi formulir, dan badan POST/PUT /events. Tanpa I/O agar bisa dipakai komponen klien dan diuji. Batas mengikuti createEventSchema (lib/validation/events.ts); server penentu akhir.
import type { BadgeTone } from "@/components/ui/Badge";
import { isHttpsUrl } from "@/lib/agent/listing-wizard";
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL } from "@/lib/public/event-labels";

export { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL };

// ── Waktu WIB <-> input datetime-local ("YYYY-MM-DDTHH:mm") ──
const WIB_OFFSET_MS = 7 * 3_600_000;

/** Nilai datetime-local (waktu dinding WIB) -> ISO UTC; null bila kosong/tidak valid. */
export function wibLocalToIso(local: string): string | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number) as [number, number, number, number, number];
  const t = Date.UTC(y, mo - 1, d, h, mi) - WIB_OFFSET_MS;
  const back = new Date(t + WIB_OFFSET_MS);
  if (back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) return null; // tanggal mustahil (mis. 31 Februari)
  return new Date(t).toISOString();
}

/** ISO -> nilai datetime-local waktu dinding WIB. */
export function isoToWibLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t + WIB_OFFSET_MS).toISOString().slice(0, 16);
}

// ── Status ──
export const EVENT_STATUS_LABEL: Record<string, string> = { pending_approval: "Belum Tayang", published: "Tayang", rejected: "Ditolak", cancelled: "Dibatalkan" };
export const EVENT_STATUS_TONE: Record<string, BadgeTone> = { pending_approval: "warning", published: "success", rejected: "danger", cancelled: "neutral" };

export const REGISTRATION_LABEL: Record<string, string> = {
  registered: "Terdaftar",
  waitlist: "Daftar Tunggu",
  pending_approval: "Menunggu Persetujuan",
  attended: "Selesai Dihadiri",
  cancelled: "Dibatalkan",
};
export const REGISTRATION_TONE: Record<string, BadgeTone> = { registered: "success", waitlist: "warning", pending_approval: "info", attended: "neutral", cancelled: "danger" };

export const APPROVAL_MODES = [
  { value: "auto_confirm", label: "Otomatis", help: 'Pendaftar langsung berstatus "Terdaftar" tanpa perlu Anda tinjau.' },
  { value: "manual_approval", label: "Perlu Persetujuan", help: 'Pendaftar masuk status "Menunggu" dan Anda meninjau satu per satu.' },
  { value: "closed", label: "Ditutup", help: "Tidak ada pendaftaran baru yang diterima sama sekali." },
] as const;
export const APPROVAL_LABEL: Record<string, string> = Object.fromEntries(APPROVAL_MODES.map((m) => [m.value, m.label]));

export const VISIBILITIES = [
  { value: "public", label: "Publik" },
  { value: "organization", label: "Organisasi Saya" },
  { value: "private", label: "Privat" },
] as const;

/** Bisa diedit selama belum dibatalkan. */
export const canEditEvent = (status: string) => status !== "cancelled";
/** Tombol "Terbitkan Event" hanya untuk event yang belum tayang (Agent punya izin m05.event.publish, lingkup sendiri). */
export const canPublishEvent = (status: string) => status === "pending_approval";
/** Event ditolak tim: diperbaiki lalu diajukan kembali (status kembali ke pending_approval), bukan diterbitkan langsung. */
export const canResubmitEvent = (status: string) => status === "rejected";

// ── Formulir ──
export type EventFormValues = {
  title: string;
  category: string;
  description: string;
  isOnline: boolean;
  meetingLink: string;
  location: string;
  /** Waktu dinding WIB, format datetime-local. */
  startAt: string;
  endAt: string;
  host: string;
  quota: string;
  approvalMode: string;
  visibility: string;
  relatedCourseId: string;
  relatedProjectId: string;
};

export const EMPTY_EVENT: EventFormValues = {
  title: "",
  category: "training",
  description: "",
  isOnline: false,
  meetingLink: "",
  location: "",
  startAt: "",
  endAt: "",
  host: "",
  quota: "",
  approvalMode: "auto_confirm",
  visibility: "public",
  relatedCourseId: "",
  relatedProjectId: "",
};

export type EventErrors = Partial<Record<"title" | "category" | "meetingLink" | "location" | "startAt" | "endAt" | "host" | "quota", string>>;

export function validateEvent(v: EventFormValues, opts: { creating: boolean; now?: Date } = { creating: false }): EventErrors {
  const e: EventErrors = {};
  const title = v.title.trim();
  if (!title) e.title = "Judul event wajib diisi.";
  else if (title.length > 200) e.title = "Maksimal 200 karakter.";
  if (!(EVENT_CATEGORIES as readonly string[]).includes(v.category)) e.category = "Pilih kategori event.";

  if (v.isOnline) {
    const link = v.meetingLink.trim();
    if (link && !isHttpsUrl(link)) e.meetingLink = "Tautan harus diawali https://.";
    else if (link.length > 500) e.meetingLink = "Maksimal 500 karakter.";
  } else if (v.location.trim().length > 255) e.location = "Maksimal 255 karakter.";

  const start = wibLocalToIso(v.startAt);
  if (!v.startAt.trim()) e.startAt = "Waktu mulai wajib diisi.";
  else if (!start) e.startAt = "Waktu mulai tidak valid.";
  else if (opts.creating && Date.parse(start) < (opts.now ?? new Date()).getTime()) e.startAt = "Waktu mulai sudah lewat. Pilih waktu yang akan datang.";

  if (v.endAt.trim()) {
    const end = wibLocalToIso(v.endAt);
    if (!end) e.endAt = "Waktu selesai tidak valid.";
    else if (start && Date.parse(end) <= Date.parse(start)) e.endAt = "Waktu selesai harus setelah waktu mulai.";
  }

  if (v.host.trim().length > 150) e.host = "Maksimal 150 karakter.";
  const q = v.quota.trim();
  if (q && !/^[1-9][0-9]{0,8}$/.test(q)) e.quota = "Isi bilangan bulat lebih dari 0.";
  return e;
}

/**
 * Badan POST/PUT /events. Bidang opsional yang kosong tidak dikirim (API tidak menerima null): bidang yang sudah terisi tidak bisa dikosongkan lewat API (celah di audit/FRONTEND_GAPS.md),
 * kecuali teks bebas (deskripsi, lokasi, tautan, host) yang boleh dikirim sebagai string kosong.
 */
export function toEventPayload(v: EventFormValues): Record<string, unknown> {
  const end = wibLocalToIso(v.endAt);
  const quota = v.quota.trim();
  return {
    title: v.title.trim(),
    category: v.category,
    description: v.description.trim(),
    is_online: v.isOnline,
    location: v.isOnline ? "" : v.location.trim(),
    meeting_link: v.isOnline ? v.meetingLink.trim() : "",
    host: v.host.trim(),
    start_at: wibLocalToIso(v.startAt),
    ...(end ? { end_at: end } : {}),
    ...(quota ? { quota: Number(quota) } : {}),
    registration_approval_mode: v.approvalMode,
    visibility: v.visibility,
    ...(v.relatedCourseId ? { related_course_id: v.relatedCourseId } : {}),
    ...(v.relatedProjectId ? { related_project_id: v.relatedProjectId } : {}),
  };
}

/** Jadwal ringkas "2 Okt 2026, 10.00 WIB" dari ISO (untuk daftar). */
export function scheduleLabel(iso: string, formatDateTime: (iso: string) => string): string {
  return formatDateTime(iso);
}
