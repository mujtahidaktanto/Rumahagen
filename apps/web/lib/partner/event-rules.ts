// lib/partner/event-rules.ts — aturan Ajukan Event Mitra (M05, wireframe 03-Developer-Partner/M05-Ajukan-Event-Mitra). Logika inti DIPAKAI ULANG dari lib/agent/event-rules.ts
// (murni, sudah diuji) — hanya field yang benar-benar berbeda didefinisikan di sini:
//   * Developer Partner TIDAK punya organisasi -> visibilitas "Organisasi Saya" tidak ditawarkan (komentar wireframe sendiri: "mitra tidak punya organisasi").
//   * Kategori bawaan "Peluncuran Proyek" (bukan "Pelatihan" seperti Agent) — event mitra lazimnya launching/open house.
//   * Bisa diubah HANYA selagi status pending_approval (wireframe: `canEdit: e.status === 'pending_approval'`) — beda dari Agent yang boleh mengedit event
//     ditolak untuk mengajukan ulang (m05.event.publish tidak dimiliki mitra sama sekali, jadi tidak ada tombol Terbitkan atau alur ajukan-ulang di sini).
export { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL, EVENT_STATUS_LABEL, EVENT_STATUS_TONE, wibLocalToIso, isoToWibLocal, toEventPayload, validateEvent, APPROVAL_MODES, APPROVAL_LABEL } from "@/lib/agent/event-rules";
export type { EventFormValues, EventErrors } from "@/lib/agent/event-rules";

import { EMPTY_EVENT, type EventFormValues } from "@/lib/agent/event-rules";

export const PARTNER_VISIBILITIES = [
  { value: "public", label: "Publik" },
  { value: "private", label: "Privat" },
] as const;

export const PARTNER_EMPTY_EVENT: EventFormValues = { ...EMPTY_EVENT, category: "launching_proyek" };

/** Mitra hanya boleh mengubah pengajuan yang masih Menunggu Persetujuan — penerbitan dan pembatalan dilakukan tim RumahAgen. */
export const canEditPartnerEvent = (status: string) => status === "pending_approval";
