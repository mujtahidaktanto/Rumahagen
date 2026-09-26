// lib/agent/learning-data.ts — data layar Pembelajaran Agent (M04 Pembelajaran dan Belajar-Course), dibaca di server dengan RLS pemanggil (sama seperti /api/agents/me/*).
// Tiap bagian Pembelajaran (saldo LP, course, sertifikat, sesi) dimuat sendiri-sendiri: gagal di satu bagian menampilkan keadaan gagal bagian itu saja. Konten pelajaran memakai
// `content_url` (terbaca peserta; risiko terbacanya anonim sudah diterima pemilik produk). Kunci jawaban kuis TIDAK pernah dibaca di sini (soal dimuat browser lewat /api/quizzes/{id}/take).
import type { SupabaseClient } from "@supabase/supabase-js";
import { isUuid } from "@/lib/public/learning-data";
import { createClient } from "@/lib/supabase/server";
import type { Part } from "./dashboard-data";
import { safeHttps } from "./learning-rules";

export type MyCourse = { enrollmentId: string; courseId: string; title: string; category: string | null; status: string; progress: number; lessonCount: number; completedAt: string | null };
export type MyCertificate = {
  /** id sertifikat; null = kursus selesai tetapi sertifikat belum diterbitkan (terbit saat diunduh). */
  id: string | null;
  courseId: string;
  title: string;
  status: "issued" | "revoked" | "missing";
  number: string | null;
  verificationCode: string | null;
  passedAt: string | null;
  revokedAt: string | null;
};
export type MySession = { id: string; sessionId: string; title: string; status: string; startAt: string | null; endAt: string | null; completedAt: string | null };

export type MyLearning = {
  points: Part<number>;
  courses: Part<MyCourse[]>;
  certificates: Part<MyCertificate[]>;
  sessions: Part<MySession[]>;
};

const LIST_MAX = 100;

async function loadPoints(supabase: SupabaseClient, userId: string): Promise<Part<number>> {
  const { data, error } = await supabase.from("learning_point_accounts").select("balance_projection").eq("user_id", userId).maybeSingle<{ balance_projection: number | string | null }>();
  if (error) return { ok: false };
  return { ok: true, data: Number(data?.balance_projection ?? 0) };
}

type EnrollRow = { id: string; course_id: string; status: string; progress_percent: number; completed_at: string | null; course: { title: string; category: string | null; lessons: { count: number }[] } | null };

async function loadEnrollments(supabase: SupabaseClient, userId: string): Promise<{ rows: EnrollRow[] } | null> {
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, course_id, status, progress_percent, completed_at, course:courses(title, category, lessons:course_lessons(count))")
    .eq("agent_id", userId)
    .order("enrolled_at", { ascending: false })
    .limit(LIST_MAX)
    .returns<EnrollRow[]>();
  return error ? null : { rows: data ?? [] };
}

type CertRow = {
  id: string;
  course_id: string;
  certificate_number: string;
  verification_code: string;
  status: "issued" | "revoked";
  issued_at: string;
  revoked_at: string | null;
  course_title: string | null;
};

async function loadCertificates(supabase: SupabaseClient, userId: string, enroll: { rows: EnrollRow[] } | null): Promise<Part<MyCertificate[]>> {
  if (!enroll) return { ok: false };
  const { data, error } = await supabase
    .from("certificates")
    .select("id, course_id, certificate_number, verification_code, status, issued_at, revoked_at, course_title:snapshot->>course_title")
    .eq("agent_id", userId)
    .order("issued_at", { ascending: false })
    .limit(LIST_MAX)
    .returns<CertRow[]>();
  if (error) return { ok: false };
  const items: MyCertificate[] = (data ?? []).map((c) => ({
    id: c.id,
    courseId: c.course_id,
    title: c.course_title ?? enroll.rows.find((e) => e.course_id === c.course_id)?.course?.title ?? "Kursus",
    status: c.status,
    number: c.certificate_number,
    verificationCode: c.verification_code,
    passedAt: enroll.rows.find((e) => e.course_id === c.course_id)?.completed_at ?? c.issued_at,
    revokedAt: c.revoked_at,
  }));
  // Kursus selesai tanpa sertifikat (selesai sebelum fitur ini / penerbitan otomatis mati): terbit saat diunduh (GET /courses/{id}/certificate).
  for (const e of enroll.rows) {
    if (e.status === "completed" && !items.some((c) => c.courseId === e.course_id)) {
      items.push({ id: null, courseId: e.course_id, title: e.course?.title ?? "Kursus", status: "missing", number: null, verificationCode: null, passedAt: e.completed_at, revokedAt: null });
    }
  }
  return { ok: true, data: items };
}

async function loadSessions(supabase: SupabaseClient, userId: string): Promise<Part<MySession[]>> {
  const { data: enr, error } = await supabase
    .from("session_enrollments")
    .select("id, session_id, status, completed_at")
    .eq("agent_id", userId)
    .order("requested_at", { ascending: false })
    .limit(LIST_MAX)
    .returns<{ id: string; session_id: string; status: string; completed_at: string | null }[]>();
  if (error) return { ok: false };
  if (!enr?.length) return { ok: true, data: [] };
  const { data: sess, error: e2 } = await supabase
    .from("learning_sessions")
    .select("id, course_id, start_at, end_at")
    .in("id", enr.map((x) => x.session_id))
    .returns<{ id: string; course_id: string | null; start_at: string | null; end_at: string | null }[]>();
  if (e2) return { ok: false };
  const courseIds = [...new Set((sess ?? []).map((s) => s.course_id).filter((x): x is string => !!x))];
  const { data: crs } = courseIds.length ? await supabase.from("courses").select("id, title").in("id", courseIds).returns<{ id: string; title: string }[]>() : { data: [] as { id: string; title: string }[] };
  return {
    ok: true,
    data: enr.map((x) => {
      const s = sess?.find((y) => y.id === x.session_id);
      return { id: x.id, sessionId: x.session_id, title: (s?.course_id && crs?.find((c) => c.id === s.course_id)?.title) || "Sesi belajar", status: x.status, startAt: s?.start_at ?? null, endAt: s?.end_at ?? null, completedAt: x.completed_at };
    }),
  };
}

export async function getMyLearning(userId: string): Promise<MyLearning> {
  const supabase = await createClient();
  const enroll = await loadEnrollments(supabase, userId);
  const [points, certificates, sessions] = await Promise.all([loadPoints(supabase, userId), loadCertificates(supabase, userId, enroll), loadSessions(supabase, userId)]);
  return {
    points,
    certificates,
    sessions,
    courses: enroll
      ? {
          ok: true,
          data: enroll.rows.map((e) => ({
            enrollmentId: e.id,
            courseId: e.course_id,
            title: e.course?.title ?? "Kursus",
            category: e.course?.category ?? null,
            status: e.status,
            progress: e.status === "completed" ? 100 : e.progress_percent,
            lessonCount: e.course?.lessons?.[0]?.count ?? 0,
            completedAt: e.completed_at,
          })),
        }
      : { ok: false },
  };
}

// ── Belajar-Course ──

export type RunLesson = { id: string; title: string; type: string; url: string | null };
export type RunQuiz = { id: string; title: string | null; passed: boolean };
export type CourseRun = {
  enrollmentId: string;
  courseId: string;
  title: string;
  passingGrade: number;
  status: string;
  progress: number;
  lessons: RunLesson[];
  quizzes: RunQuiz[];
  /** Ada sertifikat yang masih berlaku untuk kursus ini (menentukan tombol unduh di layar selesai). */
  certificateIssued: boolean;
};
export type CourseRunResult = { state: "ok"; run: CourseRun } | { state: "not_enrolled"; courseId: string; title: string | null } | { state: "not_found" } | { state: "error" };

export async function getCourseRun(userId: string, courseId: string): Promise<CourseRunResult> {
  if (!isUuid(courseId)) return { state: "not_found" };
  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, title, passing_grade")
    .eq("id", courseId)
    .is("deleted_at", null)
    .maybeSingle<{ id: string; title: string; passing_grade: number }>();
  if (error) return { state: "error" };
  if (!course) return { state: "not_found" };

  const { data: enr, error: e2 } = await supabase
    .from("enrollments")
    .select("id, status, progress_percent")
    .eq("agent_id", userId)
    .eq("course_id", courseId)
    .maybeSingle<{ id: string; status: string; progress_percent: number }>();
  if (e2) return { state: "error" };
  if (!enr) return { state: "not_enrolled", courseId, title: course.title };

  const [lessons, quizzes, attempts, cert] = await Promise.all([
    supabase.from("course_lessons").select("id, title, content_type, content_url").eq("course_id", courseId).order("sort_order", { ascending: true }).returns<{ id: string; title: string | null; content_type: string | null; content_url: string | null }[]>(),
    supabase.from("quizzes").select("id, title").eq("course_id", courseId).order("id", { ascending: true }).returns<{ id: string; title: string | null }[]>(),
    supabase.from("quiz_attempts").select("quiz_id").eq("enrollment_id", enr.id).eq("passed", true).returns<{ quiz_id: string }[]>(),
    supabase.from("certificates").select("id").eq("agent_id", userId).eq("course_id", courseId).eq("status", "issued").limit(1),
  ]);
  if (lessons.error || quizzes.error || attempts.error) return { state: "error" };
  const passedIds = new Set((attempts.data ?? []).map((a) => a.quiz_id));
  return {
    state: "ok",
    run: {
      enrollmentId: enr.id,
      courseId,
      title: course.title,
      passingGrade: course.passing_grade,
      status: enr.status,
      progress: enr.status === "completed" ? 100 : enr.progress_percent,
      lessons: (lessons.data ?? []).map((l, i) => ({ id: l.id, title: l.title?.trim() || `Materi ${i + 1}`, type: l.content_type ?? "pdf", url: safeHttps(l.content_url) })),
      quizzes: (quizzes.data ?? []).map((q) => ({ id: q.id, title: q.title, passed: passedIds.has(q.id) })),
      certificateIssued: !cert.error && (cert.data?.length ?? 0) > 0,
    },
  };
}
