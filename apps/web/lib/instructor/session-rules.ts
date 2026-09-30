// lib/instructor/session-rules.ts — aturan murni Sesi (M04, wireframe 04-Instructor/M04-{Sesi-Saya,Form-Sesi,Detail-Sesi}). Label DIPAKAI ULANG dari lib/public/learning-data.ts
// (sudah dipakai sisi publik/Agent, murni tanpa I/O); waktu WIB DIPAKAI ULANG dari lib/agent/event-rules.ts (logika sama persis, tidak spesifik Event). Tidak ada trigger transisi
// status di DB untuk learning_sessions (beda dari developer_projects/events) — pemilik/instruktur penugasan bebas memilih status apa pun sesuai izinnya, tidak ada urutan wajib.
import type { BadgeTone } from "@/components/ui/Badge";
import { SESSION_STATUS_LABEL, SESSION_TYPE_LABEL, SESSION_VISIBILITY_LABEL, sessionTitle } from "@/lib/public/learning-labels";
import { wibLocalToIso, isoToWibLocal } from "@/lib/agent/event-rules";

export { SESSION_STATUS_LABEL, SESSION_TYPE_LABEL, SESSION_VISIBILITY_LABEL, sessionTitle, wibLocalToIso, isoToWibLocal };

export const SESSION_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  scheduled: "info",
  live: "success",
  ended: "neutral",
  cancelled: "danger",
  failed: "danger",
};
export const sessionStatus = (s: string) => ({ label: SESSION_STATUS_LABEL[s] ?? s, tone: SESSION_STATUS_TONE[s] ?? ("neutral" as BadgeTone) });
export const SESSION_STATUS_OPTIONS = ["draft", "scheduled", "live", "ended", "cancelled", "failed"] as const;

export const ENROLLMENT_STATUS_LABEL: Record<string, string> = { pending: "Menunggu", active: "Aktif", completed: "Selesai" };
export const enrollmentStatus = (s: string) => ({ label: ENROLLMENT_STATUS_LABEL[s] ?? s, tone: (s === "completed" ? "success" : s === "active" ? "info" : "neutral") as BadgeTone });

// ── Formulir Sesi ──
export type SessionForm = { sessionType: "broadcast" | "interactive" | "on_demand"; courseId: string; startAt: string; endAt: string; visibility: "public" | "organization" | "partner" | "private" };
export const EMPTY_SESSION: SessionForm = { sessionType: "interactive", courseId: "", startAt: "", endAt: "", visibility: "public" };

export type SessionErrors = Partial<Record<"startAt" | "endAt", string>>;

export function validateSessionForm(f: SessionForm): SessionErrors {
  const errors: SessionErrors = {};
  const start = wibLocalToIso(f.startAt);
  if (!f.startAt.trim()) errors.startAt = "Waktu mulai wajib diisi.";
  else if (!start) errors.startAt = "Waktu mulai tidak valid.";
  if (f.endAt.trim()) {
    const end = wibLocalToIso(f.endAt);
    if (!end) errors.endAt = "Waktu selesai tidak valid.";
    else if (start && Date.parse(end) <= Date.parse(start)) errors.endAt = "Waktu selesai harus setelah waktu mulai.";
  }
  return errors;
}

export function toSessionPayload(f: SessionForm): Record<string, unknown> {
  const end = wibLocalToIso(f.endAt);
  return {
    session_type: f.sessionType,
    course_id: f.courseId || undefined,
    start_at: wibLocalToIso(f.startAt),
    ...(end ? { end_at: end } : {}),
    visibility: f.visibility,
  };
}

/** Peran tim pengampu (learning_session_assignments.capability). */
export const CAPABILITY_LABEL: Record<string, string> = { HOST: "Host", INSTRUCTOR: "Instruktur" };
