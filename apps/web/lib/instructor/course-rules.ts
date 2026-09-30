// lib/instructor/course-rules.ts — aturan murni Kursus Saya (M04, wireframe 04-Instructor/M04-{Kursus-Saya,Form-Kursus,Detail-Kursus,Editor-Kuis}). Label DIPAKAI ULANG dari
// lib/admin/course-labels.ts (data murni tanpa import apa pun, sudah dipakai sisi Admin, aman dibundel client). Kesiapan terbit dan aksi status DIHITUNG SESUAI BACKEND, bukan
// wireframe: trigger enforce_course_quizzes_ready_on_publish (0150) mewajibkan minimal 1 pelajaran DAN minimal 1 kuis yang semuanya siap (0 kuis BUKAN "siap", beda dari asumsi
// wireframe lama — sama seperti koreksi yang sudah dipakai CourseDetailView Admin). Transisi status non-staf dibatasi trigger enforce_course_status_workflow (0136): draft->
// pending_review (pemilik, syarat siap terbit)/archived; pending_review->draft (tarik kembali, pemilik); published->archived; archived->draft. Instruktur TIDAK punya
// m04.course.publish, jadi tidak ada aksi setujui/tolak/terbitkan di sini (staf saja, lewat POST /courses/{id}/review dan PATCH .../status ke published).
import { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, LESSON_TYPE_LABEL, COURSE_STATUS_LABEL, COURSE_STATUS_TONE, type CourseCategory, type CourseStatus } from "@/lib/admin/course-labels";

export { COURSE_CATEGORIES, COURSE_CATEGORY_LABEL, LESSON_TYPE_LABEL, COURSE_STATUS_LABEL, COURSE_STATUS_TONE };
export type { CourseCategory, CourseStatus };

export type QuizReadiness = { title: string | null; ready: boolean; problems: string[] };

export function isCourseReady(lessonCount: number, quizzes: QuizReadiness[]): boolean {
  return lessonCount >= 1 && quizzes.length >= 1 && quizzes.every((q) => q.ready);
}

export function courseReadinessBlockReason(lessonCount: number, quizzes: QuizReadiness[]): string {
  if (lessonCount < 1) return "Tambahkan minimal 1 pelajaran dulu.";
  if (quizzes.length === 0) return "Tambahkan minimal 1 kuis yang siap dulu.";
  const bad = quizzes.find((q) => !q.ready);
  if (bad) return `Perbaiki kuis "${bad.title ?? ""}": ${bad.problems[0] ?? ""}.`;
  return "";
}

export type CourseStatusActionKind = "submit-review" | "withdraw" | "archive" | "draft";
export type CourseStatusAction = { kind: CourseStatusActionKind; label: string; primary: boolean; needsReady: boolean };

export const COURSE_STATUS_ACTIONS: Record<CourseStatus, CourseStatusAction[]> = {
  draft: [
    { kind: "submit-review", label: "Ajukan Terbit", primary: true, needsReady: true },
    { kind: "archive", label: "Arsipkan", primary: false, needsReady: false },
  ],
  pending_review: [{ kind: "withdraw", label: "Tarik Kembali", primary: true, needsReady: false }],
  published: [{ kind: "archive", label: "Arsipkan", primary: false, needsReady: false }],
  archived: [{ kind: "draft", label: "Kembalikan ke Draf", primary: true, needsReady: false }],
};

// ── Form Kursus ──
export type CourseForm = { title: string; category: CourseCategory; description: string; passingGrade: string; prerequisiteCourseId: string };
export const EMPTY_COURSE: CourseForm = { title: "", category: "sales_skill", description: "", passingGrade: "70", prerequisiteCourseId: "none" };

export function validateCourseForm(f: CourseForm): boolean {
  const grade = Number(f.passingGrade);
  return f.title.trim().length > 0 && Number.isInteger(grade) && grade >= 0 && grade <= 100;
}

export function toCoursePayload(f: CourseForm): Record<string, unknown> {
  return {
    title: f.title.trim(),
    category: f.category,
    description: f.description.trim() || undefined,
    passing_grade: Number(f.passingGrade),
    prerequisite_course_id: f.prerequisiteCourseId === "none" ? undefined : f.prerequisiteCourseId,
  };
}
