"use client";

// components/admin/ActivityFormDialog.tsx — Aktivitas Baru/Edit (Ekonomi Pembelajaran, tab Katalog Aktivitas): POST /admin/learning/activities (create) atau PUT /admin/learning/activities/{id}
// (edit). learning_activities (0058) — kode tidak diminta ulang saat edit (updateLearningActivitySchema tidak menerima learning_path_version_id, code tetap bisa diubah).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import type { LearningActivityRow } from "@/lib/admin/learning-economy-data";
import { ApiClientError, api } from "@/lib/api-client";

export function ActivityFormDialog({ activity, trigger }: { activity?: LearningActivityRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!activity;
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState(activity?.code ?? "");
  const [title, setTitle] = useState(activity?.title ?? "");
  const [activityType, setActivityType] = useState(activity?.activityType ?? "");
  const [sequenceNo, setSequenceNo] = useState(activity ? String(activity.sequenceNo ?? 1) : "1");
  const [rewardLp, setRewardLp] = useState(activity ? String(activity.rewardLp) : "0");
  const [completionRequired, setCompletionRequired] = useState(activity?.completionRequired ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setCode(activity?.code ?? "");
    setTitle(activity?.title ?? "");
    setActivityType(activity?.activityType ?? "");
    setSequenceNo(activity ? String(activity.sequenceNo ?? 1) : "1");
    setRewardLp(activity ? String(activity.rewardLp) : "0");
    setCompletionRequired(activity?.completionRequired ?? true);
    setError(null);
    setOpen(true);
  }

  const canSave = code.trim().length > 0 && title.trim().length > 0 && activityType.trim().length > 0;

  async function save() {
    setBusy(true);
    setError(null);
    const body = {
      code: code.trim(),
      title: title.trim(),
      activity_type: activityType.trim(),
      sequence_no: Number(sequenceNo) || undefined,
      reward_lp: Number(rewardLp) || 0,
      completion_required: completionRequired,
    };
    try {
      if (isEdit) {
        await api.put(`/admin/learning/activities/${activity.id}`, body, { idempotency: true });
      } else {
        await api.post("/admin/learning/activities", body, { idempotency: true });
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
        title={isEdit ? `Edit — ${activity.title}` : "Aktivitas Baru"}
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
          <Field label="Kode" required>
            {(a) => <Input {...a} className="font-mono" value={code} onChange={(e) => setCode(e.target.value)} placeholder="mis. ACT-101" />}
          </Field>
          <Field label="Judul" required>
            {(a) => <Input {...a} value={title} onChange={(e) => setTitle(e.target.value)} />}
          </Field>
          <Field label="Tipe aktivitas" required>
            {(a) => <Input {...a} value={activityType} onChange={(e) => setActivityType(e.target.value)} placeholder="mis. video, quiz, reading" />}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Urutan">{(a) => <Input {...a} type="number" min={1} value={sequenceNo} onChange={(e) => setSequenceNo(e.target.value)} />}</Field>
            <Field label="Reward LP">{(a) => <Input {...a} type="number" min={0} value={rewardLp} onChange={(e) => setRewardLp(e.target.value)} />}</Field>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={completionRequired} onChange={(e) => setCompletionRequired(e.target.checked)} />
            <span className="text-body-md">Wajib diselesaikan (completion_required)</span>
          </label>
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
