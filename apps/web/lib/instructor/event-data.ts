// lib/instructor/event-data.ts — data Event Instruktur (M05, wireframe 04-Instructor/M05-Event-Instruktur). Satu baris (submitted_by = userId) sama persis dengan Agent (events
// tidak punya kolom khusus per peran) — getMyEventForEdit/getEventRegistrants/getEventFormOptions DIPAKAI ULANG langsung dari lib/agent/event-data.ts (murni per userId, tanpa
// logika khas Agent), pola sama seperti lib/partner/event-data.ts. Formulir Instructor hanya menawarkan "Kursus terkait" (bukan proyek — instruktur tidak punya proyek developer),
// jadi options.projects dari getEventFormOptions dimuat tapi sengaja tidak dirender di EventForm.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export { getMyEventForEdit, getEventRegistrants, getEventFormOptions } from "@/lib/agent/event-data";
export type { EditableEvent, EditableEventResult, Registrant, EventFormOptions, Option } from "@/lib/agent/event-data";

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
