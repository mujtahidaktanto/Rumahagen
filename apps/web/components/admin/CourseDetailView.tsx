// components/admin/CourseDetailView.tsx — Detail Kursus (M04, wireframe M04-Detail-Kursus): 4 tab (Ringkasan/Pelajaran/Kuis/Peserta) lewat query string. "Kesiapan untuk terbit" dihitung
// ulang di sini SESUAI BACKEND (minimal 1 pelajaran DAN minimal 1 kuis yang semuanya siap) — wireframe sendiri menganggap 0 kuis = siap (quizzes.every di array kosong = true), tapi trigger
// enforce_course_quizzes_ready_on_publish (0150) mewajibkan >=1 kuis untuk pending_review maupun published. Dikoreksi di sini, dicatat di audit/FRONTEND_GAPS.md.
import Link from "next/link";
import type { Route } from "next";
import { CourseFormDialog } from "@/components/admin/CourseFormDialog";
import { CourseStatusActions } from "@/components/admin/CourseStatusActions";
import { LessonFormDialog } from "@/components/admin/LessonFormDialog";
import { LessonRowActions } from "@/components/admin/LessonRowActions";
import { QuizCreateDialog } from "@/components/admin/QuizCreateDialog";
import { QuizRowActions } from "@/components/admin/QuizRowActions";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import {
  COURSE_CATEGORY_LABEL,
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  LESSON_TYPE_LABEL,
  type CourseDetail,
  type CourseEnrollmentRow,
  type CourseLessonRow,
  type CourseQuizRow,
  type CoursePrereqPickerRow,
  type InstructorPickerRow,
} from "@/lib/admin/course-data";
import type { Part } from "@/lib/agent/dashboard-data";

type Tab = "ringkasan" | "pelajaran" | "kuis" | "peserta";

function tabHref(courseId: string, tab: Tab): Route {
  return `/admin/kursus/${courseId}?tab=${tab}` as Route;
}

export function CourseDetailView({
  course,
  tab,
  lessons,
  quizzes,
  enrollments,
  instructors,
  prereqOptions,
}: {
  course: CourseDetail;
  tab: Tab;
  lessons: Part<CourseLessonRow[]>;
  quizzes: Part<CourseQuizRow[]>;
  enrollments: Part<CourseEnrollmentRow[]> | null;
  instructors: InstructorPickerRow[];
  prereqOptions: CoursePrereqPickerRow[];
}) {
  const lessonList = lessons.ok ? lessons.data : [];
  const quizList = quizzes.ok ? quizzes.data : [];
  const lessonsOk = lessonList.length >= 1;
  const quizzesOk = quizList.length >= 1 && quizList.every((q) => q.ready);
  const ready = lessonsOk && quizzesOk;
  const badQuiz = quizList.find((q) => !q.ready);
  const blockReason = !lessonsOk ? "Tambahkan minimal 1 pelajaran dulu." : quizList.length === 0 ? "Tambahkan minimal 1 kuis yang siap dulu." : badQuiz ? `Perbaiki kuis "${badQuiz.title ?? ""}": ${badQuiz.problems[0] ?? ""}.` : "";
  const showBlock = !ready && (course.status === "draft" || course.status === "pending_review");

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Detail Kursus</h1>
        <LinkButton href={"/admin/kursus" as Route} variant="secondary">
          Semua Kursus
        </LinkButton>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {course.reviewNote && course.status === "draft" ? (
          <div className="rounded-md border border-danger-200 bg-danger-100 p-3.5 text-body-md text-danger-600">
            <span className="text-label-lg">Dikembalikan tim RumahAgen</span>
            <p className="mt-0.5">{course.reviewNote}</p>
          </div>
        ) : null}
        {course.status === "pending_review" ? (
          <div className="rounded-md border border-warning-200 bg-warning-100 p-3.5 text-body-md text-warning-600">
            <strong>Menunggu tinjauan Anda.</strong> Setujui untuk menerbitkan, atau tolak dengan catatan agar dikembalikan ke draf.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-headline">{course.title}</div>
              <div className="mt-1 text-caption">
                {course.category ? COURSE_CATEGORY_LABEL[course.category] : "—"} · {course.ownerLabel} · Nilai lulus {course.passingGrade}
              </div>
            </div>
            <Badge tone={COURSE_STATUS_TONE[course.status]}>{COURSE_STATUS_LABEL[course.status]}</Badge>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <CourseFormDialog course={course} instructors={instructors} prereqOptions={prereqOptions} trigger={(open) => <Button variant="secondary" size="sm" onClick={open}>Ubah</Button>} />
            <CourseStatusActions courseId={course.id} status={course.status} ready={ready} />
          </div>
          {showBlock ? <span className="text-caption text-danger-600">{blockReason}</span> : null}
        </div>

        <div className="flex gap-6 border-b border-ink-100">
          {(["ringkasan", "pelajaran", "kuis", "peserta"] as Tab[]).map((t) => (
            <Link key={t} href={tabHref(course.id, t)} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
              {t === "ringkasan" ? "Ringkasan" : t === "pelajaran" ? "Pelajaran" : t === "kuis" ? "Kuis" : "Peserta"}
            </Link>
          ))}
        </div>

        {tab === "ringkasan" ? (
          <div className="flex flex-col gap-4">
            {course.status === "draft" || course.status === "pending_review" ? (
              <div className="flex flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5">
                <span className="text-title-md">Kesiapan untuk terbit</span>
                <div className="flex items-center gap-2.5">
                  <Badge tone={lessonsOk ? "success" : "danger"}>{lessonsOk ? "Siap" : "Belum"}</Badge>
                  <span className="text-body-md">Minimal 1 pelajaran ({lessonList.length} sekarang)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge tone={quizzesOk ? "success" : "danger"}>{quizzesOk ? "Siap" : "Belum"}</Badge>
                  <span className="text-body-md">Minimal 1 kuis, semua siap dinilai (soal, jawaban benar)</span>
                </div>
              </div>
            ) : null}
            <dl className="grid grid-cols-[170px_1fr] gap-x-4 gap-y-2.5 rounded-md border border-ink-100 bg-white p-5">
              <dt className="text-caption text-ink-500">Deskripsi</dt>
              <dd className="text-body-md">{course.description || "—"}</dd>
              <dt className="text-caption text-ink-500">Pelajaran</dt>
              <dd className="text-body-md">{lessonList.length}</dd>
              <dt className="text-caption text-ink-500">Kuis</dt>
              <dd className="text-body-md">{quizList.length}</dd>
              <dt className="text-caption text-ink-500">Sertifikat</dt>
              <dd className="text-body-md">
                <Link href={`/admin/kursus/${course.id}/sertifikat` as Route} className="text-blue-600 hover:underline">
                  Atur penyelenggara, template, penandatangan, dan logo mitra
                </Link>
              </dd>
              <dt className="text-caption text-ink-500">Katalog</dt>
              <dd className="text-body-md">Tampil publik hanya bila berstatus Terbit</dd>
            </dl>
          </div>
        ) : tab === "pelajaran" ? (
          <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <span className="text-title-md">Pelajaran</span>
              <LessonFormDialog courseId={course.id} nextSortOrder={lessonList.length} trigger={(open) => <Button size="sm" onClick={open}>+ Tambah</Button>} />
            </div>
            {!lessons.ok ? (
              <ErrorState title="Pelajaran gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            ) : lessonList.length === 0 ? (
              <p className="py-16 text-center text-body-md text-ink-500">Belum ada pelajaran. Kursus butuh minimal 1 pelajaran untuk diajukan.</p>
            ) : (
              lessonList.map((l, i) => (
                <div key={l.id} className="flex items-center gap-3 border-t border-ink-50 px-4 py-3 first:border-t-0">
                  <span className="w-5 text-caption">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-label-lg">{l.title || "—"}</div>
                    <div className="truncate text-caption">
                      {l.contentType ? LESSON_TYPE_LABEL[l.contentType] : "—"} · {l.contentUrl || "—"}
                    </div>
                  </div>
                  <LessonRowActions courseId={course.id} lesson={l} prev={lessonList[i - 1] ?? null} next={lessonList[i + 1] ?? null} />
                </div>
              ))
            )}
          </div>
        ) : tab === "kuis" ? (
          <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <span className="text-title-md">Kuis</span>
              <QuizCreateDialog courseId={course.id} trigger={(open) => <Button size="sm" onClick={open}>+ Buat Kuis</Button>} />
            </div>
            {!quizzes.ok ? (
              <ErrorState title="Kuis gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
            ) : quizList.length === 0 ? (
              <p className="py-16 text-center text-body-md text-ink-500">Belum ada kuis.</p>
            ) : (
              <>
                {quizList.map((q) => (
                  <div key={q.id} className="flex items-center gap-3 border-t border-ink-50 px-4 py-3 first:border-t-0">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-label-lg">{q.title || "—"}</div>
                      <div className="text-caption">
                        {q.questionCount} soal{q.hasAttempts ? " · sudah dikerjakan peserta" : ""}
                      </div>
                      {!q.ready ? <div className="text-caption text-danger-600">{q.problems[0]}</div> : null}
                    </div>
                    <Badge tone={q.ready ? "success" : "danger"}>{q.ready ? "Siap" : "Belum siap"}</Badge>
                    <QuizRowActions courseId={course.id} quiz={q} />
                  </div>
                ))}
                <div className="border-t border-ink-100 p-3">
                  <span className="text-caption">Kuis yang sudah dikerjakan peserta tidak bisa dihapus dan struktur/kunci jawabannya terkunci. Nilai lulus diatur di kursus.</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="rounded-md border border-info-200 bg-info-100 p-3.5 text-body-md text-info-600">
              Status Selesai diberikan otomatis saat peserta lulus semua kuis kursus, atau oleh staf. Layar ini hanya membaca.
            </div>
            <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
              <div className="border-b border-ink-100 p-4">
                <span className="text-title-md">Peserta kursus</span>
              </div>
              {!enrollments?.ok ? (
                <ErrorState title="Peserta gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
              ) : enrollments.data.length === 0 ? (
                <p className="py-16 text-center text-body-md text-ink-500">Belum ada peserta.</p>
              ) : (
                <Table>
                  <THead>
                    <TR>
                      <TH>Agent</TH>
                      <TH>Progres</TH>
                      <TH>Status</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {enrollments.data.map((p) => (
                      <TR key={p.id}>
                        <TD className="text-label-lg">{p.agentName}</TD>
                        <TD className="text-body-md">{p.progressPercent}%</TD>
                        <TD>
                          <Badge tone={p.status === "completed" ? "success" : "info"}>{p.status === "completed" ? "Selesai" : "Berjalan"}</Badge>
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
