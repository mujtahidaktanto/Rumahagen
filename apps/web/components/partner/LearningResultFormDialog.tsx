"use client";

// components/partner/LearningResultFormDialog.tsx — Catat/Ubah Hasil Kemitraan (M04): POST/PUT /partnership-learning-results(/{id}). Dialog merender TOMBOL PEMICUNYA SENDIRI
// (bukan menerima trigger lewat prop) supaya View pemanggil boleh tetap Server Component — pelajaran dari bug staging 2026-09-30 (lihat SystemConfigView.tsx / feedback
// memory) di mana Server Component yang meneruskan fungsi ke Client Component crash di runtime. validation_status TIDAK ada di form ini sama sekali — hanya Superadmin yang
// boleh mengubahnya (trigger trg_partnership_result_validation_superadmin_only, migration 0024); hasil baru selalu lahir "Menunggu Validasi".
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Textarea } from "@/components/ui/Field";
import type { LearningResultRow } from "@/lib/partner/learning-results-data";
import { toLearningResultPayload, validateLearningResultForm, type LearningResultForm } from "@/lib/partner/learning-results-rules";
import { ApiClientError, api } from "@/lib/api-client";

function formFrom(r?: LearningResultRow): LearningResultForm {
  return {
    resultType: r?.resultType ?? "",
    resultSummary: r?.resultSummary ?? "",
    provenanceSource: r?.provenanceSource ?? "",
    provenanceReference: r?.provenanceReference ?? "",
    sessionId: r?.sessionId ?? "",
    resultPayload: r && Object.keys(r.resultPayload).length > 0 ? JSON.stringify(r.resultPayload, null, 2) : "",
  };
}

export function LearningResultFormDialog({ result }: { result?: LearningResultRow }) {
  const router = useRouter();
  const isEdit = !!result;
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<LearningResultForm>(formFrom(result));
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errors = tried ? validateLearningResultForm(f) : {};

  function openDialog() {
    setF(formFrom(result));
    setTried(false);
    setError(null);
    setOpen(true);
  }

  async function save() {
    setTried(true);
    const errs = validateLearningResultForm(f);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/partnership-learning-results/${result.id}`, toLearningResultPayload(f), { idempotency: true });
      } else {
        await api.post("/partnership-learning-results", toLearningResultPayload(f), { idempotency: true });
      }
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal disimpan. Data Anda masih di form; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant={isEdit ? "secondary" : "primary"} size={isEdit ? "sm" : "md"} onClick={openDialog}>
        {isEdit ? "Ubah" : "+ Catat Hasil"}
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={isEdit ? `Ubah — ${result?.resultType}` : "Catat Hasil Kemitraan"}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Jenis hasil" required error={errors.resultType}>
            {(a) => <Input {...a} value={f.resultType} onChange={(e) => setF((x) => ({ ...x, resultType: e.target.value }))} maxLength={100} placeholder="Contoh: Pelatihan Produk, Workshop Pemasaran" />}
          </Field>
          <Field label="Ringkasan" hint="Opsional.">
            {(a) => <Textarea {...a} rows={3} value={f.resultSummary} onChange={(e) => setF((x) => ({ ...x, resultSummary: e.target.value }))} />}
          </Field>
          <Field label="Asal data" required error={errors.provenanceSource} hint="Dari mana hasil ini berasal, mis. Zoom, absensi manual, laporan tim.">
            {(a) => <Input {...a} value={f.provenanceSource} onChange={(e) => setF((x) => ({ ...x, provenanceSource: e.target.value }))} maxLength={150} />}
          </Field>
          <Field label="Referensi asal data" required error={errors.provenanceReference} hint="Agar hasil bisa ditelusuri, mis. tautan rekaman atau nomor laporan.">
            {(a) => <Input {...a} value={f.provenanceReference} onChange={(e) => setF((x) => ({ ...x, provenanceReference: e.target.value }))} />}
          </Field>
          <Field label="ID Sesi pembelajaran terkait" hint="Opsional. Tempel ID sesi bila tim RumahAgen memberikannya — tidak ada daftar pilihan di sini." error={errors.sessionId}>
            {(a) => <Input {...a} className="font-mono" value={f.sessionId} onChange={(e) => setF((x) => ({ ...x, sessionId: e.target.value }))} placeholder="uuid sesi (opsional)" />}
          </Field>
          <Field label="Data tambahan (JSON)" hint='Opsional. Contoh: {"peserta": 20, "durasi_menit": 90}' error={errors.resultPayload}>
            {(a) => <Textarea {...a} rows={3} className="font-mono text-[13px]" value={f.resultPayload} onChange={(e) => setF((x) => ({ ...x, resultPayload: e.target.value }))} />}
          </Field>
          <p className="text-caption">Hasil baru selalu berstatus Menunggu Validasi. Validasi dilakukan tim RumahAgen dan tidak bisa diubah dari sini.</p>
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
