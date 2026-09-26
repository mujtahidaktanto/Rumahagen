"use client";

// components/admin/LessonFormDialog.tsx — Tambah/Ubah Pelajaran (Detail Kursus, tab Pelajaran): POST /courses/{courseId}/lessons (create) atau PUT /course-lessons/{id} (edit).
// Terkunci untuk non-staf saat kursus pending_review (enforce_course_content_lock_during_review) — staf (Admin UI) TIDAK terkunci, jadi tombol selalu aktif di sini.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import type { CourseLessonRow } from "@/lib/admin/course-data";
import { LESSON_TYPE_LABEL } from "@/lib/admin/course-labels";
import { ApiClientError, api } from "@/lib/api-client";

const TYPES = ["video", "pdf", "slide"] as const;
type LessonType = (typeof TYPES)[number];

export function LessonFormDialog({ courseId, lesson, nextSortOrder, trigger }: { courseId: string; lesson?: CourseLessonRow; nextSortOrder: number; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!lesson;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [contentType, setContentType] = useState<LessonType>((lesson?.contentType as LessonType) ?? "video");
  const [contentUrl, setContentUrl] = useState(lesson?.contentUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setTitle(lesson?.title ?? "");
    setContentType((lesson?.contentType as LessonType) ?? "video");
    setContentUrl(lesson?.contentUrl ?? "");
    setError(null);
    setOpen(true);
  }

  const urlOk = !contentUrl.trim() || /^https?:\/\//.test(contentUrl.trim());
  const canSave = title.trim().length > 0 && urlOk;

  async function save() {
    setBusy(true);
    setError(null);
    const body = { title: title.trim(), content_type: contentType, content_url: contentUrl.trim() || undefined };
    try {
      if (isEdit) {
        await api.put(`/course-lessons/${lesson.id}`, body, { idempotency: true });
      } else {
        await api.post(`/courses/${courseId}/lessons`, { ...body, sort_order: nextSortOrder }, { idempotency: true });
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={isEdit ? "Ubah pelajaran" : "Tambah pelajaran"}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} disabled={!canSave} onClick={() => void save()}>
              Simpan
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
                {TYPES.map((t) => (
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
          <Field label="Alamat konten" error={!urlOk ? "Alamat harus diawali http:// atau https://." : undefined}>
            {(a) => <Input {...a} type="url" maxLength={500} placeholder="https://…" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} />}
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
