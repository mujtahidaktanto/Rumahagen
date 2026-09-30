// lib/instructor/session-data.ts — data Sesi Saya (M04, wireframe 04-Instructor/M04-{Sesi-Saya,Form-Sesi,Detail-Sesi}). learning_sessions dibaca dengan RLS pemanggil:
// migration 0129 memberi akses pemilik ATAU penugasan INSTRUCTOR/HOST aktif (is_session_team) untuk sesi, peserta, evaluasi kehadiran/penyelesaian, dan artefak — query
// di sini TIDAK memfilter owner_id secara eksplisit, RLS yang menentukan baris mana yang terbaca. course_id TIDAK punya FK fisik ke courses (FK DITUNDA, STEP10-D) — judul
// kursus dan opsi kursus diambil lewat query terpisah, bukan embed PostgREST.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import { sessionTitle } from "@/lib/instructor/session-rules";

type Supa = Awaited<ReturnType<typeof createClient>>;

async function titlesByCourseId(supabase: Supa, courseIds: string[]): Promise<Map<string, string>> {
  if (courseIds.length === 0) return new Map();
  const { data } = await supabase.from("courses").select("id, title").in("id", courseIds).returns<{ id: string; title: string }[]>();
  return new Map((data ?? []).map((c) => [c.id, c.title]));
}

async function namesByUserId(supabase: Supa, userIds: string[]): Promise<Map<string, string>> {
  if (userIds.length === 0) return new Map();
  const { data } = await supabase.from("public_agent_profiles").select("user_id, full_name").in("user_id", userIds).returns<{ user_id: string; full_name: string }[]>();
  return new Map((data ?? []).map((p) => [p.user_id, p.full_name]));
}

// ── Sesi Saya (daftar) ──
export type MySessionRow = { id: string; title: string; sessionType: string; status: string; startAt: string; endAt: string | null };

export async function getMySessions(): Promise<Part<MySessionRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_sessions")
    .select("id, course_id, session_type, status, start_at, end_at")
    .is("deleted_at", null)
    .order("start_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; course_id: string | null; session_type: string; status: string; start_at: string; end_at: string | null }[]>();
  if (error) return { ok: false };
  const titleMap = await titlesByCourseId(supabase, [...new Set((data ?? []).map((s) => s.course_id).filter((v): v is string => !!v))]);
  return {
    ok: true,
    data: (data ?? []).map((s) => ({ id: s.id, title: sessionTitle({ courseTitle: titleMap.get(s.course_id ?? "") ?? null, session_type: s.session_type }), sessionType: s.session_type, status: s.status, startAt: s.start_at, endAt: s.end_at })),
  };
}

// ── Pilihan kursus untuk Form Sesi (hanya kursus tayang, sama seperti getEventFormOptions Agent) ──
export type CourseOption = { id: string; title: string };
export async function getCourseOptions(): Promise<Part<CourseOption[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("courses").select("id, title").eq("status", "published").is("deleted_at", null).order("title").limit(200).returns<CourseOption[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}

// ── Detail Sesi ──
export type RosterRow = { enrollmentId: string; agentId: string; agentName: string; enrollmentStatus: string; attendanceEvaluationId: string | null; attendanceResult: string | null; completionResult: string | null };
export type TeamRow = { id: string; actorId: string; actorName: string; capability: string; status: string };
export type ArtifactRow = { id: string; artifactType: string; providerKey: string | null; sourceUrl: string | null; status: string };

export type SessionDetail = {
  id: string;
  courseId: string | null;
  courseTitle: string | null;
  sessionType: string;
  status: string;
  startAt: string;
  endAt: string | null;
  visibility: string;
  ownerId: string;
};

async function getSessionRow(id: string): Promise<Part<SessionDetail | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_sessions")
    .select("id, owner_id, course_id, session_type, status, start_at, end_at, visibility")
    .eq("id", id)
    .maybeSingle<{ id: string; owner_id: string; course_id: string | null; session_type: string; status: string; start_at: string; end_at: string | null; visibility: string }>();
  if (error) return { ok: false };
  if (!data) return { ok: true, data: null };
  const titleMap = await titlesByCourseId(supabase, data.course_id ? [data.course_id] : []);
  return {
    ok: true,
    data: {
      id: data.id,
      ownerId: data.owner_id,
      courseId: data.course_id,
      courseTitle: data.course_id ? (titleMap.get(data.course_id) ?? null) : null,
      sessionType: data.session_type,
      status: data.status,
      startAt: data.start_at,
      endAt: data.end_at,
      visibility: data.visibility,
    },
  };
}

async function getRoster(sessionId: string): Promise<Part<RosterRow[]>> {
  const supabase = await createClient();
  const { data: enrollments, error } = await supabase
    .from("session_enrollments")
    .select("id, agent_id, status")
    .eq("session_id", sessionId)
    .order("requested_at", { ascending: false })
    .returns<{ id: string; agent_id: string; status: string }[]>();
  if (error) return { ok: false };
  const enrollmentIds = (enrollments ?? []).map((e) => e.id);
  const [attendanceRes, completionRes, names] = await Promise.all([
    enrollmentIds.length
      ? supabase.from("session_attendance_evaluations").select("id, session_enrollment_id, result").in("session_enrollment_id", enrollmentIds).returns<{ id: string; session_enrollment_id: string; result: string }[]>()
      : Promise.resolve({ data: [] as { id: string; session_enrollment_id: string; result: string }[], error: null }),
    enrollmentIds.length
      ? supabase.from("session_completion_outcomes").select("session_enrollment_id, result").in("session_enrollment_id", enrollmentIds).returns<{ session_enrollment_id: string; result: string }[]>()
      : Promise.resolve({ data: [] as { session_enrollment_id: string; result: string }[], error: null }),
    namesByUserId(supabase, [...new Set((enrollments ?? []).map((e) => e.agent_id))]),
  ]);
  if (attendanceRes.error || completionRes.error) return { ok: false };
  const attendanceMap = new Map((attendanceRes.data ?? []).map((a) => [a.session_enrollment_id, a]));
  const completionMap = new Map((completionRes.data ?? []).map((c) => [c.session_enrollment_id, c.result]));
  return {
    ok: true,
    data: (enrollments ?? []).map((e) => ({
      enrollmentId: e.id,
      agentId: e.agent_id,
      agentName: names.get(e.agent_id) ?? "Agent",
      enrollmentStatus: e.status,
      attendanceEvaluationId: attendanceMap.get(e.id)?.id ?? null,
      attendanceResult: attendanceMap.get(e.id)?.result ?? null,
      completionResult: completionMap.get(e.id) ?? null,
    })),
  };
}

async function getTeam(sessionId: string): Promise<Part<TeamRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_session_assignments")
    .select("id, actor_id, capability, status")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .returns<{ id: string; actor_id: string; capability: string; status: string }[]>();
  if (error) return { ok: false };
  const names = await namesByUserId(supabase, [...new Set((data ?? []).map((a) => a.actor_id))]);
  return { ok: true, data: (data ?? []).map((a) => ({ id: a.id, actorId: a.actor_id, actorName: names.get(a.actor_id) ?? "Pengguna", capability: a.capability, status: a.status })) };
}

async function getArtifacts(sessionId: string): Promise<Part<ArtifactRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("session_artifacts")
    .select("id, artifact_type, provider_key, source_url, status")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .returns<{ id: string; artifact_type: string; provider_key: string | null; source_url: string | null; status: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((a) => ({ id: a.id, artifactType: a.artifact_type, providerKey: a.provider_key, sourceUrl: a.source_url, status: a.status })) };
}

export type SessionDetailBundle = { session: Part<SessionDetail | null>; roster: Part<RosterRow[]>; team: Part<TeamRow[]>; artifacts: Part<ArtifactRow[]> };

export async function getSessionDetailBundle(id: string): Promise<SessionDetailBundle> {
  const session = await getSessionRow(id);
  if (!session.ok || !session.data) {
    return { session, roster: { ok: false }, team: { ok: false }, artifacts: { ok: false } };
  }
  const [roster, team, artifacts] = await Promise.all([getRoster(id), getTeam(id), getArtifacts(id)]);
  return { session, roster, team, artifacts };
}
