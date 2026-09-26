// lib/admin/course-data.ts — Kelola Kursus (M04, wireframe 02-Admin/M04-{Kelola-Kursus,Detail-Kursus,Form-Kursus,Editor-Kuis,Sertifikat-Kursus}). Superadmin/Admin/Manager setara penuh
// (m04.course.manage/.publish/.course_enrollment.view semua granted_scope 'all' untuk ketiganya, migration 0056/0059/0130 — TIDAK ADA pengecualian Manager di modul ini, beda dari M13/M14/M15).
// Tidak ada endpoint REST untuk daftar peserta per kursus (GET /enrollments?course_id= tidak ada) — dibaca langsung lewat RLS enrollments_select (scope 'all' utk staf), sama seperti
// pola getActiveAgentsForPicker/getStaffDirectory di modul lain (baca langsung tabel di server, bukan lewat fetch ke /api/* sendiri). Label kategori/tipe pelajaran/template sertifikat di
// lib/admin/course-labels.ts (data murni tanpa import) — WAJIB dipakai komponen client langsung dari sana, bukan dari sini (file ini mengimpor createClient/next-headers, tidak aman dibundel client).
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Part } from "@/lib/agent/dashboard-data";
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, LESSON_TYPE_LABEL, CERT_TEMPLATE_LABEL, type CourseCategory, type CertTemplate } from "@/lib/admin/course-labels";
import type { BadgeTone } from "@/components/ui/Badge";
import { certAssetSignedUrl } from "@/lib/storage/certificate-assets";

export { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, LESSON_TYPE_LABEL, CERT_TEMPLATE_LABEL };
export type { CourseCategory, CertTemplate };

export type CourseStatus = "draft" | "pending_review" | "published" | "archived";
export const COURSE_STATUS_LABEL: Record<CourseStatus, string> = { draft: "Draf", pending_review: "Menunggu Tinjauan", published: "Terbit", archived: "Diarsipkan" };
export const COURSE_STATUS_TONE: Record<CourseStatus, BadgeTone> = { draft: "neutral", pending_review: "info", published: "success", archived: "warning" };

async function resolveOwnerLabels(supabase: Awaited<ReturnType<typeof createClient>>, createdByIds: string[]): Promise<Map<string, string>> {
  const uniq = Array.from(new Set(createdByIds));
  if (uniq.length === 0) return new Map();

  const { data: roles } = await supabase.from("roles").select("id, code").returns<{ id: string; code: string }[]>();
  const roleCodeById = new Map((roles ?? []).map((r) => [r.id, r.code]));

  const { data: users } = await supabase.from("users").select("id, role_id").in("id", uniq).returns<{ id: string; role_id: string }[]>();
  const instructorIds = (users ?? []).filter((u) => roleCodeById.get(u.role_id) === "instructor").map((u) => u.id);

  let emailById = new Map<string, string | null>();
  if (instructorIds.length > 0) {
    const admin = createAdminClient();
    const { data: authList } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    emailById = new Map((authList?.users ?? []).map((u) => [u.id, u.email ?? null]));
  }

  const label = new Map<string, string>();
  for (const u of users ?? []) {
    label.set(u.id, roleCodeById.get(u.role_id) === "instructor" ? (emailById.get(u.id) ?? "Instruktur") : "Tim RumahAgen");
  }
  return label;
}

export type CourseListRow = {
  id: string;
  title: string;
  category: string | null;
  status: CourseStatus;
  ownerLabel: string;
  passingGrade: number;
  lessonCount: number;
  quizCount: number;
  enrollmentCount: number;
  reviewNote: string | null;
  submittedForReviewAt: string | null;
};

export type CourseListFilters = { status?: CourseStatus; category?: CourseCategory; q?: string };

export async function getCourses(filters: CourseListFilters): Promise<Part<CourseListRow[]>> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("id, title, category, status, created_by, passing_grade, review_note, submitted_for_review_at, lessons:course_lessons(count), quizzes(count), enrollments(count)")
    .order("created_at", { ascending: false });
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.q) query = query.ilike("title", `%${filters.q}%`);

  const { data, error } = await query.returns<
    {
      id: string;
      title: string;
      category: string | null;
      status: CourseStatus;
      created_by: string;
      passing_grade: number;
      review_note: string | null;
      submitted_for_review_at: string | null;
      lessons: { count: number }[];
      quizzes: { count: number }[];
      enrollments: { count: number }[];
    }[]
  >();
  if (error) return { ok: false };

  const ownerLabelById = await resolveOwnerLabels(supabase, (data ?? []).map((c) => c.created_by));

  return {
    ok: true,
    data: (data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      status: c.status,
      ownerLabel: ownerLabelById.get(c.created_by) ?? "Tim RumahAgen",
      passingGrade: c.passing_grade,
      lessonCount: c.lessons?.[0]?.count ?? 0,
      quizCount: c.quizzes?.[0]?.count ?? 0,
      enrollmentCount: c.enrollments?.[0]?.count ?? 0,
      reviewNote: c.review_note,
      submittedForReviewAt: c.submitted_for_review_at,
    })),
  };
}

export type CourseDetail = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  status: CourseStatus;
  passingGrade: number;
  prerequisiteCourseId: string | null;
  createdBy: string;
  ownerLabel: string;
  reviewNote: string | null;
  submittedForReviewAt: string | null;
};

export async function getCourseDetail(id: string): Promise<Part<CourseDetail>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, category, description, status, passing_grade, prerequisite_course_id, created_by, review_note, submitted_for_review_at")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      title: string;
      category: string | null;
      description: string | null;
      status: CourseStatus;
      passing_grade: number;
      prerequisite_course_id: string | null;
      created_by: string;
      review_note: string | null;
      submitted_for_review_at: string | null;
    }>();
  if (error || !data) return { ok: false };

  const ownerLabelById = await resolveOwnerLabels(supabase, [data.created_by]);
  return {
    ok: true,
    data: {
      id: data.id,
      title: data.title,
      category: data.category,
      description: data.description,
      status: data.status,
      passingGrade: data.passing_grade,
      prerequisiteCourseId: data.prerequisite_course_id,
      createdBy: data.created_by,
      ownerLabel: ownerLabelById.get(data.created_by) ?? "Tim RumahAgen",
      reviewNote: data.review_note,
      submittedForReviewAt: data.submitted_for_review_at,
    },
  };
}

export type CourseLessonRow = { id: string; title: string | null; contentType: string | null; contentUrl: string | null; sortOrder: number };

export async function getCourseLessons(courseId: string): Promise<Part<CourseLessonRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("course_lessons")
    .select("id, title, content_type, content_url, sort_order")
    .eq("course_id", courseId)
    .order("sort_order", { ascending: true })
    .returns<{ id: string; title: string | null; content_type: string | null; content_url: string | null; sort_order: number }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((l) => ({ id: l.id, title: l.title, contentType: l.content_type, contentUrl: l.content_url, sortOrder: l.sort_order })) };
}

export type CourseQuizRow = { id: string; title: string | null; questionCount: number; ready: boolean; problems: string[]; hasAttempts: boolean };

export async function getCourseQuizzes(courseId: string): Promise<Part<CourseQuizRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("quizzes").select("id, title").eq("course_id", courseId).returns<{ id: string; title: string | null }[]>();
  if (error) return { ok: false };

  const rows = await Promise.all(
    (data ?? []).map(async (q) => {
      const [{ count }, { data: problems }, { data: hasAttempts }] = await Promise.all([
        supabase.from("quiz_questions").select("id", { count: "exact", head: true }).eq("quiz_id", q.id),
        supabase.rpc("quiz_problems", { p_quiz_id: q.id }),
        supabase.rpc("quiz_has_attempts", { p_quiz_id: q.id }),
      ]);
      const problemList = (problems as string[] | null) ?? [];
      return { id: q.id, title: q.title, questionCount: count ?? 0, ready: problemList.length === 0, problems: problemList, hasAttempts: hasAttempts === true };
    }),
  );
  return { ok: true, data: rows };
}

export type QuizOptionRow = { id: string; optionText: string; isCorrect: boolean };
export type QuizQuestionRow = { id: string; questionText: string; questionType: "single_choice" | "multi_choice"; options: QuizOptionRow[] };
export type QuizEditorData = {
  quizId: string;
  courseId: string;
  quizTitle: string | null;
  courseTitle: string;
  passingGrade: number;
  questions: QuizQuestionRow[];
  problems: string[];
  ready: boolean;
  hasAttempts: boolean;
};

export async function getQuizEditorData(quizId: string): Promise<Part<QuizEditorData>> {
  const supabase = await createClient();
  const { data: quiz, error: quizErr } = await supabase.from("quizzes").select("id, course_id, title").eq("id", quizId).maybeSingle<{ id: string; course_id: string; title: string | null }>();
  if (quizErr || !quiz) return { ok: false };

  const { data: course, error: courseErr } = await supabase.from("courses").select("title, passing_grade").eq("id", quiz.course_id).maybeSingle<{ title: string; passing_grade: number }>();
  if (courseErr || !course) return { ok: false };

  const { data: questions, error: qErr } = await supabase
    .from("quiz_questions")
    .select("id, question_text, question_type")
    .eq("quiz_id", quizId)
    .order("id")
    .returns<{ id: string; question_text: string; question_type: "single_choice" | "multi_choice" }[]>();
  if (qErr) return { ok: false };

  const ids = (questions ?? []).map((q) => q.id);
  const { data: options } = ids.length
    ? await supabase.from("quiz_options").select("id, question_id, option_text, is_correct").in("question_id", ids).order("id").returns<{ id: string; question_id: string; option_text: string; is_correct: boolean }[]>()
    : { data: [] as { id: string; question_id: string; option_text: string; is_correct: boolean }[] };

  const [{ data: problems }, { data: hasAttempts }] = await Promise.all([
    supabase.rpc("quiz_problems", { p_quiz_id: quizId }),
    supabase.rpc("quiz_has_attempts", { p_quiz_id: quizId }),
  ]);

  const optionsByQuestion = new Map<string, QuizOptionRow[]>();
  for (const o of options ?? []) {
    const list = optionsByQuestion.get(o.question_id) ?? [];
    list.push({ id: o.id, optionText: o.option_text, isCorrect: o.is_correct });
    optionsByQuestion.set(o.question_id, list);
  }

  const problemList = (problems as string[] | null) ?? [];
  return {
    ok: true,
    data: {
      quizId: quiz.id,
      courseId: quiz.course_id,
      quizTitle: quiz.title,
      courseTitle: course.title,
      passingGrade: course.passing_grade,
      questions: (questions ?? []).map((q) => ({ id: q.id, questionText: q.question_text, questionType: q.question_type, options: optionsByQuestion.get(q.id) ?? [] })),
      problems: problemList,
      ready: problemList.length === 0,
      hasAttempts: hasAttempts === true,
    },
  };
}

export type CourseEnrollmentRow = { id: string; agentName: string; status: "in_progress" | "completed"; progressPercent: number; enrolledAt: string; completedAt: string | null };

export async function getCourseEnrollments(courseId: string): Promise<Part<CourseEnrollmentRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id, agent_id, status, progress_percent, enrolled_at, completed_at")
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false })
    .returns<{ id: string; agent_id: string; status: "in_progress" | "completed"; progress_percent: number; enrolled_at: string; completed_at: string | null }[]>();
  if (error) return { ok: false };
  if (!data || data.length === 0) return { ok: true, data: [] };

  const agentIds = data.map((e) => e.agent_id);
  const { data: profiles } = await supabase.from("agent_profiles").select("user_id, full_name").in("user_id", agentIds).returns<{ user_id: string; full_name: string | null }[]>();
  const nameByAgent = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  return {
    ok: true,
    data: data.map((e) => ({
      id: e.id,
      agentName: nameByAgent.get(e.agent_id)?.trim() || e.agent_id.slice(0, 8),
      status: e.status,
      progressPercent: e.status === "completed" ? 100 : e.progress_percent,
      enrolledAt: e.enrolled_at,
      completedAt: e.completed_at,
    })),
  };
}

export type InstructorPickerRow = { id: string; label: string };

export async function getInstructorsForPicker(): Promise<Part<InstructorPickerRow[]>> {
  const supabase = await createClient();
  const { data: role, error: roleErr } = await supabase.from("roles").select("id").eq("code", "instructor").maybeSingle();
  if (roleErr || !role) return { ok: false };

  const { data: users, error: usersErr } = await supabase.from("users").select("id").eq("role_id", role.id).eq("status", "active").returns<{ id: string }[]>();
  if (usersErr) return { ok: false };
  if (!users || users.length === 0) return { ok: true, data: [] };

  const admin = createAdminClient();
  const { data: authList, error: authErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (authErr) return { ok: false };
  const emailById = new Map(authList.users.map((u) => [u.id, u.email ?? null]));

  return { ok: true, data: users.map((u) => ({ id: u.id, label: emailById.get(u.id) ?? u.id.slice(0, 8) })) };
}

export type CoursePrereqPickerRow = { id: string; title: string };

export async function getCoursesForPrereqPicker(excludeId?: string): Promise<Part<CoursePrereqPickerRow[]>> {
  const supabase = await createClient();
  const base = supabase.from("courses").select("id, title");
  const { data, error } = await (excludeId ? base.neq("id", excludeId) : base).order("title").returns<CoursePrereqPickerRow[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}

// ── Konfigurasi sertifikat per kursus (courses.organizer_type/certificate_template/signer_*/partner_logo_paths/quiz_*/awards_title_definition_id, migration 0150/0155) ──

export type OrganizerType = "rumahagen" | "partner" | "instructor";

export type CourseCertificateConfig = {
  organizerType: OrganizerType;
  certificateTemplate: CertTemplate | null;
  signerName: string | null;
  signerTitle: string | null;
  signerSignaturePath: string | null;
  signerSignatureUrl: string | null;
  partnerLogoPaths: string[];
  partnerLogoUrls: (string | null)[];
  quizMaxAttempts: number | null;
  quizCooldownMinutes: number | null;
  awardsTitleDefinitionId: string | null;
};

export type LearningSettingsDefaults = {
  externalQuizMaxAttempts: number | null;
  externalQuizCooldownMinutes: number;
  defaultCertificateTemplate: CertTemplate;
  defaultSignerName: string;
  defaultSignerTitle: string;
};

export async function getLearningSettingsDefaults(): Promise<Part<LearningSettingsDefaults>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("learning_settings")
    .select("external_quiz_max_attempts, external_quiz_cooldown_minutes, default_certificate_template, default_signer_name, default_signer_title")
    .eq("id", true)
    .maybeSingle<{
      external_quiz_max_attempts: number | null;
      external_quiz_cooldown_minutes: number;
      default_certificate_template: CertTemplate;
      default_signer_name: string;
      default_signer_title: string;
    }>();
  if (error || !data) return { ok: false };
  return {
    ok: true,
    data: {
      externalQuizMaxAttempts: data.external_quiz_max_attempts,
      externalQuizCooldownMinutes: data.external_quiz_cooldown_minutes,
      defaultCertificateTemplate: data.default_certificate_template,
      defaultSignerName: data.default_signer_name,
      defaultSignerTitle: data.default_signer_title,
    },
  };
}

export async function getCourseCertificateConfig(courseId: string): Promise<Part<CourseCertificateConfig>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("organizer_type, certificate_template, signer_name, signer_title, signer_signature_path, partner_logo_paths, quiz_max_attempts, quiz_cooldown_minutes, awards_title_definition_id")
    .eq("id", courseId)
    .maybeSingle<{
      organizer_type: OrganizerType;
      certificate_template: CertTemplate | null;
      signer_name: string | null;
      signer_title: string | null;
      signer_signature_path: string | null;
      partner_logo_paths: string[];
      quiz_max_attempts: number | null;
      quiz_cooldown_minutes: number | null;
      awards_title_definition_id: string | null;
    }>();
  if (error || !data) return { ok: false };

  const [signerSignatureUrl, partnerLogoUrls] = await Promise.all([
    certAssetSignedUrl(data.signer_signature_path),
    Promise.all(data.partner_logo_paths.map((p) => certAssetSignedUrl(p))),
  ]);

  return {
    ok: true,
    data: {
      organizerType: data.organizer_type,
      certificateTemplate: data.certificate_template,
      signerName: data.signer_name,
      signerTitle: data.signer_title,
      signerSignaturePath: data.signer_signature_path,
      signerSignatureUrl,
      partnerLogoPaths: data.partner_logo_paths,
      partnerLogoUrls,
      quizMaxAttempts: data.quiz_max_attempts,
      quizCooldownMinutes: data.quiz_cooldown_minutes,
      awardsTitleDefinitionId: data.awards_title_definition_id,
    },
  };
}

export type LinkableTitleRow = { id: string; name: string; description: string | null };

export async function getLinkableTitles(): Promise<Part<LinkableTitleRow[]>> {
  const supabase = await createClient();
  const { data: titles, error: titlesErr } = await supabase.from("title_definitions").select("id, name, description, status").eq("status", "active").returns<{ id: string; name: string; description: string | null; status: string }[]>();
  if (titlesErr) return { ok: false };
  if (!titles || titles.length === 0) return { ok: true, data: [] };

  const { data: scopes, error: scopesErr } = await supabase
    .from("title_authority_scopes")
    .select("title_definition_id")
    .in("title_definition_id", titles.map((t) => t.id))
    .eq("status", "active")
    .returns<{ title_definition_id: string }[]>();
  if (scopesErr) return { ok: false };
  const withScope = new Set((scopes ?? []).map((s) => s.title_definition_id));

  return { ok: true, data: titles.filter((t) => withScope.has(t.id)).map((t) => ({ id: t.id, name: t.name, description: t.description })) };
}
