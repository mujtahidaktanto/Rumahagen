"use client";

// components/admin/LearningSettingsView.tsx — Konfigurasi Belajar (M04, wireframe 02-Admin/M04-Konfigurasi-Belajar): baris tunggal learning_settings (migration 0150) lewat
// GET/PATCH /admin/learning/settings. 3 tab (Umum/Kuis & Kelulusan/Sertifikat & LP) berbagi SATU form — Simpan mengirim hanya field yang berubah (PATCH parsial), sesuai skema.
// Superadmin/Admin/Manager (m04.learning_economy_configuration.manage); role lain readOnly (tombol Simpan dan unggah disembunyikan, wireframe: "Anda hanya bisa melihat pengaturan belajar").
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Switch } from "@/components/ui/Switch";
import { CERT_TEMPLATE_LABEL, type CertTemplate } from "@/lib/admin/course-labels";
import type { LearningSettings } from "@/lib/admin/learning-settings-data";
import { summaryLine, validateLearningSettings, type LearningSettingsForm } from "@/lib/admin/learning-settings-rules";
import type { AuditLogRow } from "@/lib/admin/audit-data";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDateTime } from "@/lib/format";

type UploadTarget = { path: string; upload_url: string };
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 1_048_576;

async function putToSignedUrl(url: string, blob: Blob, type: string): Promise<void> {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": type }, body: blob });
  if (!res.ok) throw new Error("upload");
}

function formFrom(s: LearningSettings): LearningSettingsForm {
  return {
    batasAktif: s.externalQuizMaxAttempts !== null,
    maxAttempts: s.externalQuizMaxAttempts === null ? "" : String(s.externalQuizMaxAttempts),
    cooldownMinutes: String(s.externalQuizCooldownMinutes),
    autoIssue: s.certificateAutoIssue,
    template: s.defaultCertificateTemplate,
    signerName: s.defaultSignerName,
    signerTitle: s.defaultSignerTitle,
    signerSignaturePath: s.defaultSignerSignaturePath,
    signupBonusLp: String(s.signupBonusLp),
    rewardEnrollment: String(s.rewardLpEnrollment),
    rewardCompletion: String(s.rewardLpCompletion),
    rewardQuizPass: String(s.rewardLpQuizPass),
  };
}

function toPatchBody(v: LearningSettingsForm) {
  return {
    external_quiz_max_attempts: v.batasAktif ? Number(v.maxAttempts) : null,
    external_quiz_cooldown_minutes: Number(v.cooldownMinutes),
    certificate_auto_issue: v.autoIssue,
    default_certificate_template: v.template as CertTemplate,
    default_signer_name: v.signerName.trim(),
    default_signer_title: v.signerTitle.trim(),
    default_signer_signature_path: v.signerSignaturePath,
    signup_bonus_lp: Number(v.signupBonusLp),
    reward_lp_enrollment: Number(v.rewardEnrollment),
    reward_lp_completion: Number(v.rewardCompletion),
    reward_lp_quiz_pass: Number(v.rewardQuizPass),
  };
}

const TABS = [
  { key: "umum", label: "Umum" },
  { key: "kuis", label: "Kuis & Kelulusan" },
  { key: "sertifikat", label: "Sertifikat & LP" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

export function LearningSettingsView({ settings, history, readOnly }: { settings: LearningSettings; history: AuditLogRow[]; readOnly: boolean }) {
  const [tab, setTab] = useState<TabKey>("umum");
  const [v, setV] = useState<LearningSettingsForm>(formFrom(settings));
  const [signatureUrl, setSignatureUrl] = useState(settings.defaultSignerSignatureUrl);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const errors = tried ? validateLearningSettings(v) : {};

  function set<K extends keyof LearningSettingsForm>(k: K, val: LearningSettingsForm[K]) {
    setV((x) => ({ ...x, [k]: val }));
    setSaved(false);
    setDirty(true);
  }

  async function uploadSignature(file: File) {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) return setError("Format tidak didukung. Gunakan PNG, JPG, atau WebP.");
    if (file.size > MAX_BYTES) return setError("Ukuran file melebihi 1 MB. Perkecil gambar lalu coba lagi.");
    setSignatureUploading(true);
    try {
      const res = await api.post<UploadTarget>("/admin/learning/settings/signature/upload-url", { content_type: file.type }, { idempotency: true });
      await putToSignedUrl(res.data.upload_url, file, file.type);
      set("signerSignaturePath", res.data.path);
      setSignatureUrl(URL.createObjectURL(file));
    } catch {
      setError("Unggah gagal. Coba lagi.");
    } finally {
      setSignatureUploading(false);
    }
  }

  async function save() {
    setTried(true);
    const errs = validateLearningSettings(v);
    if (Object.keys(errs).length > 0) return;
    if (signatureUploading) return;
    setBusy(true);
    setError(null);
    try {
      await api.patch("/admin/learning/settings", toPatchBody(v), { idempotency: true });
      setSaved(true);
      setDirty(false);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    setV(formFrom(settings));
    setSignatureUrl(settings.defaultSignerSignatureUrl);
    setDirty(false);
    setSaved(false);
    setError(null);
    setTried(false);
  }

  const sum = summaryLine(v, CERT_TEMPLATE_LABEL[v.template as CertTemplate] ?? v.template);

  return (
    <div className="flex w-full flex-col pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Konfigurasi Belajar</h1>
          <p className="text-caption">Aturan kuis, sertifikat, dan poin belajar (M04) · Versi {settings.version}</p>
        </div>
      </div>

      {readOnly ? (
        <p className="mx-4 mb-2 text-body-md text-ink-500 lg:mx-8">Anda hanya bisa melihat pengaturan belajar. Mengubah membutuhkan izin kelola konfigurasi belajar.</p>
      ) : null}

      <div className="flex gap-6 overflow-x-auto border-b border-ink-100 px-4 lg:px-8">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`flex-none border-b-2 py-3.5 text-label-lg font-bold ${tab === t.key ? "border-blue-600 text-blue-600" : "border-transparent text-ink-300"}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5 p-4 lg:p-8">
        {tab === "umum" ? (
          <div className="flex max-w-xl flex-col gap-4">
            <p className="text-body-md text-ink-500">
              Berlaku untuk seluruh kursus. Kursus internal RumahAgen tanpa batas dan tanpa jeda kuis. Kursus mitra dan instruktur mengikuti aturan di tab Kuis &amp; Kelulusan. Template, penandatangan, dan
              logo mitra per kursus diatur di halaman Sertifikat kursus.
            </p>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Sertifikat terbit", sum.autoIssue],
                ["Bonus LP akun baru", sum.bonus],
                ["Template bawaan", sum.template],
                ["Aturan kuis mitra", sum.rule],
              ].map(([l, val]) => (
                <div key={l} className="rounded-sm border border-ink-100 p-3">
                  <dt className="text-caption">{l}</dt>
                  <dd className="text-body-md font-bold text-ink-900">{val}</dd>
                </div>
              ))}
            </dl>
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-2 text-label-lg">Cara kelulusan dan sertifikat bekerja</h2>
              <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-body-md text-ink-700">
                <li>Agent mendaftar ke kursus terbit. Kursus wajib punya minimal 1 kuis.</li>
                <li>Agent mengerjakan kuis. Kursus mitra dan instruktur kena jeda dan batas percobaan.</li>
                <li>Semua kuis lulus berarti kursus selesai. Nilai lulus diatur per kursus.</li>
                <li>Sertifikat terbit otomatis (nomor RA-tahun-urut), hadiah LP diberikan sekali, dan Agent bisa mengunduh PDF kapan saja.</li>
              </ol>
            </div>
            <div className="flex flex-col gap-2 rounded-md border border-ink-100 bg-white p-4">
              <h2 className="text-label-lg">Pengaturan terkait</h2>
              <Link href={"/admin/kursus" as Route} className="text-body-md text-blue-600">
                Kelola Kursus — buka kursus untuk mengatur penyelenggara, template, penandatangan, dan logo mitra per kursus (halaman Sertifikat kursus)
              </Link>
            </div>
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-2 text-label-lg">Riwayat perubahan</h2>
              {history.length === 0 ? (
                <p className="text-caption">Belum ada perubahan tercatat.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {history.map((h) => (
                    <li key={h.id} className="text-caption">
                      {formatDateTime(h.createdAt)} · {h.actor} · {h.changeSummary}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}

        {tab === "kuis" ? (
          <div className="flex max-w-xl flex-col gap-4">
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-1 text-label-lg">Kursus internal RumahAgen</h2>
              <p className="text-body-md text-ink-700">Penyelenggara: RumahAgen · Tanpa batas percobaan dan tanpa jeda antar percobaan. Aturan ini tetap dan tidak bisa diubah di sini.</p>
            </div>
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-2 text-label-lg">Kursus mitra dan instruktur</h2>
              <p className="mb-3 text-caption">Berlaku bila kursus tidak menimpa aturan ini sendiri.</p>
              <label className="mb-3 flex items-center gap-3">
                <Switch checked={v.batasAktif} disabled={readOnly} onChange={(n) => set("batasAktif", n)} aria-label="Batasi jumlah percobaan" />
                <span className="text-body-md">Batasi jumlah percobaan — mati berarti percobaan tidak dibatasi.</span>
              </label>
              {v.batasAktif ? (
                <Field label="Maksimal percobaan per kuis" hint="Angka 1–1.000. Setelah batas tercapai Agent tidak bisa mengulang." error={errors.maxAttempts}>
                  {(a) => <Input {...a} disabled={readOnly} value={v.maxAttempts} onChange={(e) => set("maxAttempts", e.target.value)} />}
                </Field>
              ) : null}
              <Field label="Jeda antar percobaan (menit)" hint="0 berarti tanpa jeda. Jeda hanya berlaku setelah percobaan gagal, maksimal 10.080 menit (7 hari)." error={errors.cooldownMinutes}>
                {(a) => <Input {...a} disabled={readOnly} value={v.cooldownMinutes} onChange={(e) => set("cooldownMinutes", e.target.value)} />}
              </Field>
            </div>
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-1 text-label-lg">Kelulusan</h2>
              <ul className="list-disc pl-5 text-body-md text-ink-700">
                <li>Kursus selesai bila semua kuisnya lulus.</li>
                <li>Nilai lulus (passing grade) diatur di Form Kursus, bukan di sini.</li>
                <li>Kursus tanpa kuis tidak bisa diajukan atau diterbitkan.</li>
              </ul>
            </div>
          </div>
        ) : null}

        {tab === "sertifikat" ? (
          <div className="flex max-w-xl flex-col gap-4">
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <label className="mb-3 flex items-center gap-3">
                <Switch checked={v.autoIssue} disabled={readOnly} onChange={(n) => set("autoIssue", n)} aria-label="Terbitkan otomatis saat kursus selesai" />
                <span className="text-body-md">Terbitkan otomatis saat kursus selesai — bila mati, sertifikat baru terbit saat Agent mengunduhnya dari riwayat kursus. Agent tetap bisa mengunduh kapan saja.</span>
              </label>
              <Field label="Template bawaan" hint="Kursus bisa memilih template lain di halaman Sertifikat kursus">
                {(a) => (
                  <Select {...a} disabled={readOnly} value={v.template} onChange={(e) => set("template", e.target.value)}>
                    {(Object.keys(CERT_TEMPLATE_LABEL) as CertTemplate[]).map((t) => (
                      <option key={t} value={t}>
                        {CERT_TEMPLATE_LABEL[t]}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-2 text-label-lg">Penandatangan bawaan</h2>
              <p className="mb-3 text-caption">Dipakai bila kursus tidak punya penandatangan sendiri.</p>
              <Field label="Nama penandatangan" required error={errors.signerName}>
                {(a) => <Input {...a} disabled={readOnly} value={v.signerName} onChange={(e) => set("signerName", e.target.value)} />}
              </Field>
              <Field label="Jabatan" required error={errors.signerTitle}>
                {(a) => <Input {...a} disabled={readOnly} value={v.signerTitle} onChange={(e) => set("signerTitle", e.target.value)} />}
              </Field>
              <div className="mt-2 flex flex-col gap-2">
                <span className="text-label-lg">Tanda tangan (opsional)</span>
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={signatureUrl} alt="Tanda tangan" className="h-16 w-40 rounded-sm border border-ink-100 bg-white object-contain" />
                ) : (
                  <p className="text-caption">Belum ada tanda tangan. PNG berlatar transparan disarankan agar menyatu di semua template. PNG, JPG, atau WebP, maksimal 1 MB.</p>
                )}
                {!readOnly ? (
                  <div className="flex gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center rounded-md border-[1.5px] border-ink-100 px-3 text-label-lg text-ink-700 hover:border-blue-500">
                      {signatureUploading ? "Mengunggah tanda tangan…" : signatureUrl ? "Ganti" : "Pilih file"}
                      <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={signatureUploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadSignature(f); }} />
                    </label>
                    {signatureUrl ? (
                      <Button variant="ghost" size="sm" onClick={() => { set("signerSignaturePath", null); setSignatureUrl(null); }}>
                        Hapus
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-md border border-ink-100 bg-white p-4">
              <h2 className="mb-1 text-label-lg">Poin belajar (LP)</h2>
              <p className="mb-3 text-caption">Diberikan sekali per kejadian, aman dari duplikasi. 0 berarti tidak memberi. Tidak berlaku surut untuk akun lama.</p>
              <Field label="Bonus akun baru (LP)" error={errors.signupBonusLp}>
                {(a) => <Input {...a} disabled={readOnly} value={v.signupBonusLp} onChange={(e) => set("signupBonusLp", e.target.value)} />}
              </Field>
              <Field label="Daftar ke kursus (LP)" error={errors.rewardEnrollment}>
                {(a) => <Input {...a} disabled={readOnly} value={v.rewardEnrollment} onChange={(e) => set("rewardEnrollment", e.target.value)} />}
              </Field>
              <Field label="Lulus satu kuis (LP)" error={errors.rewardQuizPass}>
                {(a) => <Input {...a} disabled={readOnly} value={v.rewardQuizPass} onChange={(e) => set("rewardQuizPass", e.target.value)} />}
              </Field>
              <Field label="Menyelesaikan kursus (LP)" error={errors.rewardCompletion}>
                {(a) => <Input {...a} disabled={readOnly} value={v.rewardCompletion} onChange={(e) => set("rewardCompletion", e.target.value)} />}
              </Field>
            </div>
          </div>
        ) : null}
      </div>

      {!readOnly && (dirty || saved || error) ? (
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-ink-100 bg-white/95 p-4 backdrop-blur lg:px-8">
          <div>
            {error ? (
              <p role="alert" className="text-body-md text-danger-600">
                {error}
              </p>
            ) : saved ? (
              <p role="status" className="text-body-md text-success-600">
                Tersimpan.
              </p>
            ) : tried && Object.keys(errors).length > 0 ? (
              <p role="alert" className="text-caption text-danger-600">
                Periksa isian bertanda merah sebelum menyimpan.
              </p>
            ) : (
              <p className="text-body-md text-ink-500">Ada perubahan yang belum disimpan.</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" disabled={busy} onClick={discard}>
              Batalkan
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan perubahan
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
