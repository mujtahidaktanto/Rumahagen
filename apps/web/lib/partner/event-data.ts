// lib/partner/event-data.ts — data Ajukan Event Mitra (M05, wireframe 03-Developer-Partner/M05-Ajukan-Event-Mitra). Satu baris (submitted_by = userId) sama persis dengan Agent
// (events tidak punya kolom khusus per peran) — getMyEventForEdit DIPAKAI ULANG langsung dari lib/agent/event-data.ts (murni per userId, tanpa logika khas Agent). Pilihan
// "Proyek terkait" DIBATASI proyek milik mitra sendiri (POST /developer-partners/events memvalidasi ini di server; PUT /events/{id} generik TIDAK — dicatat sebagai celah di
// audit/FRONTEND_GAPS.md, jadi pembatasan di sini juga jadi pagar sisi klien).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export { getMyEventForEdit, getEventRegistrants } from "@/lib/agent/event-data";
export type { EditableEvent, EditableEventResult, Registrant } from "@/lib/agent/event-data";

export type MySubmittedEvent = { id: string; title: string; category: string; startAt: string; status: string };

export async function getMySubmittedEvents(userId: string): Promise<Part<MySubmittedEvent[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, category, start_at, status")
    .eq("submitted_by", userId)
    .is("deleted_at", null)
    .order("start_at", { ascending: false })
    .limit(100)
    .returns<{ id: string; title: string; category: string; start_at: string; status: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((e) => ({ id: e.id, title: e.title, category: e.category, startAt: e.start_at, status: e.status })) };
}
