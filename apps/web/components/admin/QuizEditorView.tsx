"use client";

// components/admin/QuizEditorView.tsx — Editor Kuis (M04, wireframe M04-Editor-Kuis): soal (quiz_questions) dan opsi (quiz_options) dengan kunci jawaban terlihat (staf/pengelola saja —
// GET /quizzes/{id}/editor). Migration 0135 (enforce_quiz_integrity): kuis yang SUDAH DIKERJAKAN peserta (hasAttempts) mengunci struktur untuk SEMUA pemanggil termasuk staf — opsi tak bisa
// ditambah/dihapus, soal tak bisa dihapus, jenis soal & kunci jawaban tak bisa diubah; teks soal/opsi tetap bisa diperbaiki dan soal baru tetap bisa ditambahkan.
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Route } from "next";
import { Button, IconButton, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import type { QuizEditorData, QuizOptionRow, QuizQuestionRow } from "@/lib/admin/course-data";
import { ApiClientError, api } from "@/lib/api-client";

const QUESTION_TYPE_LABEL: Record<string, string> = { single_choice: "Pilihan tunggal", multi_choice: "Pilihan ganda" };

type DialogState =
  | { kind: "question" }
  | { kind: "editQuestion"; question: QuizQuestionRow }
  | { kind: "option"; questionId: string }
  | { kind: "editOption"; questionId: string; option: QuizOptionRow }
  | { kind: "delQuestion"; question: QuizQuestionRow }
  | { kind: "delOption"; questionId: string; option: QuizOptionRow }
  | null;

export function QuizEditorView({ data }: { data: QuizEditorData }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<"single_choice" | "multi_choice">("single_choice");
  const [oText, setOText] = useState("");
  const [oCorrect, setOCorrect] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const structLocked = data.hasAttempts;

  function close() {
    setDialog(null);
    setError(null);
    setTried(false);
  }

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function saveQuestion() {
    if (!qText.trim()) return setTried(true);
    void run(() => api.post(`/quizzes/${data.quizId}/questions`, { question_text: qText.trim(), question_type: qType }, { idempotency: true }));
  }

  function saveOption(questionId: string) {
    if (!oText.trim()) return setTried(true);
    void run(() => api.post(`/quiz-questions/${questionId}/options`, { option_text: oText.trim(), is_correct: oCorrect }, { idempotency: true }));
  }

  function saveEditQuestion(question: QuizQuestionRow) {
    if (!qText.trim()) return setTried(true);
    void run(() => api.put(`/quiz-questions/${question.id}`, { question_text: qText.trim(), question_type: structLocked ? undefined : qType }, { idempotency: true }));
  }

  function saveEditOption(option: QuizOptionRow) {
    if (!oText.trim()) return setTried(true);
    void run(() => api.put(`/quiz-options/${option.id}`, { option_text: oText.trim() }, { idempotency: true }));
  }

  function flipCorrect(option: QuizOptionRow) {
    if (structLocked || busy) return;
    void run(() => api.put(`/quiz-options/${option.id}`, { is_correct: !option.isCorrect }, { idempotency: true }));
  }

  function confirmDelete() {
    if (dialog?.kind === "delQuestion") void run(() => api.delete(`/quiz-questions/${dialog.question.id}`));
    else if (dialog?.kind === "delOption") void run(() => api.delete(`/quiz-options/${dialog.option.id}`));
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <h1 className="text-headline">Editor Kuis</h1>
        <LinkButton href={`/admin/kursus/${data.courseId}` as Route} variant="secondary">
          Kembali ke Kursus
        </LinkButton>
      </div>

      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-4 p-4 lg:p-8">
        {structLocked ? (
          <div className="rounded-md border border-warning-200 bg-warning-100 p-3.5 text-body-md text-warning-600">
            <strong>Kuis ini sudah dikerjakan peserta.</strong> Struktur dikunci: opsi tidak bisa ditambah/dihapus, kunci jawaban dan jenis soal tidak bisa diubah, soal tidak bisa dihapus. Teks
            soal dan opsi masih bisa diperbaiki dan soal baru bisa ditambahkan.
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 rounded-md border border-ink-100 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-headline">{data.quizTitle || "—"}</div>
              <div className="text-caption">
                {data.courseTitle} · {data.questions.length} soal · nilai lulus {data.passingGrade}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setQText("");
                setQType("single_choice");
                setTried(false);
                setDialog({ kind: "question" });
              }}
            >
              + Tambah Soal
            </Button>
          </div>
          <div className={`rounded-md p-3 text-body-md ${data.ready ? "bg-success-100 text-success-600" : "bg-warning-100 text-warning-600"}`}>
            {data.questions.length === 0
              ? "Kuis belum punya soal."
              : data.ready
                ? "Semua soal valid dan siap dipakai."
                : `${data.problems.length} masalah perlu diperbaiki sebelum kursus bisa diterbitkan dan kuis dipakai peserta.`}
          </div>
        </div>

        <p className="text-caption">
          Kunci jawaban hanya terlihat oleh pengelola kursus; peserta melihat soal dan opsi tanpa penanda benar. Nilai dihitung dari seluruh soal (soal tak dijawab dihitung salah).
        </p>

        {data.questions.length === 0 ? (
          <div className="rounded-md border border-ink-100 bg-white py-16 text-center text-body-md text-ink-500">Belum ada soal.</div>
        ) : (
          data.questions.map((q, i) => {
            const correctCount = q.options.filter((o) => o.isCorrect).length;
            const problem = q.options.length < 2 ? "Minimal 2 opsi jawaban." : correctCount === 0 ? "Belum ada opsi yang ditandai benar." : q.questionType === "single_choice" && correctCount > 1 ? "Pilihan tunggal hanya boleh punya 1 jawaban benar." : "";
            return (
              <div key={q.id} className="overflow-hidden rounded-md border border-ink-100 bg-white">
                <div className="flex items-start gap-3 border-b border-ink-100 p-4">
                  <div className="min-w-0 flex-1">
                    <span className="text-caption">
                      Soal {i + 1} · {QUESTION_TYPE_LABEL[q.questionType]}
                    </span>
                    <div className="mt-0.5 text-label-lg">{q.questionText}</div>
                  </div>
                  <IconButton
                    label="Ubah soal"
                    onClick={() => {
                      setQText(q.questionText);
                      setQType(q.questionType);
                      setTried(false);
                      setDialog({ kind: "editQuestion", question: q });
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
                    </svg>
                  </IconButton>
                  <IconButton label="Hapus soal" disabled={structLocked} onClick={() => setDialog({ kind: "delQuestion", question: q })}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                    </svg>
                  </IconButton>
                </div>
                {q.options.length === 0 ? <div className="border-t border-ink-50 px-4 py-3 text-body-md text-ink-500">Belum ada opsi jawaban.</div> : null}
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 border-t border-ink-50 px-4 py-3">
                    <div className="min-w-0 flex-1 text-body-md">{o.optionText}</div>
                    <button
                      type="button"
                      disabled={structLocked}
                      onClick={() => flipCorrect(o)}
                      className="min-h-11 cursor-pointer border-none"
                      aria-label="Ubah kunci jawaban"
                    >
                      <Badge tone={o.isCorrect ? "success" : "neutral"}>{o.isCorrect ? "Benar" : "Salah"}</Badge>
                    </button>
                    <IconButton
                      label="Ubah opsi"
                      onClick={() => {
                        setOText(o.optionText);
                        setTried(false);
                        setDialog({ kind: "editOption", questionId: q.id, option: o });
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                        <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
                      </svg>
                    </IconButton>
                    <IconButton label="Hapus opsi" disabled={structLocked} onClick={() => setDialog({ kind: "delOption", questionId: q.id, option: o })}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
                        <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
                      </svg>
                    </IconButton>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-ink-50 px-4 py-3">
                  {problem ? <span className="text-caption text-danger-600">{problem}</span> : <span />}
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={structLocked}
                    onClick={() => {
                      setOText("");
                      setOCorrect(false);
                      setTried(false);
                      setDialog({ kind: "option", questionId: q.id });
                    }}
                  >
                    + Tambah Opsi
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog
        open={dialog?.kind === "question"}
        onClose={() => (busy ? undefined : close())}
        title="Tambah soal"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={close}>
              Batal
            </Button>
            <Button loading={busy} onClick={saveQuestion}>
              Tambah Soal
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Teks soal" required error={tried && !qText.trim() ? "Teks soal wajib diisi." : undefined}>
            {(a) => <Textarea {...a} rows={3} value={qText} onChange={(e) => setQText(e.target.value)} />}
          </Field>
          <Field label="Jenis soal">
            {() => (
              <div className="grid grid-cols-2 gap-2.5">
                {(["single_choice", "multi_choice"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={qType === t}
                    onClick={() => setQType(t)}
                    className={`min-h-11 rounded-md border-[1.5px] p-3 text-left text-label-lg ${qType === t ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
                  >
                    {QUESTION_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={dialog?.kind === "editQuestion"}
        onClose={() => (busy ? undefined : close())}
        title="Ubah soal"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={close}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => dialog?.kind === "editQuestion" && saveEditQuestion(dialog.question)}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Teks soal" required error={tried && !qText.trim() ? "Teks soal wajib diisi." : undefined}>
            {(a) => <Textarea {...a} rows={3} value={qText} onChange={(e) => setQText(e.target.value)} />}
          </Field>
          <Field label="Jenis soal" hint={structLocked ? "Jenis soal dikunci karena kuis sudah dikerjakan." : undefined}>
            {() => (
              <div className="grid grid-cols-2 gap-2.5">
                {(["single_choice", "multi_choice"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={qType === t}
                    disabled={structLocked}
                    onClick={() => setQType(t)}
                    className={`min-h-11 rounded-md border-[1.5px] p-3 text-left text-label-lg disabled:opacity-60 ${qType === t ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
                  >
                    {QUESTION_TYPE_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={dialog?.kind === "option"}
        onClose={() => (busy ? undefined : close())}
        title="Tambah opsi jawaban"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={close}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => dialog?.kind === "option" && saveOption(dialog.questionId)}>
              Tambah Opsi
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Teks opsi" required error={tried && !oText.trim() ? "Teks opsi wajib diisi." : undefined}>
            {(a) => <Input {...a} maxLength={500} value={oText} onChange={(e) => setOText(e.target.value)} />}
          </Field>
          <div className="flex items-center justify-between gap-4 py-2">
            <span className="text-label-lg">Jawaban benar</span>
            <button
              type="button"
              role="switch"
              aria-checked={oCorrect}
              onClick={() => setOCorrect((c) => !c)}
              className={`relative h-6 w-11 flex-none rounded-pill border-none p-0 ${oCorrect ? "bg-blue-600" : "bg-ink-200"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${oCorrect ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={dialog?.kind === "editOption"}
        onClose={() => (busy ? undefined : close())}
        title="Ubah opsi"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={close}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => dialog?.kind === "editOption" && saveEditOption(dialog.option)}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Teks opsi" required error={tried && !oText.trim() ? "Teks opsi wajib diisi." : undefined}>
            {(a) => <Input {...a} maxLength={500} value={oText} onChange={(e) => setOText(e.target.value)} />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={dialog?.kind === "delQuestion" || dialog?.kind === "delOption"}
        onClose={() => (busy ? undefined : close())}
        title={dialog?.kind === "delQuestion" ? "Hapus soal?" : "Hapus opsi?"}
        description={`"${dialog?.kind === "delQuestion" ? dialog.question.questionText : dialog?.kind === "delOption" ? dialog.option.optionText : ""}" akan dihapus permanen.`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={close}>
              Batal
            </Button>
            <Button loading={busy} onClick={confirmDelete}>
              Hapus
            </Button>
          </>
        }
      >
        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </div>
  );
}
