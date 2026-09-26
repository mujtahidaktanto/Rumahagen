// lib/public/event-data.ts — data Event publik (M11 Discovery tab Event dan Detail-Event), dibaca di server dengan RLS pemanggil: pengunjung hanya melihat event `published` dan `public`
// yang belum dihapus (events_select); event pending_approval/rejected/cancelled/organization/private tidak terlihat. `meeting_link` tidak pernah ditampilkan di halaman publik.
// Kuota: kolom `events.quota` ada tetapi tidak ditegakkan database dan jumlah pendaftar tidak terbaca publik (RLS event_registrations), jadi bilah "terisi/kuota" dan status penuh/daftar tunggu
// pada wireframe tidak bisa dihitung; halaman hanya menampilkan kuota total. Status pendaftaran milik pengguna sendiri dibaca (RLS: baris sendiri).
import { createClient } from "@/lib/supabase/server";

export { EVENT_CATEGORIES, EVENT_CATEGORY_LABEL, REGISTRATION_STATUS_LABEL, type EventCategory } from "./event-labels";
import { EVENT_CATEGORIES, type EventCategory } from "./event-labels";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isEventId = (v: string) => UUID.test(v);

export type EventSummary = {
  id: string;
  title: string;
  category: string;
  is_online: boolean;
  location: string | null;
  host: string | null;
  quota: number | null;
  start_at: string;
  end_at: string | null;
  registration_approval_mode: string;
};
const SUMMARY_SELECT = "id, title, category, is_online, location, host, quota, start_at, end_at, registration_approval_mode";

export const EVENT_PAGE_SIZE = 12;
export const EVENT_MAX_SHOWN = 96;
export type EventTime = "akan_datang" | "lalu";
export type EventSearch = { q: string; kategori: EventCategory | null; waktu: EventTime; tampil: number };

export function parseEventSearch(raw: Record<string, string | string[] | undefined>): EventSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const k = one(raw.kategori);
  const t = Number(one(raw.tampil));
  const tampil = Number.isFinite(t) && t >= EVENT_PAGE_SIZE && t <= EVENT_MAX_SHOWN ? Math.ceil(t / EVENT_PAGE_SIZE) * EVENT_PAGE_SIZE : EVENT_PAGE_SIZE;
  return {
    q: (one(raw.q) ?? "").trim().slice(0, 100),
    kategori: (EVENT_CATEGORIES as readonly string[]).includes(k ?? "") ? (k as EventCategory) : null,
    waktu: one(raw.waktu) === "lalu" ? "lalu" : "akan_datang",
    tampil,
  };
}

export function eventQuery(s: EventSearch, patch: Partial<EventSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.kategori) p.set("kategori", v.kategori);
  if (v.waktu !== "akan_datang") p.set("waktu", v.waktu);
  if (v.tampil !== EVENT_PAGE_SIZE) p.set("tampil", String(v.tampil));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export type EventSearchResult = { ok: true; items: EventSummary[]; total: number } | { ok: false; items: []; total: 0 };

/** Event yang sedang/akan berlangsung: berakhir >= sekarang (atau, tanpa jam selesai, mulai >= sekarang). "Lalu" = kebalikannya. */
export async function searchEvents(s: EventSearch, now: Date = new Date()): Promise<EventSearchResult> {
  const supabase = await createClient();
  const iso = now.toISOString();
  let query = supabase
    .from("events")
    .select(SUMMARY_SELECT, { count: "exact" })
    .eq("status", "published")
    .eq("visibility", "public")
    .is("deleted_at", null)
    .order("start_at", { ascending: s.waktu === "akan_datang" })
    .order("id", { ascending: true })
    .range(0, s.tampil - 1);
  query = s.waktu === "akan_datang" ? query.or(`end_at.gte.${iso},and(end_at.is.null,start_at.gte.${iso})`) : query.or(`end_at.lt.${iso},and(end_at.is.null,start_at.lt.${iso})`);
  if (s.kategori) query = query.eq("category", s.kategori);
  const kw = s.q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (kw) query = query.or(`title.ilike.%${kw}%,host.ilike.%${kw}%,location.ilike.%${kw}%`);
  const { data, count, error } = await query.returns<EventSummary[]>();
  if (error) return { ok: false, items: [], total: 0 };
  return { ok: true, items: data ?? [], total: count ?? 0 };
}

export type EventDetail = EventSummary & {
  description: string | null;
  course: { id: string; title: string } | null;
  project: { slug: string; name: string } | null;
};
export type EventDetailResult = { state: "ok"; event: EventDetail } | { state: "not_found" } | { state: "error" };

export async function getEventDetail(id: string): Promise<EventDetailResult> {
  if (!isEventId(id)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    // events.related_course_id TIDAK punya foreign key ke courses (hanya related_project_id yang punya), jadi course dibaca terpisah di bawah.
    .select(`${SUMMARY_SELECT}, description, related_course_id, project:developer_projects(slug, name)`)
    .eq("id", id)
    .eq("status", "published")
    .eq("visibility", "public")
    .is("deleted_at", null)
    .maybeSingle<EventSummary & { description: string | null; related_course_id: string | null; project: { slug: string; name: string } | null }>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };
  const { related_course_id, project, ...rest } = data;
  // Course terkait pelengkap: hanya yang terbit (RLS courses); gagal memuat tidak menjatuhkan halaman.
  let course: { id: string; title: string } | null = null;
  if (related_course_id) {
    const { data: c } = await supabase.from("courses").select("id, title").eq("id", related_course_id).eq("status", "published").is("deleted_at", null).maybeSingle<{ id: string; title: string }>();
    course = c ?? null;
  }
  return { state: "ok", event: { ...rest, course, project } };
}

/** Status pendaftaran diri-sendiri untuk event ini (null bila belum mendaftar). */
export async function getMyRegistrationStatus(eventId: string, userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("event_registrations").select("status").eq("event_id", eventId).eq("agent_id", userId).eq("participant_mode", "self").order("registered_at", { ascending: false }).limit(1);
  return data?.[0]?.status ?? null;
}

/** Sudah selesai? (berakhir < sekarang, atau tanpa jam selesai dan mulai < sekarang) */
export function isEventPast(e: Pick<EventSummary, "start_at" | "end_at">, now: Date = new Date()): boolean {
  return new Date(e.end_at ?? e.start_at).getTime() < now.getTime();
}
