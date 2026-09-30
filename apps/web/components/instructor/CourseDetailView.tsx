"use client";

// components/instructor/CourseDetailView.tsx — Detail Kursus (M04, wireframe 04-Instructor/M04-Detail-Kursus): 3 tab (Ringkasan/Pelajaran/Kuis) lewat query string — TIDAK ada tab
// Peserta (SOURCE-Instructor-Kursus.md §"Masih terbuka": daftar peserta kursus untuk Instruktur belum ada, dicatat di audit/FRONTEND_GAPS.md, bukan diimprovisasi di sini). "Kesiapan
// untuk terbit" dan aksi status memakai lib/instructor/course-rules.ts (dihitung sesuai backend: minimal 1 pelajaran DAN minimal 1 kuis yang semuanya siap; transisi status non-staf
// terbatas — tidak ada setujui/tolak/terbitkan, itu staf saja). Semua dialog merender tombol pemicunya sendiri (bukan menerima trigger lewat prop) — komponen ini "use client" murni
// jadi aman, tapi pola ini dipertahankan konsisten dengan layar Instructor lainnya sesi ini.
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button, IconButton, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import type { CourseDetail, CourseLessonRow, CourseQuizRow, CoursePrereqPickerRow } from "@/lib/instructor/course-data";
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABEL,
  COURSE_STATUS_LABEL,
  COURSE_STATUS_TONE,
  COURSE_STATUS_ACTIONS,
  LESSON_TYPE_LABEL,
  isCourseReady,
  courseReadinessBlockReason,
  toCoursePayload,
  type CourseCategory,
  type CourseForm,
  type CourseStatusActionKind,
} from "@/lib/instructor/course-rules";
import type { Part } from "@/lib/agent/dashboard-data";
import { ApiClientError, api } from "@/lib/api-client";
import { MAX_COURSE_MATERIAL_BYTES } from "@/lib/validation/courses";

type Tab = "ringkasan" | "pelajaran" | "kuis";

function tabHref(courseId: string, tab: Tab): Route {
  return `/instructor/kursus/${courseId}?tab=${tab}` as Route;
}

/** Nama berkas dari URL tersimpan (path bucket atau tautan luar), untuk pratinjau "Berkas saat ini" (pola sama seperti components/admin/LessonFormDialog.tsx). */
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").pop() ?? url;
    return decodeURIComponent(last.replace(/^[0-9a-f-]{36}-/i, ""));
  } catch {
    return url;
  }
}

function formFrom(c: CourseDetail): CourseForm {
  return {
    title: c.title,
    category: (c.category as CourseCategory) ?? "sales_skill",
    description: c.description ?? "",
    passingGrade: String(c.passingGrade),
    prerequisiteCourseId: c.prerequisiteCourseId ?? "none",
  };
}

async function runStatusAction(courseId: string, kind: CourseStatusActionKind) {
  if (kind === "submit-review") return api.post(`/courses/${courseId}/submit-review`, {}, { idempotency: true });
  if (kind === "withdraw") return api.post(`/courses/${courseId}/withdraw-review`, {}, { idempotency: true });
  const status = kind === "archive" ? "archived" : "draft";
  return api.patch(`/courses/${courseId}/status`, { status }, { idempotency: true });
}

export function CourseDetailView({
  course,
  tab,
  lessons,
  quizzes,
  prereqOptions,
}: {
  course: CourseDetail;
  tab: Tab;
  lessons: Part<CourseLessonRow[]>;
  quizzes: Part<CourseQuizRow[]>;
  prereqOptions: CoursePrereqPickerRow[];
}) {
  const router = useRouter();
  const lessonList = lessons.ok ? lessons.data : [];
  const quizList = quizzes.ok ? quizzes.data : [];
  const ready = isCourseReady(lessonList.length, quizList);
  const blockReason = courseReadinessBlockReason(lessonList.length, quizList);
  const showBlock = !ready && (course.status === "draft" || course.status === "pending_review");
  const locked = course.status === "pending_review";

  const [f, setF] = useState<CourseForm>(() => formFrom(course));
  const dirty = JSON.stringify(f) !== JSON.stringify(formFrom(course));
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  async function saveInfo() {
    setSavingInfo(true);
    setInfoError(null);
    try {
      await api.put(`/courses/${course.id}`, toCoursePayload(f));
      router.refresh();
    } catch (e) {
      setInfoError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setSavingInfo(false);
    }
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Detail Kursus</h1>
        <LinkButton href={"/instructor/kursus" as Route} variant="secondary">
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
            <strong>Menunggu tinjauan tim RumahAgen.</strong> Isi kursus terkunci sampai disetujui atau ditarik kembali.
          </div>
        ) : null}

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-headline">{course.title}</div>
              <div className="mt-1 text-caption">
                {course.category ? COURSE_CATEGORY_LABEL[course.category] : "—"} · Nilai lulus {course.passingGrade}
              </div>
            </div>
            <Badge tone={COURSE_STATUS_TONE[course.status]}>{COURSE_STATUS_LABEL[course.status]}</Badge>
          </div>
          <StatusActions courseId={course.id} status={course.status} ready={ready} />
          {showBlock ? <span className="text-caption text-danger-600">{blockReason}</span> : null}
        </div>

        <div className="flex gap-6 border-b border-ink-100">
          {(["ringkasan", "pelajaran", "kuis"] as Tab[]).map((t) => (
            <Link key={t} href={tabHref(course.id, t)} className={`border-b-2 py-3.5 text-label-lg font-bold ${tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
              {t === "ringkasan" ? "Ringkasan" : t === "pelajaran" ? "Pelajaran" : "Kuis"}
            </Link>
          ))}
        </div>

        {tab === "ringkasan" ? (
          <div className="flex flex-col gap-4">
            {course.status === "draft" || course.status === "pending_review" ? (
              <div className="flex flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5">
                <span className="text-title-md">Kesiapan untuk terbit</span>
                <div className="flex items-center gap-2.5">
                  <Badge tone={lessonList.length >= 1 ? "success" : "danger"}>{lessonList.length >= 1 ? "Siap" : "Belum"}</Badge>
                  <span className="text-body-md">Minimal 1 pelajaran ({lessonList.length} sekarang)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge tone={quizList.length >= 1 && quizList.every((q) => q.ready) ? "success" : "danger"}>{quizList.length >= 1 && quizList.every((q) => q.ready) ? "Siap" : "Belum"}</Badge>
                  <span className="text-body-md">Minimal 1 kuis, semua siap dinilai (soal, jawaban benar)</span>
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
              <span className="text-title-md">Informasi kursus</span>
              <Field label="Judul kursus" required>
                {(a) => <Input {...a} disabled={locked} maxLength={200} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />}
              </Field>
              <Field label="Kategori">
                {(a) => (
                  <Select {...a} disabled={locked} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as CourseCategory })}>
                    {COURSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {COURSE_CATEGORY_LABEL[c]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Deskripsi">{(a) => <Textarea {...a} disabled={locked} rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />}</Field>
              <Field label="Nilai lulus (0–100)">
                {(a) => <Input {...a} disabled={locked} type="number" min={0} max={100} className="max-w-[160px]" value={f.passingGrade} onChange={(e) => setF({ ...f, passingGrade: e.target.value })} />}
              </Field>
              <Field label="Prasyarat kursus">
                {(a) => (
                  <Select {...a} disabled={locked} value={f.prerequisiteCourseId} onChange={(e) => setF({ ...f, prerequisiteCourseId: e.target.value })}>
                    <option value="none">Tanpa prasyarat</option>
                    {prereqOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              {locked ? <span className="text-caption text-warning-600">Kursus sedang ditinjau; tarik kembali ke draf untuk mengedit.</span> : null}
              {infoError ? (
                <p role="alert" className="text-body-md text-danger-600">
                  {infoError}
                </p>
              ) : null}
              {dirty && !locked ? (
                <div className="flex justify-end gap-2.5">
                  <Button variant="secondary" disabled={savingInfo} onClick={() => setF(formFrom(course))}>
                    Batalkan
                  </Button>
                  <Button loading={savingInfo} onClick={() => void saveInfo()}>
                    Simpan
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        ) : tab === "pelajaran" ? (
          <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <span className="text-title-md">Pelajaran</span>
              <LessonDialog courseId={course.id} nextSortOrder={lessonList.length} disabled={locked} />
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
                  <LessonRow courseId={course.id} lesson={l} prev={lessonList[i - 1] ?? null} next={lessonList[i + 1] ?? null} disabled={locked} />
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-ink-100 bg-white">
            <div className="flex items-center justify-between border-b border-ink-100 p-4">
              <span className="text-title-md">Kuis</span>
              <QuizCreateDialog courseId={course.id} disabled={locked} />
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
                    <QuizRow courseId={course.id} quiz={q} disabled={locked} />
                  </div>
                ))}
                <div className="border-t border-ink-100 p-3">
                  <span className="text-caption">Kuis yang sudah dikerjakan peserta tidak bisa dihapus dan struktur/kunci jawabannya terkunci. Nilai lulus diatur di kursus.</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusActions({ courseId, status, ready }: { courseId: string; status: CourseDetail["status"]; ready: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: CourseStatusActionKind) {
    setBusy(true);
    setError(null);
    try {
      await runStatusAction(courseId, kind);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil diterapkan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  const actions = COURSE_STATUS_ACTIONS[status];
  if (actions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2.5">
      {actions.map((a) => (
        <Button key={a.kind} variant={a.primary ? "primary" : "secondary"} size="sm" loading={busy} disabled={a.needsReady && !ready} onClick={() => void run(a.kind)}>
          {a.label}
        </Button>
      ))}
      {error ? (
        <p role="alert" className="w-full text-body-md text-danger-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

type PickedFile = { file: File; name: string; size: number } | null;
type UploadTarget = { upload_url: string; public_url: string };

function LessonDialog({ courseId, lesson, nextSortOrder, disabled }: { courseId: string; lesson?: CourseLessonRow; nextSortOrder: number; disabled?: boolean }) {
  const router = useRouter();
  const isEdit = !!lesson;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [contentType, setContentType] = useState<"video" | "pdf" | "slide">((lesson?.contentType as "video" | "pdf" | "slide") ?? "video");
  const [contentUrl, setContentUrl] = useState(lesson?.contentUrl ?? "");
  const [picked, setPicked] = useState<PickedFile>(null);
  const [busy, setBusy] = useState<"idle" | "upload" | "save">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openDialog() {
    setTitle(lesson?.title ?? "");
    setContentType((lesson?.contentType as "video" | "pdf" | "slide") ?? "video");
    setContentUrl(lesson?.contentUrl ?? "");
    setPicked(null);
    setError(null);
    setOpen(true);
  }

  function onPickFile(files: FileList | null) {
    const f = files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!f) return;
    setError(null);
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) {
      setError("Berkas harus berupa PDF.");
      return;
    }
    if (f.size > MAX_COURSE_MATERIAL_BYTES) {
      setError("Ukuran berkas melebihi 20 MB. Pilih berkas lain.");
      return;
    }
    setPicked({ file: f, name: f.name, size: f.size });
  }

  const isFileType = contentType === "pdf" || contentType === "slide";
  const urlOk = !isFileType && (!contentUrl.trim() || /^https?:\/\//.test(contentUrl.trim()));
  const canSave = title.trim().length > 0 && (isFileType || urlOk);
  const busyState = busy !== "idle";

  async function save() {
    setBusy("save");
    setError(null);
    try {
      let finalUrl: string | undefined;
      if (isFileType) {
        if (picked) {
          setBusy("upload");
          const t = await api.post<UploadTarget>(`/courses/${courseId}/lessons/upload-url`, { file_name: picked.name, content_type: "application/pdf" }, { idempotency: true });
          const put = await fetch(t.data.upload_url, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: picked.file });
          if (!put.ok) throw new Error("upload");
          finalUrl = t.data.public_url;
          setBusy("save");
        }
      } else {
        finalUrl = contentUrl.trim() || undefined;
      }
      const body = { title: title.trim(), content_type: contentType, content_url: finalUrl };
      if (isEdit) {
        await api.put(`/course-lessons/${lesson.id}`, body, { idempotency: true });
      } else {
        await api.post(`/courses/${courseId}/lessons`, { ...body, sort_order: nextSortOrder }, { idempotency: true });
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy("idle");
    }
  }

  const currentFileName = picked ? picked.name : lesson?.contentUrl ? fileNameFromUrl(lesson.contentUrl) : null;

  return (
    <>
      {isEdit ? (
        <Button variant="secondary" size="sm" disabled={disabled} onClick={openDialog}>
          Ubah
        </Button>
      ) : (
        <Button size="sm" disabled={disabled} onClick={openDialog}>
          + Tambah
        </Button>
      )}
      <Dialog
        open={open}
        onClose={() => (busyState ? undefined : setOpen(false))}
        title={isEdit ? "Ubah pelajaran" : "Tambah pelajaran"}
        footer={
          <>
            <Button variant="secondary" disabled={busyState} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busyState} disabled={!canSave} onClick={() => void save()}>
              {busy === "upload" ? "Mengunggah…" : "Simpan"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Judul" required>
            {(a) => <Input {...a} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
          <Field label="Jenis konten">
            {() => (
              <div className="flex flex-wrap gap-2">
                {(["video", "pdf", "slide"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={contentType === t}
                    onClick={() => setContentType(t)}
                    className={`rounded-pill border px-3 py-1.5 text-[13px] font-bold ${contentType === t ? "border-blue-600 bg-blue-50 text-blue-600" : "border-ink-100 text-ink-500"}`}
                  >
                    {LESSON_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </Field>
          {isFileType ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-label-lg">Berkas PDF</span>
              <div className="flex items-center gap-3">
                <input ref={fileRef} type="file" accept="application/pdf" className="sr-only" onChange={(e) => onPickFile(e.target.files)} />
                <Button variant="secondary" size="sm" disabled={busyState} onClick={() => fileRef.current?.click()}>
                  {currentFileName ? "Ganti Berkas" : "Pilih Berkas"}
                </Button>
                {currentFileName ? <span className="min-w-0 flex-1 truncate text-body-md text-ink-500">{currentFileName}</span> : null}
              </div>
              <p className="text-caption">PDF hingga 20 MB. {isEdit && !picked ? "Berkas lama tetap dipakai bila tidak memilih berkas baru." : ""}</p>
            </div>
          ) : (
            <Field label="Alamat konten" error={!urlOk ? "Alamat harus diawali http:// atau https://." : undefined}>
              {(a) => <Input {...a} type="url" maxLength={500} placeholder="https://…" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} />}
            </Field>
          )}
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}

function LessonRow({ courseId, lesson, prev, next, disabled }: { courseId: string; lesson: CourseLessonRow; prev: CourseLessonRow | null; next: CourseLessonRow | null; disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function swap(other: CourseLessonRow) {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/course-lessons/${lesson.id}`, { sort_order: other.sortOrder }, { idempotency: true });
      await api.put(`/course-lessons/${other.id}`, { sort_order: lesson.sortOrder }, { idempotency: true });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil mengubah urutan.");
    } finally {
      setBusy(false);
    }
  }

  async function del() {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/course-lessons/${lesson.id}`);
      setDelOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dihapus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      {error ? <span className="text-caption text-danger-600">{error}</span> : null}
      <IconButton label="Naikkan urutan" disabled={busy || disabled || !prev} onClick={() => prev && void swap(prev)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M6 15l6-6 6 6" />
        </svg>
      </IconButton>
      <IconButton label="Turunkan urutan" disabled={busy || disabled || !next} onClick={() => next && void swap(next)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </IconButton>
      <LessonDialog courseId={courseId} lesson={lesson} nextSortOrder={0} disabled={disabled} />
      <IconButton label="Hapus pelajaran" disabled={busy || disabled} onClick={() => setDelOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </svg>
      </IconButton>

      <Dialog
        open={delOpen}
        onClose={() => (busy ? undefined : setDelOpen(false))}
        title="Hapus pelajaran?"
        description={`"${lesson.title ?? ""}" akan dihapus permanen dari kursus.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDelOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void del()}>
              Hapus
            </Button>
          </>
        }
      />
    </div>
  );
}

function QuizCreateDialog({ courseId, disabled }: { courseId: string; disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/courses/${courseId}/quizzes`, { title: title.trim() }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        size="sm"
        disabled={disabled}
        onClick={() => {
          setTitle("");
          setError(null);
          setOpen(true);
        }}
      >
        + Buat Kuis
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Buat kuis"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={title.trim().length === 0} onClick={() => void save()}>
              Buat Kuis
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Judul kuis" required>
            {(a) => <Input {...a} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </>
  );
}

function QuizRow({ courseId, quiz, disabled }: { courseId: string; quiz: CourseQuizRow; disabled?: boolean }) {
  const router = useRouter();
  const [delOpen, setDelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function del() {
    setBusy(true);
    setError(null);
    try {
      await api.delete(`/quizzes/${quiz.id}`);
      setDelOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dihapus.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error ? <span className="text-caption text-danger-600">{error}</span> : null}
      <LinkButton href={`/instructor/kursus/${courseId}/kuis/${quiz.id}` as Route} variant="secondary" size="sm">
        Buka Editor
      </LinkButton>
      <IconButton label="Hapus kuis" disabled={busy || disabled || quiz.hasAttempts} onClick={() => setDelOpen(true)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
        </svg>
      </IconButton>

      <Dialog
        open={delOpen}
        onClose={() => (busy ? undefined : setDelOpen(false))}
        title="Hapus kuis?"
        description={`"${quiz.title ?? ""}" beserta soal dan opsinya akan dihapus permanen. Kuis yang sudah dikerjakan peserta tidak bisa dihapus.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDelOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void del()}>
              Hapus
            </Button>
          </>
        }
      />
    </div>
  );
}
