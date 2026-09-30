// lib/instructor/event-rules.ts — aturan Event Instruktur (M05, wireframe 04-Instructor/M05-Event-Instruktur). Logika inti DIPAKAI ULANG dari lib/agent/event-rules.ts (murni,
// sudah diuji) — Instructor punya persis permission set yang sama dengan Agent untuk M05 (m05.event.create/update/publish/lifecycle/visibility, scope own, TANPA cancellation;
// SOURCE-Instructor.md §4), beda dari Developer Partner yang tidak punya publish/lifecycle sama sekali (lihat lib/partner/event-rules.ts). Jadi canPublishEvent/canResubmitEvent/
// canEditEvent dipakai APA ADANYA dari Agent, tidak seperti Partner yang menuliskan canEditPartnerEvent sendiri. Satu-satunya beda: Instructor tidak punya organisasi (mirip
// Partner) -> visibilitas "Organisasi Saya" tidak ditawarkan.
export {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABEL,
  EVENT_STATUS_LABEL,
  EVENT_STATUS_TONE,
  REGISTRATION_LABEL,
  REGISTRATION_TONE,
  APPROVAL_MODES,
  APPROVAL_LABEL,
  wibLocalToIso,
  isoToWibLocal,
  canEditEvent,
  canPublishEvent,
  canResubmitEvent,
  registrantActions,
  countRegistrants,
  canCancelRegistration,
  validateEvent,
  toEventPayload,
  EMPTY_EVENT,
} from "@/lib/agent/event-rules";
export type { EventFormValues, EventErrors, RegistrantAction, RegistrantCounts } from "@/lib/agent/event-rules";

export const INSTRUCTOR_VISIBILITIES = [
  { value: "public", label: "Publik" },
  { value: "private", label: "Privat" },
] as const;
