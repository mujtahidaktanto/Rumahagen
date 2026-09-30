// lib/instructor/course-data.ts — Kursus Saya (M04, wireframe 04-Instructor/M04-{Kursus-Saya,Detail-Kursus,Editor-Kuis}). Semua query difilter `created_by = userId` secara eksplisit
// (bukan hanya mengandalkan RLS courses_select, yang JUGA meloloskan kursus published milik orang lain — layar ini murni "milik saya"). Tidak ada resolusi label pemilik (selalu diri
// sendiri) dan tidak ada tab Peserta (SOURCE-Instructor-Kursus.md §"Masih terbuka": daftar peserta kursus untuk Instruktur belum ada, dicatat apa adanya, bukan dibangun di sini).
// RLS course_lessons_select/quizzes_select/quiz_questions_select/quiz_options_select semuanya mengizinkan pemilik (`c.created_by = auth.uid()` lewat has_permission('m04.course.manage')
// scope own, migration 0056/0060) membaca isi kursus draf sekalipun, jadi query langsung ke tabel (pola sama seperti lib/admin/course-data.ts) aman tanpa perlu lapisan REST tambahan.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import type { CourseCategory, CourseStatus } from "@/lib/admin/course-labels";

export type CourseListRow = {
  id: string;
  title: string;
  category: string | null;
  status: CourseStatus;
  passingGrade: number;
  lessonCount: number;
  quizCount: number;
  reviewNote: string | null;
  submittedForReviewAt: string | null;
};

export type CourseListFilters = { status?: CourseStatus; category?: CourseCategory; q?: string };

export async function getMyCourses(userId: string, filters: CourseListFilters): Promise<Part<CourseListRow[]>> {
  const supabase = await createClient();
  let query = supabase
    .from("courses")
    .select("id, title, category, status, passing_grade, review_note, submitted_for_review_at, lessons:course_lessons(count), quizzes(count)")
    .eq("created_by", userId)
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
      passing_grade: number;
      review_note: string | null;
      submitted_for_review_at: string | null;
      lessons: { count: number }[];
      quizzes: { count: number }[];
    }[]
  >();
  if (error) return { ok: false };

  return {
    ok: true,
    data: (data ?? []).map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      status: c.status,
      passingGrade: c.passing_grade,
      lessonCount: c.lessons?.[0]?.count ?? 0,
      quizCount: c.quizzes?.[0]?.count ?? 0,
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
  reviewNote: string | null;
  submittedForReviewAt: string | null;
  coverImageUrl: string | null;
};

/** Kembali null bila tidak ditemukan ATAU bukan milik userId (halaman memanggil notFound() pada dua-duanya, sama seperti dicek lewat RLS). */
export async function getCourseDetail(id: string, userId: string): Promise<Part<CourseDetail | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, category, description, status, passing_grade, prerequisite_course_id, created_by, review_note, submitted_for_review_at, cover_image_url")
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
      cover_image_url: string | null;
    }>();
  if (error) return { ok: false };
  if (!data || data.created_by !== userId) return { ok: true, data: null };

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
      reviewNote: data.review_note,
      submittedForReviewAt: data.submitted_for_review_at,
      coverImageUrl: data.cover_image_url,
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

export type CoursePrereqPickerRow = { id: string; title: string };

export async function getCoursesForPrereqPicker(excludeId?: string): Promise<Part<CoursePrereqPickerRow[]>> {
  const supabase = await createClient();
  const base = supabase.from("courses").select("id, title");
  const { data, error } = await (excludeId ? base.neq("id", excludeId) : base).order("title").returns<CoursePrereqPickerRow[]>();
  if (error) return { ok: false };
  return { ok: true, data: data ?? [] };
}
