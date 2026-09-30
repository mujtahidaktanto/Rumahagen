"use client";

// components/admin/LessonFormDialog.tsx — Tambah/Ubah Pelajaran (Detail Kursus, tab Pelajaran): POST /courses/{courseId}/lessons (create) atau PUT /course-lessons/{id} (edit).
// Terkunci untuk non-staf saat kursus pending_review (enforce_course_content_lock_during_review) — staf (Admin UI) TIDAK terkunci, jadi tombol selalu aktif di sini.
// Video tetap tautan URL (YouTube/mp4 dari luar); PDF dan Slide diunggah sebagai berkas PDF (migration 0168, bucket `course-materials`) — keputusan pemilik
// produk 2026-09-30: pisahkan Video (URL) dari PDF/Slide (unggah), Slide juga PDF saja (bukan PPT/PPTX) supaya tetap terbuka langsung di tab baru.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import type { CourseLessonRow } from "@/lib/admin/course-data";
import { LESSON_TYPE_LABEL } from "@/lib/admin/course-labels";
import { ApiClientError, api } from "@/lib/api-client";
import { MAX_COURSE_MATERIAL_BYTES } from "@/lib/validation/courses";

const TYPES = ["video", "pdf", "slide"] as const;
type LessonType = (typeof TYPES)[number];
type PickedFile = { file: File; name: string; size: number } | null;
type UploadTarget = { upload_url: string; public_url: string };

/** Nama berkas dari URL tersimpan (path bucket atau tautan luar), untuk pratinjau "Berkas saat ini". */
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    const last = path.split("/").pop() ?? url;
    return decodeURIComponent(last.replace(/^[0-9a-f-]{36}-/i, ""));
  } catch {
    return url;
  }
}

export function LessonFormDialog({ courseId, lesson, nextSortOrder, trigger }: { courseId: string; lesson?: CourseLessonRow; nextSortOrder: number; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!lesson;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(lesson?.title ?? "");
  const [contentType, setContentType] = useState<LessonType>((lesson?.contentType as LessonType) ?? "video");
  const [contentUrl, setContentUrl] = useState(lesson?.contentUrl ?? "");
  const [picked, setPicked] = useState<PickedFile>(null);
  const [busy, setBusy] = useState<"idle" | "upload" | "save">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function openDialog() {
    setTitle(lesson?.title ?? "");
    setContentType((lesson?.contentType as LessonType) ?? "video");
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
        // Tidak ada berkas baru dipilih: biarkan content_url tidak disentuh (Ubah) atau tetap kosong (Buat) — sama seperti Video yang boleh diisi belakangan.
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
      {trigger(openDialog)}
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
