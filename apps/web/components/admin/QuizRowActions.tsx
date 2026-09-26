"use client";

// components/admin/QuizRowActions.tsx — baris Kuis (Detail Kursus): "Buka Editor" (link ke /admin/kursus/{courseId}/kuis/{quizId}) dan Hapus (DELETE /quizzes/{id} — trigger enforce_quiz_integrity
// menolak 409 bila sudah pernah dikerjakan peserta, tombol dimatikan lebih dulu di sini berdasar hasAttempts).
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Button, IconButton, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import type { CourseQuizRow } from "@/lib/admin/course-data";
import { ApiClientError, api } from "@/lib/api-client";

export function QuizRowActions({ courseId, quiz }: { courseId: string; quiz: CourseQuizRow }) {
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
      <LinkButton href={`/admin/kursus/${courseId}/kuis/${quiz.id}` as Route} variant="secondary" size="sm">
        Buka Editor
      </LinkButton>
      <IconButton label="Hapus kuis" disabled={busy || quiz.hasAttempts} onClick={() => setDelOpen(true)}>
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
