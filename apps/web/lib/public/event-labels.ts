// lib/public/event-labels.ts — kategori dan label status Event, murni (tanpa impor server) agar aman dipakai komponen klien. Diekspor ulang dari event-data.ts.
export const EVENT_CATEGORIES = ["training", "launching_proyek", "open_house", "gathering"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export const EVENT_CATEGORY_LABEL: Record<string, string> = { training: "Training", launching_proyek: "Launching Proyek", open_house: "Open House", gathering: "Gathering" };
export const REGISTRATION_STATUS_LABEL: Record<string, string> = {
  registered: "Terdaftar",
  pending_approval: "Menunggu persetujuan penyelenggara",
  waitlist: "Daftar tunggu",
  attended: "Sudah hadir",
  cancelled: "Dibatalkan",
};
