// lib/instructor/dashboard-data.ts — data Dashboard Instruktur (M08, wireframe 04-Instructor/M08-Dashboard-Instruktur). learning_sessions dibaca dengan RLS pemanggil:
// migration 0129 menambah akses pemilik DAN penugasan INSTRUCTOR/HOST aktif (is_session_team) — jadi query tanpa filter owner_id di sini sudah otomatis mencakup keduanya,
// tidak perlu menduplikasi logikanya di kode. course_id TIDAK punya FK fisik ke courses (STEP10-D, "FK DITUNDA") — judul kursus diambil lewat query terpisah, bukan embed PostgREST.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import { sessionTitle } from "@/lib/instructor/session-rules";

export type UpcomingSessionRow = { id: string; title: string; sessionType: string; status: string; startAt: string };
export type PendingAttendanceRow = { sessionId: string; title: string; endAt: string | null; ungradedCount: number };
export type InstructorDashboardStats = { upcomingCount: number; liveCount: number; pendingAttendanceCount: number; eventsUnpublishedCount: number };
export type DashboardNotification = { id: string; title: string; message: string | null; createdAt: string; isRead: boolean };

export type InstructorDashboardData = {
  stats: Part<InstructorDashboardStats>;
  upcoming: Part<UpcomingSessionRow[]>;
  pendingAttendance: Part<PendingAttendanceRow[]>;
  notifications: Part<{ unread: number; items: DashboardNotification[] }>;
};

type SessionRow = { id: string; course_id: string | null; session_type: string; status: string; start_at: string; end_at: string | null };

async function titlesByCourseId(supabase: Awaited<ReturnType<typeof createClient>>, courseIds: string[]): Promise<Map<string, string>> {
  if (courseIds.length === 0) return new Map();
  const { data } = await supabase.from("courses").select("id, title").in("id", courseIds).returns<{ id: string; title: string }[]>();
  return new Map((data ?? []).map((c) => [c.id, c.title]));
}

export async function getInstructorDashboard(userId: string): Promise<InstructorDashboardData> {
  const supabase = await createClient();

  const [sessionsRes, eventsRes, notifList, notifUnread] = await Promise.all([
    supabase
      .from("learning_sessions")
      .select("id, course_id, session_type, status, start_at, end_at")
      .in("status", ["scheduled", "live", "ended"])
      .is("deleted_at", null)
      .order("start_at", { ascending: false })
      .limit(100)
      .returns<SessionRow[]>(),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("submitted_by", userId).eq("status", "pending_approval"),
    supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .eq("user_id", userId)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<{ id: string; title: string; message: string | null; is_read: boolean; created_at: string }[]>(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("dismissed_at", null).eq("is_read", false),
  ]);

  const notifications: Part<{ unread: number; items: DashboardNotification[] }> =
    notifList.error || notifUnread.error
      ? { ok: false }
      : { ok: true, data: { unread: notifUnread.count ?? 0, items: (notifList.data ?? []).map((n) => ({ id: n.id, title: n.title, message: n.message, createdAt: n.created_at, isRead: n.is_read })) } };

  if (sessionsRes.error) {
    return { stats: { ok: false }, upcoming: { ok: false }, pendingAttendance: { ok: false }, notifications };
  }

  const sessions = sessionsRes.data ?? [];
  const upcomingSessions = sessions.filter((s) => s.status === "scheduled" || s.status === "live").sort((a, b) => a.start_at.localeCompare(b.start_at));
  const endedSessions = sessions.filter((s) => s.status === "ended");
  const titleMap = await titlesByCourseId(supabase, [...new Set(sessions.map((s) => s.course_id).filter((v): v is string => !!v))]);

  const upcoming: Part<UpcomingSessionRow[]> = {
    ok: true,
    data: upcomingSessions.slice(0, 5).map((s) => ({ id: s.id, title: sessionTitle({ courseTitle: titleMap.get(s.course_id ?? "") ?? null, session_type: s.session_type }), sessionType: s.session_type, status: s.status, startAt: s.start_at })),
  };

  // Kehadiran belum dinilai: peserta (enrollment active/completed) pada sesi selesai TANPA baris session_attendance_evaluations.
  const endedIds = endedSessions.map((s) => s.id);
  let pendingAttendance: Part<PendingAttendanceRow[]> = { ok: true, data: [] };
  let pendingAttendanceCount = 0;
  if (endedIds.length > 0) {
    const { data: enrollments, error: enrErr } = await supabase
      .from("session_enrollments")
      .select("id, session_id")
      .in("session_id", endedIds)
      .in("status", ["active", "completed"])
      .returns<{ id: string; session_id: string }[]>();
    if (enrErr) {
      pendingAttendance = { ok: false };
    } else {
      const enrollmentIds = (enrollments ?? []).map((e) => e.id);
      const { data: evals, error: evalErr } = enrollmentIds.length
        ? await supabase.from("session_attendance_evaluations").select("session_enrollment_id").in("session_enrollment_id", enrollmentIds).returns<{ session_enrollment_id: string }[]>()
        : { data: [] as { session_enrollment_id: string }[], error: null };
      if (evalErr) {
        pendingAttendance = { ok: false };
      } else {
        const evaluatedIds = new Set((evals ?? []).map((e) => e.session_enrollment_id));
        const ungradedBySession = new Map<string, number>();
        for (const e of enrollments ?? []) {
          if (!evaluatedIds.has(e.id)) ungradedBySession.set(e.session_id, (ungradedBySession.get(e.session_id) ?? 0) + 1);
        }
        pendingAttendanceCount = [...ungradedBySession.values()].reduce((a, b) => a + b, 0);
        pendingAttendance = {
          ok: true,
          data: endedSessions
            .filter((s) => ungradedBySession.has(s.id))
            .slice(0, 5)
            .map((s) => ({ sessionId: s.id, title: sessionTitle({ courseTitle: titleMap.get(s.course_id ?? "") ?? null, session_type: s.session_type }), endAt: s.end_at, ungradedCount: ungradedBySession.get(s.id) ?? 0 })),
        };
      }
    }
  }

  const stats: Part<InstructorDashboardStats> = {
    ok: true,
    data: {
      upcomingCount: upcomingSessions.length,
      liveCount: sessions.filter((s) => s.status === "live").length,
      pendingAttendanceCount,
      eventsUnpublishedCount: eventsRes.count ?? 0,
    },
  };

  return { stats, upcoming, pendingAttendance, notifications };
}
