"use client";

// components/admin/QuizCreateDialog.tsx — "Buat Kuis" (Detail Kursus, tab Kuis): POST /courses/{courseId}/quizzes { title }. Soal/opsi ditambahkan di Editor Kuis terpisah setelah dibuat.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { ApiClientError, api } from "@/lib/api-client";

export function QuizCreateDialog({ courseId, trigger }: { courseId: string; trigger: (open: () => void) => React.ReactNode }) {
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
      setTitle("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(() => {
        setTitle("");
        setError(null);
        setOpen(true);
      })}
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
