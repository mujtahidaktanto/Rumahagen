"use client";

// components/agent/CourseRunner.tsx — layar Belajar-Course (M04, wireframe 01-Agent/M04-Belajar-Course): daftar materi di samping, tampilan materi, Kuis Akhir, dan layar Course Selesai.
// Semua lewat /api: progres pelajaran = PATCH /enrollments/{id} (maks 99, berurutan; lihat lib/agent/learning-rules.ts), soal = GET /quizzes/{id}/take (tanpa kunci jawaban), status percobaan =
// GET /quizzes/{id}/attempt-status, kumpul = POST /quizzes/{id}/submit (Idempotency-Key; nilai dan kelulusan dihitung server; kursus otomatis selesai saat semua kuis lulus).
// Sertifikat diunduh lewat GET /courses/{id}/certificate (menerbitkan bila belum ada).
import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/States";
import { BookIcon, CheckCircleIcon, ChevronLeftIcon, ClipboardIcon, DocIcon, TrophyIcon, VideoIcon } from "@/components/ui/icons";
import { downloadCertificatePdf } from "@/lib/agent/certificate-download";
import type { CourseRun, RunLesson } from "@/lib/agent/learning-data";
import {
  attemptBlockMessage,
  canMarkLesson,
  doneFromProgress,
  LESSON_TYPE_NOUN,
  progressForDone,
  toggleAnswer,
  toSubmitPayload,
  unansweredCount,
  youtubeEmbedUrl,
  type Answers,
  type QuizAttemptStatus,
  type QuizQuestion,
} from "@/lib/agent/learning-rules";
import { ApiClientError, api } from "@/lib/api-client";
import { cn } from "@/lib/cn";

type View = { kind: "lesson"; index: number } | { kind: "quiz"; index: number } | { kind: "completed" };

const LESSON_TYPE_LABEL: Record<string, string> = { video: "Video", pdf: "PDF", slide: "Slide" };
const errText = (e: unknown, fallback: string) => (e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : fallback);

function LessonIcon({ type, size = 16 }: { type: string; size?: number }) {
  return type === "video" ? <VideoIcon size={size} /> : type === "slide" ? <BookIcon size={size} /> : <DocIcon size={size} />;
}

function LessonViewer({ lesson }: { lesson: RunLesson }) {
  const yt = lesson.type === "video" ? youtubeEmbedUrl(lesson.url) : null;
  if (!lesson.url) {
    return (
      <div className="mb-5 flex aspect-video items-center justify-center rounded-md bg-ink-900 p-4 text-center text-body-md text-white/70">Materi {LESSON_TYPE_NOUN[lesson.type] ?? ""} ini belum tersedia. Hubungi penyelenggara bila terus kosong.</div>
    );
  }
  if (yt) {
    return <iframe src={yt} title={lesson.title} allow="fullscreen; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" className="mb-5 aspect-video w-full rounded-md border-0 bg-ink-900" />;
  }
  if (lesson.type === "video" && /\.(mp4|webm|ogg)(\?|$)/i.test(lesson.url)) {
    return <video src={lesson.url} controls preload="metadata" className="mb-5 aspect-video w-full rounded-md bg-ink-900" />;
  }
  return (
    <div className="mb-5 flex aspect-video flex-col items-center justify-center gap-3 rounded-md bg-ink-900 p-4 text-center text-white/80">
      <LessonIcon type={lesson.type} size={32} />
      <span className="text-body-md">Materi {LESSON_TYPE_NOUN[lesson.type] ?? ""} dibuka di tab baru.</span>
      <a href={lesson.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center rounded-md bg-white px-5 text-label-lg text-blue-600 no-underline hover:no-underline">
        Buka Materi
      </a>
    </div>
  );
}

// ── Kuis ──
type QuizLoad = { state: "loading" } | { state: "error"; message: string } | { state: "blocked"; message: string } | { state: "ready"; questions: QuizQuestion[]; enrollmentId: string };
type Result = { score: number; passed: boolean };

function QuizPanel({
  quizId,
  title,
  enrollmentId,
  passingGrade,
  alreadyPassed,
  isLastOpen,
  onPassed,
  onNext,
}: {
  quizId: string;
  title: string;
  enrollmentId: string;
  passingGrade: number;
  alreadyPassed: boolean;
  isLastOpen: boolean;
  onPassed: () => void;
  onNext: () => void;
}) {
  const [load, setLoad] = useState<QuizLoad>({ state: "loading" });
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const keyRef = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoad({ state: "loading" });
      setResult(null);
      setAnswers({});
      setError(null);
      try {
        const status = await api.get<QuizAttemptStatus>(`/quizzes/${quizId}/attempt-status`, { enrollment_id: enrollmentId });
        const blocked = attemptBlockMessage(status.data);
        if (blocked && !alreadyPassed) {
          if (alive) setLoad({ state: "blocked", message: blocked });
          return;
        }
        const res = await api.get<{ enrollment_id: string; questions: QuizQuestion[] }>(`/quizzes/${quizId}/take`);
        if (alive) setLoad({ state: "ready", questions: res.data.questions, enrollmentId: res.data.enrollment_id });
      } catch (e) {
        if (!alive) return;
        if (e instanceof ApiClientError && e.code === "CONFLICT") setLoad({ state: "blocked", message: "Kuis ini belum siap dikerjakan. Hubungi penyelenggara kursus." });
        else setLoad({ state: "error", message: errText(e, "Kuis gagal dimuat. Periksa koneksi Anda lalu coba lagi.") });
      }
    })();
    return () => {
      alive = false;
    };
  }, [quizId, enrollmentId, alreadyPassed, attempt]);

  async function submit() {
    if (load.state !== "ready") return;
    const missing = unansweredCount(load.questions, answers);
    if (missing > 0) {
      setError(`${missing} soal belum dijawab. Jawab semua soal sebelum mengumpulkan.`);
      return;
    }
    setSubmitting(true);
    setError(null);
    keyRef.current ??= crypto.randomUUID(); // kunci sama bila kirim ulang setelah jaringan putus
    try {
      const res = await api.post<{ score: number | string; passed: boolean }>(`/quizzes/${quizId}/submit`, toSubmitPayload(load.enrollmentId, load.questions, answers), { idempotency: keyRef.current });
      keyRef.current = null;
      const r = { score: Math.round(Number(res.data.score) * 10) / 10, passed: res.data.passed };
      setResult(r);
      if (r.passed) onPassed();
    } catch (e) {
      setError(errText(e, "Jawaban belum terkirim. Coba lagi."));
      if (e instanceof ApiClientError && e.status !== 0 && e.code !== "RATE_LIMITED") keyRef.current = null;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="text-title-lg">{title}</h2>
      <p className="mt-1 mb-5 text-caption">Nilai kelulusan minimum {passingGrade}. Kunci jawaban tidak ditampilkan sebelum Anda mengumpulkan.</p>

      {alreadyPassed && !result ? (
        <p role="status" className="mb-4 rounded-md bg-success-100 p-3 text-body-md text-success-600">
          Anda sudah lulus kuis ini.
        </p>
      ) : null}

      {load.state === "loading" ? (
        <div role="status" aria-label="Memuat kuis…" className="flex flex-col gap-3">
          <Skeleton className="h-28 rounded-md" />
          <Skeleton className="h-28 rounded-md" />
        </div>
      ) : load.state === "error" ? (
        <ErrorState title="Kuis gagal dimuat" message={load.message} onRetry={() => setAttempt((n) => n + 1)} />
      ) : load.state === "blocked" ? (
        <div role="status" className="rounded-md bg-warning-100 p-4 text-body-md text-ink-900">
          <p>{load.message}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => setAttempt((n) => n + 1)}>
            Cek Lagi
          </Button>
        </div>
      ) : result ? (
        <div className="rounded-md border border-ink-100 p-6 text-center" role="status">
          <span className="text-caption">Skor Anda</span>
          <div className="text-display">{result.score}</div>
          <Badge tone={result.passed ? "success" : "danger"}>{result.passed ? "Lulus" : "Belum lulus"}</Badge>
          {!result.passed ? <p className="mx-auto mt-3 max-w-sm text-body-md text-ink-500">Nilai minimum {passingGrade}. Pelajari materinya lagi lalu coba kembali.</p> : null}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {result.passed ? (
              <Button onClick={onNext}>{isLastOpen ? "Lanjutkan" : "Kuis Berikutnya"}</Button>
            ) : (
              <Button onClick={() => setAttempt((n) => n + 1)}>Coba Lagi</Button>
            )}
          </div>
        </div>
      ) : (
        <>
          {load.questions.map((q, qi) => {
            const multi = q.question_type === "multi_choice";
            return (
              <fieldset key={q.id} className="mb-3.5 rounded-md border border-ink-100 p-4 sm:p-5">
                <legend className="sr-only">Soal {qi + 1}</legend>
                <span className="block text-label-lg break-words">
                  {qi + 1}. {q.question_text}
                </span>
                <span className="text-caption">{multi ? "Pilih satu atau lebih" : "Pilih satu jawaban"}</span>
                {q.options.map((o) => {
                  const on = (answers[q.id] ?? []).includes(o.id);
                  return (
                    <label key={o.id} className={cn("mt-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border px-3 py-2.5", on ? "border-blue-600 bg-blue-50" : "border-ink-100")}>
                      <input type={multi ? "checkbox" : "radio"} name={q.id} checked={on} onChange={() => setAnswers((a) => toggleAnswer(a, q, o.id))} className="h-[18px] w-[18px] flex-none accent-blue-600" />
                      <span className="text-body-md break-words">{o.option_text}</span>
                    </label>
                  );
                })}
              </fieldset>
            );
          })}
          {error ? (
            <p role="alert" className="mb-3 rounded-md bg-danger-100 p-3 text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
          <Button loading={submitting} onClick={() => void submit()}>
            {submitting ? "Mengumpulkan…" : "Kumpulkan Kuis"}
          </Button>
        </>
      )}
    </div>
  );
}

// ── Layar utama ──
export function CourseRunner({ run }: { run: CourseRun }) {
  const total = run.lessons.length;
  const [completed, setCompleted] = useState(run.status === "completed");
  const [done, setDone] = useState(doneFromProgress(run.progress, total, run.status === "completed"));
  const [passed, setPassed] = useState<Set<string>>(() => new Set(run.quizzes.filter((q) => q.passed).map((q) => q.id)));
  const firstOpen = Math.min(done, Math.max(0, total - 1));
  const [view, setView] = useState<View>(total === 0 && run.quizzes.length > 0 ? { kind: "quiz", index: 0 } : { kind: "lesson", index: firstOpen });
  const [marking, setMarking] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const [dl, setDl] = useState<{ state: "idle" | "busy" | "ok" | "err"; text: string }>({ state: "idle", text: "" });
  const [issued, setIssued] = useState(run.certificateIssued);

  const overall = completed ? 100 : progressForDone(done, total);
  const allLessonsDone = done >= total;
  const quizzes = run.quizzes;

  const nextOpenQuiz = useMemo(() => quizzes.findIndex((q) => !passed.has(q.id)), [quizzes, passed]);

  const markDone = useCallback(
    async (index: number) => {
      if (!canMarkLesson(index, done) || marking) return;
      setMarking(true);
      setLessonError(null);
      try {
        await api.patch(`/enrollments/${run.enrollmentId}`, { progress_percent: progressForDone(done + 1, total) });
        setDone(done + 1);
      } catch (e) {
        setLessonError(errText(e, "Progres belum tersimpan. Coba lagi."));
      } finally {
        setMarking(false);
      }
    },
    [done, marking, run.enrollmentId, total],
  );

  function goNextFromLesson(index: number) {
    if (index + 1 < total) setView({ kind: "lesson", index: index + 1 });
    else if (quizzes.length > 0) setView({ kind: "quiz", index: Math.max(0, nextOpenQuiz) });
  }

  function onQuizPassed(id: string) {
    const next = new Set(passed).add(id);
    setPassed(next);
    if (quizzes.every((q) => next.has(q.id))) setCompleted(true); // server menandai kursus selesai saat semua kuis lulus (migration 0130)
  }

  async function downloadCert() {
    setDl({ state: "busy", text: "" });
    try {
      await downloadCertificatePdf(`/api/courses/${run.courseId}/certificate?download=1`, "sertifikat.pdf");
      setIssued(true);
      setDl({ state: "ok", text: "Sertifikat diunduh." });
    } catch (e) {
      setDl({ state: "err", text: e instanceof Error ? e.message : "Sertifikat belum bisa diunduh." });
    }
  }

  const quizLocked = !allLessonsDone && !completed;

  function pick(v: View) {
    setLessonError(null);
    setView(v);
  }

  const listItem = (key: string, active: boolean, isDone: boolean, icon: React.ReactNode, title: string, note: string, onClick: () => void, disabled = false) => (
    <li key={key}>
      <button type="button" onClick={onClick} disabled={disabled} aria-current={active ? "step" : undefined} className={cn("flex min-h-14 w-full items-center gap-3 px-5 py-3 text-left disabled:cursor-not-allowed disabled:opacity-50", active && "bg-blue-50")}>
        <span className={cn("flex h-8 w-8 flex-none items-center justify-center rounded-full", isDone ? "bg-success-100 text-success-600" : active ? "bg-blue-600 text-white" : "bg-ink-100 text-ink-500")}>
          {isDone ? <CheckCircleIcon size={16} /> : icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-md">{title}</span>
          <span className="text-caption">{note}</span>
        </span>
      </button>
    </li>
  );

  const list = (
    <ul className="py-2">
      {run.lessons.map((l, i) => listItem(l.id, view.kind === "lesson" && view.index === i, i < done, <LessonIcon type={l.type} />, l.title, LESSON_TYPE_LABEL[l.type] ?? "Materi", () => pick({ kind: "lesson", index: i })))}
      {quizzes.map((q, i) =>
        listItem(
          q.id,
          view.kind === "quiz" && view.index === i,
          passed.has(q.id),
          <ClipboardIcon size={16} />,
          q.title?.trim() || (quizzes.length > 1 ? `Kuis ${i + 1}` : "Kuis Akhir"),
          quizLocked ? "Selesaikan semua materi dulu" : passed.has(q.id) ? "Lulus" : "Kuis",
          () => pick({ kind: "quiz", index: i }),
          quizLocked,
        ),
      )}
    </ul>
  );

  const curLesson = view.kind === "lesson" ? run.lessons[view.index] : undefined;
  const curQuiz = view.kind === "quiz" ? quizzes[view.index] : undefined;

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col lg:min-h-dvh">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-100 bg-white px-4 py-3 lg:px-6">
        <Link href={"/agent/belajar" as Route} aria-label="Kembali ke Pembelajaran" className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-ink-700 hover:bg-ink-50">
          <ChevronLeftIcon size={20} />
        </Link>
        <h1 className="min-w-0 flex-1 truncate text-label-lg">{run.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-caption">{overall}% selesai</span>
          <span role="progressbar" aria-label="Progres course" aria-valuemin={0} aria-valuemax={100} aria-valuenow={overall} className="h-2 w-36 overflow-hidden rounded-full bg-ink-100 sm:w-56">
            <span className="block h-full rounded-full bg-blue-600" style={{ width: `${overall}%` }} />
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex-none border-b border-ink-100 bg-white lg:w-72 lg:overflow-y-auto lg:border-r lg:border-b-0">
          <details className="lg:hidden" open={false}>
            <summary className="flex min-h-12 cursor-pointer items-center px-5 text-label-lg">
              Daftar materi ({total + quizzes.length})
            </summary>
            {list}
          </details>
          <nav aria-label="Daftar materi" className="hidden lg:block">
            {list}
          </nav>
        </aside>

        <main className="flex min-w-0 flex-1 justify-center p-4 sm:p-8">
          <div className="w-full max-w-[760px]">
            {completed && view.kind !== "completed" ? (
              <div role="status" className="mb-5 flex flex-wrap items-center gap-3 rounded-md bg-success-100 p-3.5 text-body-md text-success-600">
                <span className="min-w-0 flex-1">Anda sudah menyelesaikan course ini.</span>
                <Button variant="secondary" size="sm" onClick={() => pick({ kind: "completed" })}>
                  Lihat Sertifikat
                </Button>
              </div>
            ) : null}

            {view.kind === "lesson" && curLesson ? (
              (() => {
                const l = curLesson;
                const idx = view.index;
                const isDone = idx < done;
                return (
                  <div>
                    <LessonViewer lesson={l} />
                    <h2 className="mb-1.5 text-title-lg break-words">{l.title}</h2>
                    <p className="mb-6 text-body-md text-ink-500">
                      Materi {LESSON_TYPE_NOUN[l.type] ?? ""} dari course “{run.title}”. Selesaikan berurutan untuk membuka kuis.
                    </p>
                    {lessonError ? (
                      <p role="alert" className="mb-3 rounded-md bg-danger-100 p-3 text-body-md text-danger-600">
                        {lessonError}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3">
                      {isDone ? (
                        <Badge tone="success" className="px-3 py-2">
                          Sudah selesai
                        </Badge>
                      ) : canMarkLesson(idx, done) ? (
                        <Button loading={marking} onClick={() => void markDone(idx)}>
                          Tandai Selesai
                        </Button>
                      ) : (
                        <span className="text-caption">Selesaikan materi sebelumnya dulu untuk menandai yang ini.</span>
                      )}
                      {idx + 1 < total || quizzes.length > 0 ? (
                        <Button variant="secondary" disabled={idx + 1 >= total && quizLocked} onClick={() => goNextFromLesson(idx)}>
                          {idx + 1 < total ? "Lanjut →" : "Ke Kuis →"}
                        </Button>
                      ) : null}
                    </div>
                    {idx + 1 >= total && quizzes.length === 0 && !completed ? (
                      <p role="note" className="mt-5 rounded-md bg-info-100 p-3.5 text-body-md text-ink-900">
                        Course ini belum memiliki kuis. Penyelesaian dan sertifikat dicatat oleh tim RumahAgen setelah course ditinjau.
                      </p>
                    ) : null}
                  </div>
                );
              })()
            ) : null}

            {view.kind === "quiz" && curQuiz ? (
              <QuizPanel
                key={curQuiz.id}
                quizId={curQuiz.id}
                title={curQuiz.title?.trim() || (quizzes.length > 1 ? `Kuis ${view.index + 1}` : "Kuis Akhir")}
                enrollmentId={run.enrollmentId}
                passingGrade={run.passingGrade}
                alreadyPassed={passed.has(curQuiz.id)}
                isLastOpen={nextOpenQuiz === -1}
                onPassed={() => onQuizPassed(curQuiz.id)}
                onNext={() => {
                  const next = quizzes.findIndex((q, i) => i !== (view as { index: number }).index && !passed.has(q.id));
                  if (next >= 0) pick({ kind: "quiz", index: next });
                  else pick({ kind: "completed" });
                }}
              />
            ) : null}

            {view.kind === "completed" ? (
              <div className="flex flex-col items-center gap-4 px-2 py-10 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success-100 text-success-600">
                  <TrophyIcon size={36} />
                </span>
                <h2 className="text-display text-[26px]">Course Selesai!</h2>
                <p className="max-w-[420px] text-body-md text-ink-500">Anda telah menyelesaikan “{run.title}” dan lulus kuisnya.</p>
                <div className="flex w-full max-w-[420px] flex-col items-center gap-2">
                  <Button className="w-full" loading={dl.state === "busy"} disabled={!completed} onClick={() => void downloadCert()}>
                    {dl.state === "busy" ? "Menyiapkan sertifikat…" : "Unduh Sertifikat (PDF)"}
                  </Button>
                  {dl.state === "ok" ? (
                    <span role="status" className="text-body-sm text-success-600">
                      {dl.text}
                    </span>
                  ) : null}
                  {dl.state === "err" ? (
                    <span role="alert" className="text-body-sm text-danger-600">
                      {dl.text}
                    </span>
                  ) : null}
                  <span className="text-caption">
                    Sertifikat terbit otomatis{issued ? "" : " saat diunduh"}. Anda bisa mengunduhnya lagi kapan saja dari Pembelajaran &gt; Sertifikat Saya.
                  </span>
                </div>
                <LinkButton href={"/agent/belajar" as Route} variant="secondary">
                  Kembali ke Pembelajaran
                </LinkButton>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
