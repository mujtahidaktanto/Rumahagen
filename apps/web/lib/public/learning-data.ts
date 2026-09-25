// lib/public/learning-data.ts — data Learning publik (M11 Detail-Learning dan Detail-Learning-Session), dibaca di server dengan RLS pemanggil.
// Kursus: pengunjung melihat status `published`; kurikulum hanya JUDUL dan jenis materi (content_url TIDAK dibaca di halaman publik). Sesi: RLS `learning_sessions_select` hanya
// mengizinkan sesi publik untuk pengguna yang LOGIN (auth.uid() tidak null), jadi pengunjung anonim tidak pernah menerima baris sesi -> halaman menampilkan "Masuk untuk cek akses".
// learning_sessions tidak punya kolom judul/deskripsi: judul memakai judul kursus terkait (bila ada), deskripsi memakai deskripsi kursus.
import { createClient } from "@/lib/supabase/server";

export const COURSE_CATEGORIES = ["sales_skill", "legal_regulasi", "produk_developer", "financial_kpr", "lainnya"] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];
export const COURSE_CATEGORY_LABEL: Record<string, string> = {
  sales_skill: "Sales Skill",
  legal_regulasi: "Legal & Regulasi",
  produk_developer: "Produk Developer",
  financial_kpr: "Financial & KPR",
  lainnya: "Lainnya",
};

export const LESSON_TYPE_LABEL: Record<string, string> = { video: "Video", pdf: "PDF", slide: "Slide" };

export const SESSION_TYPE_LABEL: Record<string, string> = { broadcast: "Broadcast", interactive: "Interaktif", on_demand: "On-Demand" };
export const SESSION_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  scheduled: "Terjadwal",
  live: "Sedang Berlangsung",
  ended: "Selesai",
  cancelled: "Dibatalkan",
  failed: "Gagal Dilaksanakan",
};
export const SESSION_VISIBILITY_LABEL: Record<string, string> = { public: "Publik", organization: "Organisasi", partner: "Mitra", private: "Privat" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);

// ── Kursus ─────────────────────────────────────────────────────────────────────

export type CourseSummary = { id: string; title: string; category: string; description: string | null; lessonCount: number };
export const COURSE_PAGE_SIZE = 12;
export const COURSE_MAX_SHOWN = 96;

export type CourseSearch = { kategori: CourseCategory | null; q: string; tampil: number };

export function parseCourseSearch(raw: Record<string, string | string[] | undefined>): CourseSearch {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const k = one(raw.kategori);
  const t = Number(one(raw.tampil));
  const tampil = Number.isFinite(t) && t >= COURSE_PAGE_SIZE && t <= COURSE_MAX_SHOWN ? Math.ceil(t / COURSE_PAGE_SIZE) * COURSE_PAGE_SIZE : COURSE_PAGE_SIZE;
  return { kategori: (COURSE_CATEGORIES as readonly string[]).includes(k ?? "") ? (k as CourseCategory) : null, q: (one(raw.q) ?? "").trim().slice(0, 100), tampil };
}

export function courseQuery(s: CourseSearch, patch: Partial<CourseSearch> = {}): string {
  const v = { ...s, ...patch };
  const p = new URLSearchParams();
  if (v.q) p.set("q", v.q);
  if (v.kategori) p.set("kategori", v.kategori);
  if (v.tampil !== COURSE_PAGE_SIZE) p.set("tampil", String(v.tampil));
  const qs = p.toString();
  return qs ? `?${qs}` : "";
}

export type CoursesResult = { ok: true; items: CourseSummary[]; total: number } | { ok: false; items: []; total: 0 };

export async function searchCourses(s: CourseSearch): Promise<CoursesResult> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("id, title, category, description, lessons:course_lessons(count)", { count: "exact" })
    .eq("status", "published")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: true })
    .range(0, s.tampil - 1);
  if (s.kategori) query = query.eq("category", s.kategori);
  const kw = s.q.replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim();
  if (kw) query = query.or(`title.ilike.%${kw}%,description.ilike.%${kw}%`);
  const { data, count, error } = await query.returns<{ id: string; title: string; category: string; description: string | null; lessons: { count: number }[] }[]>();
  if (error) return { ok: false, items: [], total: 0 };
  return { ok: true, items: (data ?? []).map((c) => ({ id: c.id, title: c.title, category: c.category, description: c.description, lessonCount: c.lessons?.[0]?.count ?? 0 })), total: count ?? 0 };
}

export type Lesson = { id: string; title: string; content_type: string };
export type SessionSummary = { id: string; session_type: string; status: string; start_at: string | null; end_at: string | null; visibility: string; courseTitle: string | null };
export type CourseDetail = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  status: string;
  passing_grade: number;
  prerequisite: { id: string; title: string } | null;
  lessons: Lesson[];
  sessions: SessionSummary[];
};
export type CourseDetailResult = { state: "ok"; course: CourseDetail } | { state: "not_found" } | { state: "error" };

export async function getCourseDetail(id: string): Promise<CourseDetailResult> {
  if (!isUuid(id)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, category, description, status, passing_grade, prerequisite_course_id")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<{ id: string; title: string; category: string; description: string | null; status: string; passing_grade: number; prerequisite_course_id: string | null }>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };

  // Bagian pelengkap: gagal memuat tidak menjatuhkan halaman (daftar kosong).
  const [lessonsRes, preqRes, sessionsRes] = await Promise.all([
    supabase.from("course_lessons").select("id, title, content_type").eq("course_id", id).order("sort_order", { ascending: true }),
    data.prerequisite_course_id ? supabase.from("courses").select("id, title").eq("id", data.prerequisite_course_id).eq("status", "published").maybeSingle<{ id: string; title: string }>() : Promise.resolve({ data: null, error: null }),
    supabase
      .from("learning_sessions")
      .select("id, session_type, status, start_at, end_at, visibility")
      .eq("course_id", id)
      .eq("visibility", "public")
      .in("status", ["scheduled", "live", "ended"])
      .is("deleted_at", null)
      .order("start_at", { ascending: false })
      .limit(6),
  ]);

  return {
    state: "ok",
    course: {
      id: data.id,
      title: data.title,
      category: data.category,
      description: data.description,
      status: data.status,
      passing_grade: data.passing_grade,
      prerequisite: preqRes.error ? null : preqRes.data,
      lessons: lessonsRes.error ? [] : (lessonsRes.data ?? []),
      sessions: sessionsRes.error ? [] : (sessionsRes.data ?? []).map((s) => ({ ...s, courseTitle: data.title })),
    },
  };
}

/** Apakah pengguna sudah terdaftar di kursus (RLS enrollments: hanya baris milik sendiri). */
export async function isEnrolledInCourse(courseId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("enrollments").select("id").eq("course_id", courseId).eq("agent_id", userId).limit(1);
  return (data?.length ?? 0) > 0;
}

// ── Sesi ───────────────────────────────────────────────────────────────────────

export type SessionsResult = { ok: true; items: SessionSummary[] } | { ok: false; items: [] };

export async function listPublicSessions(limit = 48): Promise<SessionsResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_sessions")
    .select("id, session_type, status, start_at, end_at, visibility, course:courses(title)")
    .eq("visibility", "public")
    .in("status", ["scheduled", "live", "ended"])
    .is("deleted_at", null)
    .order("start_at", { ascending: false })
    .limit(limit)
    .returns<(Omit<SessionSummary, "courseTitle"> & { course: { title: string } | null })[]>();
  if (error) return { ok: false, items: [] };
  return { ok: true, items: (data ?? []).map(({ course, ...s }) => ({ ...s, courseTitle: course?.title ?? null })) };
}

export type SessionDetail = SessionSummary & {
  course: { id: string; title: string; description: string | null } | null;
  organizationName: string | null;
};
export type SessionDetailResult = { state: "ok"; session: SessionDetail } | { state: "not_found" } | { state: "error" };

export async function getSessionDetail(id: string): Promise<SessionDetailResult> {
  if (!isUuid(id)) return { state: "not_found" };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_sessions")
    .select("id, session_type, status, start_at, end_at, visibility, course:courses(id, title, description), organization:organizations(organization_name)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle<Omit<SessionSummary, "courseTitle"> & { course: { id: string; title: string; description: string | null } | null; organization: { organization_name: string } | null }>();
  if (error) return { state: "error" };
  if (!data) return { state: "not_found" };
  const { course, organization, ...rest } = data;
  return { state: "ok", session: { ...rest, courseTitle: course?.title ?? null, course, organizationName: organization?.organization_name ?? null } };
}

export async function isEnrolledInSession(sessionId: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("session_enrollments").select("id").eq("session_id", sessionId).eq("agent_id", userId).limit(1);
  return (data?.length ?? 0) > 0;
}

/** Judul tampilan sesi: judul kursus terkait, atau "Sesi {tipe}" bila tidak ada kursus (learning_sessions tidak punya kolom judul). */
export function sessionTitle(s: Pick<SessionSummary, "courseTitle" | "session_type">): string {
  return s.courseTitle ?? `Sesi ${SESSION_TYPE_LABEL[s.session_type] ?? s.session_type}`;
}
