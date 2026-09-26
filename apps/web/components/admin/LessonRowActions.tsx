"use client";

// components/admin/LessonRowActions.tsx — baris Pelajaran (Detail Kursus): naik/turun urutan (2x PUT /course-lessons/{id} menukar sort_order — tidak ada endpoint reorder massal), Ubah
// (LessonFormDialog), dan Hapus (DELETE /course-lessons/{id}).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LessonFormDialog } from "@/components/admin/LessonFormDialog";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { CourseLessonRow } from "@/lib/admin/course-data";
import { ApiClientError, api } from "@/lib/api-client";

export function LessonRowActions({ courseId, lesson, prev, next }: { courseId: string; lesson: CourseLessonRow; prev: CourseLessonRow | null; next: CourseLessonRow | null }) {
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
      <IconButton label="Naikkan urutan" disabled={busy || !prev} onClick={() => prev && void swap(prev)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M6 15l6-6 6 6" />
        </svg>
      </IconButton>
      <IconButton label="Turunkan urutan" disabled={busy || !next} onClick={() => next && void swap(next)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </IconButton>
      <LessonFormDialog courseId={courseId} lesson={lesson} nextSortOrder={0} trigger={(open) => <Button variant="secondary" size="sm" disabled={busy} onClick={open}>Ubah</Button>} />
      <IconButton label="Hapus pelajaran" disabled={busy} onClick={() => setDelOpen(true)}>
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
