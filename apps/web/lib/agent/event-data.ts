// lib/agent/event-data.ts — data layar Event Agent (M05 Event Saya dan Ajukan/Kelola Event), dibaca di server dengan RLS pemanggil. "Event yang Saya Daftar" = baris event_registrations milik
// sendiri (mode self); event-nya bisa tidak terbaca (event_select hanya menampilkan event tayang publik atau milik sendiri), maka judulnya cadangan "Event". "Event yang Saya Ajukan" = events.submitted_by
// = saya. Tiap bagian dimuat sendiri-sendiri agar gagal di satu bagian tidak menjatuhkan halaman.
import { PROJECT_STATUSES } from "@/lib/public/project-data";
import { isEventId } from "@/lib/public/event-data";
import { createClient } from "@/lib/supabase/server";
import type { Part } from "./dashboard-data";
import { isoToWibLocal, type EventFormValues } from "./event-rules";

export type MyRegistration = { id: string; eventId: string; title: string; category: string | null; startAt: string | null; endAt: string | null; status: string; eventStatus: string | null };
export type MySubmittedEvent = { id: string; title: string; category: string; startAt: string; status: string; approvalMode: string };
export type MyEvents = { registrations: Part<MyRegistration[]>; submitted: Part<MySubmittedEvent[]> };

const LIST_MAX = 100;

type RegRow = { id: string; event_id: string; status: string; event: { title: string; category: string; start_at: string; end_at: string | null; status: string; deleted_at: string | null } | null };

export async function getMyEvents(userId: string): Promise<MyEvents> {
  const supabase = await createClient();
  const [regs, subs] = await Promise.all([
    supabase
      .from("event_registrations")
      .select("id, event_id, status, event:events(title, category, start_at, end_at, status, deleted_at)")
      .eq("agent_id", userId)
      .eq("participant_mode", "self")
      .order("registered_at", { ascending: false })
      .limit(LIST_MAX)
      .returns<RegRow[]>(),
    supabase
      .from("events")
      .select("id, title, category, start_at, status, registration_approval_mode")
      .eq("submitted_by", userId)
      .is("deleted_at", null)
      .order("start_at", { ascending: false })
      .limit(LIST_MAX)
      .returns<{ id: string; title: string; category: string; start_at: string; status: string; registration_approval_mode: string }[]>(),
  ]);
  return {
    registrations: regs.error
      ? { ok: false }
      : {
          ok: true,
          data: (regs.data ?? []).map((r) => ({
            id: r.id,
            eventId: r.event_id,
            title: r.event?.title ?? "Event",
            category: r.event?.category ?? null,
            startAt: r.event?.start_at ?? null,
            endAt: r.event?.end_at ?? null,
            status: r.status,
            eventStatus: r.event?.status ?? null,
          })),
        },
    submitted: subs.error ? { ok: false } : { ok: true, data: (subs.data ?? []).map((s) => ({ id: s.id, title: s.title, category: s.category, startAt: s.start_at, status: s.status, approvalMode: s.registration_approval_mode })) },
  };
}

// ── Formulir ──
export type Option = { id: string; name: string };
export type EventFormOptions = { courses: Part<Option[]>; projects: Part<Option[]> };

/** Pilihan "Terkait": course tayang dan proyek developer yang terlihat publik. Gagal memuat = bagian itu kosong dengan penanda, formulir tetap bisa dipakai. */
export async function getEventFormOptions(): Promise<EventFormOptions> {
  const supabase = await createClient();
  const [c, p] = await Promise.all([
    supabase.from("courses").select("id, title").eq("status", "published").is("deleted_at", null).order("title").limit(200).returns<{ id: string; title: string }[]>(),
    supabase.from("developer_projects").select("id, name").in("status", [...PROJECT_STATUSES]).order("name").limit(200).returns<{ id: string; name: string }[]>(),
  ]);
  return {
    courses: c.error ? { ok: false } : { ok: true, data: (c.data ?? []).map((x) => ({ id: x.id, name: x.title })) },
    projects: p.error ? { ok: false } : { ok: true, data: (p.data ?? []).map((x) => ({ id: x.id, name: x.name })) },
  };
}

export type EditableEvent = { id: string; status: string; values: EventFormValues; submittedByMe: true; startIso: string; approvalMode: string; quota: number | null };
export type Registrant = { id: string; status: string; participantMode: string; guestEmail: string | null; registeredAt: string; agentName: string; agentOffice: string | null };

/** Daftar pendaftar untuk penyelenggara lewat RPC event_registrants (migration 0160). */
export async function getEventRegistrants(eventId: string): Promise<Part<Registrant[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("event_registrants", { p_event_id: eventId });
  if (error) return { ok: false };
  const rows = (data ?? []) as { id: string; status: string; participant_mode: string; guest_email: string | null; registered_at: string; agent_name: string; agent_office: string | null }[];
  return { ok: true, data: rows.map((r) => ({ id: r.id, status: r.status, participantMode: r.participant_mode, guestEmail: r.guest_email, registeredAt: r.registered_at, agentName: r.agent_name, agentOffice: r.agent_office })) };
}
export type EditableEventResult = { state: "ok"; event: EditableEvent } | { state: "not_found" } | { state: "error" };

type EventRow = {
  id: string;
  status: string;
  title: string;
  category: string;
  description: string | null;
  is_online: boolean;
  location: string | null;
  meeting_link: string | null;
  start_at: string;
  end_at: string | null;
  host: string | null;
  quota: number | null;
  registration_approval_mode: string;
  visibility: string;
  related_course_id: string | null;
  related_project_id: string | null;
};

/** Event milik sendiri untuk dikelola; milik orang lain atau tidak ada = "tidak ditemukan" (tidak dibedakan). */
export async function getMyEventForEdit(userId: string, id: string): Promise<EditableEventResult> {
  if (!isEventId(id)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, status, title, category, description, is_online, location, meeting_link, start_at, end_at, host, quota, registration_approval_mode, visibility, related_course_id, related_project_id")
    .eq("id", id)
    .eq("submitted_by", userId)
    .is("deleted_at", null)
    .maybeSingle<EventRow>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };
  return {
    state: "ok",
    event: {
      id: data.id,
      status: data.status,
      submittedByMe: true,
      startIso: data.start_at,
      approvalMode: data.registration_approval_mode,
      quota: data.quota,
      values: {
        title: data.title,
        category: data.category,
        description: data.description ?? "",
        isOnline: data.is_online,
        meetingLink: data.meeting_link ?? "",
        location: data.location ?? "",
        startAt: isoToWibLocal(data.start_at),
        endAt: isoToWibLocal(data.end_at),
        host: data.host ?? "",
        quota: data.quota != null ? String(data.quota) : "",
        approvalMode: data.registration_approval_mode,
        visibility: data.visibility,
        relatedCourseId: data.related_course_id ?? "",
        relatedProjectId: data.related_project_id ?? "",
      },
    },
  };
}
