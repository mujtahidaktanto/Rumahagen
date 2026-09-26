"use client";

// components/admin/CourseStatusActions.tsx — tombol status Detail Kursus, staf (Superadmin/Admin/Manager, m04.course.publish). Trigger DB enforce_course_status_workflow membolehkan staf
// transisi status APA SAJA (bypass daftar transisi non-staf) — tapi "Tolak" HARUS lewat POST /courses/{id}/review (satu-satunya jalur yang mengirim review_note; PATCH /status pending_review->
// draft oleh bukan pemilik gagal 409 karena review_note tidak pernah dikirim di sana). "Terbitkan"/"Setujui & Terbitkan" dimatikan bila course belum siap (enforce_course_quizzes_ready_on_publish:
// minimal 1 pelajaran DAN minimal 1 kuis yang semuanya siap — LEBIH ketat dari draft wireframe yang menganggap 0 kuis = siap; sudah dikoreksi di sini, lihat audit/FRONTEND_GAPS.md).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea } from "@/components/ui/Field";
import type { CourseStatus } from "@/lib/admin/course-data";
import { ApiClientError, api } from "@/lib/api-client";

type Action = { targetStatus: CourseStatus; label: string; primary: boolean; needsReady: boolean };

const ACTIONS: Record<CourseStatus, Action[]> = {
  draft: [
    { targetStatus: "published", label: "Terbitkan", primary: true, needsReady: true },
    { targetStatus: "archived", label: "Arsipkan", primary: false, needsReady: false },
  ],
  pending_review: [],
  published: [
    { targetStatus: "archived", label: "Arsipkan", primary: false, needsReady: false },
    { targetStatus: "draft", label: "Kembalikan ke Draf", primary: false, needsReady: false },
  ],
  archived: [
    { targetStatus: "draft", label: "Kembalikan ke Draf", primary: true, needsReady: false },
    { targetStatus: "published", label: "Terbitkan Lagi", primary: false, needsReady: true },
  ],
};

export function CourseStatusActions({ courseId, status, ready }: { courseId: string; status: CourseStatus; ready: boolean }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"status" | "reject" | null>(null);
  const [target, setTarget] = useState<Action | null>(null);
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setDialog(null);
    setError(null);
    setTried(false);
  }

  async function confirmStatus() {
    if (!target) return;
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/courses/${courseId}/status`, { status: target.targetStatus }, { idempotency: true });
      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil diterapkan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/courses/${courseId}/review`, { decision: "approve" }, { idempotency: true });
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disetujui. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmReject() {
    if (!note.trim()) {
      setTried(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/courses/${courseId}/review`, { decision: "reject", note: note.trim() }, { idempotency: true });
      close();
      setNote("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil ditolak. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "pending_review") {
    return (
      <div className="flex flex-wrap gap-2.5">
        <Button size="sm" loading={busy} disabled={!ready} onClick={() => void approve()}>
          Setujui &amp; Terbitkan
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => {
            setNote("");
            setDialog("reject");
          }}
        >
          Tolak…
        </Button>
        {error ? (
          <p role="alert" className="w-full text-body-md text-danger-600">
            {error}
          </p>
        ) : null}

        <Dialog
          open={dialog === "reject"}
          onClose={() => (busy ? undefined : close())}
          title="Tolak pengajuan?"
          description="Kursus dikembalikan ke Draf dan pemilik diberi tahu beserta catatan Anda."
          footer={
            <>
              <Button variant="secondary" disabled={busy} onClick={close}>
                Batal
              </Button>
              <Button loading={busy} onClick={() => void confirmReject()}>
                Kembalikan ke Draf
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3.5">
            <Field label="Catatan untuk pemilik" required error={tried && !note.trim() ? "Catatan wajib diisi saat menolak." : undefined}>
              {(a) => <Textarea {...a} rows={4} value={note} onChange={(e) => setNote(e.target.value)} />}
            </Field>
            {error ? (
              <p role="alert" className="text-body-md text-danger-600">
                {error}
              </p>
            ) : null}
          </div>
        </Dialog>
      </div>
    );
  }

  const actions = ACTIONS[status];
  return (
    <div className="flex flex-wrap gap-2.5">
      {actions.map((a) => (
        <Button
          key={a.targetStatus}
          variant={a.primary ? "primary" : "secondary"}
          size="sm"
          disabled={a.needsReady && !ready}
          onClick={() => {
            setTarget(a);
            setDialog("status");
          }}
        >
          {a.label}
        </Button>
      ))}
      {error ? (
        <p role="alert" className="w-full text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <Dialog
        open={dialog === "status"}
        onClose={() => (busy ? undefined : close())}
        title={`${target?.label ?? ""}?`}
        description={target?.targetStatus === "published" ? "Kursus tampil di katalog publik dan peserta bisa mendaftar. Pemilik diberi tahu." : "Status kursus berubah dan tampilan di katalog mengikuti status baru."}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={close}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void confirmStatus()}>
              Lanjutkan
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
