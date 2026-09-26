"use client";

// components/admin/CertificateConfigView.tsx — Sertifikat Kursus (M04, wireframe M04-Sertifikat-Kursus): konfigurasi courses.{organizer_type,certificate_template,signer_*,
// partner_logo_paths,quiz_max_attempts,quiz_cooldown_minutes,awards_title_definition_id} (migration 0150/0155). PUT /courses/{id}/certificate-config adalah FULL REPLACE (semua field wajib
// dikirim kecuali awards_title_definition_id yang boleh diomit = tidak berubah). Staf-only (m04.course.publish) — trigger DB enforce_course_certificate_config_staff_only menolak 42501 untuk
// non-staf. Upload logo/tanda tangan lewat POST .../certificate-assets/upload-url (bucket privat, PNG/JPG/WebP maks 1 MB) lalu PUT langsung ke signed URL, path baru harus sudah ada di storage
// SEBELUM PUT config (certAssetExists) — makanya unggah terjadi seketika saat file dipilih, path barunya baru dipakai saat Simpan. Sengaja TANPA mockup grafis template (dekoratif, wireframe-only).
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import type { CourseCertificateConfig, LearningSettingsDefaults, LinkableTitleRow, OrganizerType } from "@/lib/admin/course-data";
import { CERT_TEMPLATE_LABEL, type CertTemplate } from "@/lib/admin/course-labels";
import { ApiClientError, api } from "@/lib/api-client";

type UploadTarget = { path: string; upload_url: string };

async function putToSignedUrl(url: string, blob: Blob, type: string): Promise<void> {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": type }, body: blob });
  if (!res.ok) throw new Error("upload");
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 1_048_576;

type FormState = {
  organizerType: OrganizerType;
  certificateTemplate: CertTemplate | null;
  signerDefault: boolean;
  signerName: string;
  signerTitle: string;
  signerSignaturePath: string | null;
  partnerLogoPaths: string[];
  ruleDefault: boolean;
  batas: boolean;
  quizMaxAttempts: string;
  quizCooldownMinutes: string;
  titleOn: boolean;
  awardsTitleDefinitionId: string | null;
};

function toForm(c: CourseCertificateConfig): FormState {
  return {
    organizerType: c.organizerType,
    certificateTemplate: c.certificateTemplate,
    signerDefault: !c.signerName && !c.signerTitle,
    signerName: c.signerName ?? "",
    signerTitle: c.signerTitle ?? "",
    signerSignaturePath: c.signerSignaturePath,
    partnerLogoPaths: c.partnerLogoPaths,
    ruleDefault: c.quizMaxAttempts === null && c.quizCooldownMinutes === null,
    batas: c.quizMaxAttempts !== null,
    quizMaxAttempts: c.quizMaxAttempts !== null ? String(c.quizMaxAttempts) : "",
    quizCooldownMinutes: c.quizCooldownMinutes !== null ? String(c.quizCooldownMinutes) : "60",
    titleOn: !!c.awardsTitleDefinitionId,
    awardsTitleDefinitionId: c.awardsTitleDefinitionId,
  };
}

export function CertificateConfigView({
  courseId,
  courseTitle,
  config,
  defaults,
  titles,
}: {
  courseId: string;
  courseTitle: string;
  config: CourseCertificateConfig;
  defaults: LearningSettingsDefaults | null;
  titles: LinkableTitleRow[];
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(toForm(config));
  const [v, setV] = useState(saved);
  const [urls, setUrls] = useState({ signature: config.signerSignatureUrl, logos: config.partnerLogoUrls });
  const [uploading, setUploading] = useState<"signature" | "logo0" | "logo1" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);
  const sigInput = useRef<HTMLInputElement>(null);
  const logoInput0 = useRef<HTMLInputElement>(null);
  const logoInput1 = useRef<HTMLInputElement>(null);

  const set = <K extends keyof FormState>(k: K, val: FormState[K]) => setV((cur) => ({ ...cur, [k]: val }));
  const dirty = JSON.stringify(v) !== JSON.stringify(saved);

  function problems(cur: FormState): Record<string, string> {
    const p: Record<string, string> = {};
    if (cur.organizerType !== "rumahagen" && !cur.ruleDefault) {
      const cd = cur.quizCooldownMinutes.trim();
      if (!/^\d+$/.test(cd) || Number(cd) > 10080) p.cooldown = "Isi angka bulat 0–10.080 (menit).";
      if (cur.batas) {
        const mx = cur.quizMaxAttempts.trim();
        if (!/^\d+$/.test(mx) || Number(mx) < 1 || Number(mx) > 1000) p.maxAttempts = "Isi angka bulat 1–1.000.";
      }
    }
    if (!cur.signerDefault) {
      if (!cur.signerName.trim()) p.signerName = "Nama penandatangan wajib diisi.";
      if (!cur.signerTitle.trim()) p.signerTitle = "Jabatan penandatangan wajib diisi.";
    }
    if (cur.titleOn && !cur.awardsTitleDefinitionId) p.title = "Pilih satu title, atau matikan pemberian title.";
    return p;
  }

  const errs = tried ? problems(v) : {};

  async function upload(kind: "signature" | "logo", slot: "signature" | "logo0" | "logo1", file: File) {
    setUploadError(null);
    if (!ALLOWED_TYPES.includes(file.type)) return setUploadError("Format tidak didukung. Gunakan PNG, JPG, atau WebP.");
    if (file.size > MAX_BYTES) return setUploadError("Ukuran file melebihi 1 MB. Perkecil gambar lalu coba lagi.");
    setUploading(slot);
    try {
      const res = await api.post<UploadTarget>(`/courses/${courseId}/certificate-assets/upload-url`, { kind, content_type: file.type }, { idempotency: true });
      await putToSignedUrl(res.data.upload_url, file, file.type);
      const previewUrl = URL.createObjectURL(file);
      if (slot === "signature") {
        set("signerSignaturePath", res.data.path);
        setUrls((u) => ({ ...u, signature: previewUrl }));
      } else {
        const i = slot === "logo0" ? 0 : 1;
        const paths = v.partnerLogoPaths.slice();
        paths[i] = res.data.path;
        set("partnerLogoPaths", paths);
        setUrls((u) => {
          const logos = u.logos.slice();
          logos[i] = previewUrl;
          return { ...u, logos };
        });
      }
    } catch {
      setUploadError("Unggah gagal. Coba lagi.");
    } finally {
      setUploading(null);
    }
  }

  function removeSignature() {
    set("signerSignaturePath", null);
    setUrls((u) => ({ ...u, signature: null }));
  }

  function removeLogo(i: number) {
    const paths = v.partnerLogoPaths.filter((_, idx) => idx !== i);
    set("partnerLogoPaths", paths);
    setUrls((u) => ({ ...u, logos: u.logos.filter((_, idx) => idx !== i) }));
  }

  async function save() {
    const p = problems(v);
    if (Object.keys(p).length > 0) return setTried(true);
    setBusy(true);
    setError(null);
    try {
      await api.put(
        `/courses/${courseId}/certificate-config`,
        {
          organizer_type: v.organizerType,
          certificate_template: v.certificateTemplate,
          signer_name: v.signerDefault ? null : v.signerName.trim(),
          signer_title: v.signerDefault ? null : v.signerTitle.trim(),
          signer_signature_path: v.signerDefault ? null : v.signerSignaturePath,
          partner_logo_paths: v.partnerLogoPaths,
          quiz_max_attempts: v.organizerType === "rumahagen" || v.ruleDefault || !v.batas ? null : Number(v.quizMaxAttempts),
          quiz_cooldown_minutes: v.organizerType === "rumahagen" || v.ruleDefault ? null : Number(v.quizCooldownMinutes),
          awards_title_definition_id: v.titleOn ? v.awardsTitleDefinitionId : null,
        },
        { idempotency: true },
      );
      setSaved(v);
      setTried(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Gagal menyimpan. Tidak ada yang berubah; coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  function discard() {
    setV(saved);
    setUrls({ signature: config.signerSignatureUrl, logos: config.partnerLogoUrls });
    setError(null);
    setTried(false);
  }

  const internal = v.organizerType === "rumahagen";

  return (
    <div className="flex w-full flex-col pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 lg:px-8 lg:pt-8">
        <div>
          <h1 className="text-headline">Sertifikat Kursus</h1>
          <p className="text-caption">{courseTitle} — Penyelenggara, template, penandatangan, dan logo mitra</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 lg:p-8">
        {uploadError ? <p className="text-body-md text-danger-600">{uploadError}</p> : null}

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <span className="text-title-md">Penyelenggara kursus</span>
          <p className="text-caption">Menentukan aturan jeda dan batas kuis.</p>
          <div className="grid grid-cols-3 gap-2.5">
            {([
              ["rumahagen", "RumahAgen (internal)", "Tanpa batas dan tanpa jeda kuis"],
              ["partner", "Mitra", "Jeda dan batas kuis berlaku"],
              ["instructor", "Instruktur", "Jeda dan batas kuis berlaku"],
            ] as const).map(([val, label, hint]) => (
              <button
                key={val}
                type="button"
                role="radio"
                aria-checked={v.organizerType === val}
                onClick={() => set("organizerType", val)}
                className={`flex flex-col gap-0.5 rounded-md border-[1.5px] p-3 text-left ${v.organizerType === val ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
              >
                <span className="text-label-lg">{label}</span>
                <span className="text-caption">{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {internal ? (
          <div className="rounded-md border border-ink-100 bg-white p-5 text-body-md">
            Kursus internal RumahAgen tanpa batas percobaan dan tanpa jeda. Pilih penyelenggara Mitra atau Instruktur bila kursus perlu jeda.
          </div>
        ) : (
          <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
            <span className="text-title-md">Aturan kuis</span>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-label-lg">Ikuti pengaturan global</span>
                <span className="text-caption">
                  Global saat ini: {defaults?.externalQuizMaxAttempts ? `maksimal ${defaults.externalQuizMaxAttempts} percobaan` : "tanpa batas percobaan"}, jeda{" "}
                  {defaults?.externalQuizCooldownMinutes ?? 60} menit.
                </span>
              </div>
              <Switch checked={v.ruleDefault} onChange={(val) => set("ruleDefault", val)} label="Ikuti pengaturan global" />
            </div>
            {!v.ruleDefault ? (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-label-lg">Batasi jumlah percobaan</span>
                    <span className="text-caption">Mati berarti percobaan tidak dibatasi.</span>
                  </div>
                  <Switch checked={v.batas} onChange={(val) => set("batas", val)} label="Batasi jumlah percobaan" />
                </div>
                {v.batas ? (
                  <Field label="Maksimal percobaan per kuis" required error={errs.maxAttempts}>
                    {(a) => <Input {...a} inputMode="numeric" value={v.quizMaxAttempts} onChange={(e) => set("quizMaxAttempts", e.target.value)} />}
                  </Field>
                ) : null}
                <Field label="Jeda antar percobaan (menit)" required error={errs.cooldown} hint="0 berarti tanpa jeda. Maksimal 10.080 menit.">
                  {(a) => <Input {...a} inputMode="numeric" value={v.quizCooldownMinutes} onChange={(e) => set("quizCooldownMinutes", e.target.value)} />}
                </Field>
              </>
            ) : null}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <span className="text-title-md">Title setelah lulus</span>
          <p className="text-caption">Title (M15) yang diberikan otomatis kepada Agent yang menyelesaikan kursus ini.</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-label-lg">Beri title saat lulus</span>
            <Switch checked={v.titleOn} onChange={(val) => set("titleOn", val)} label="Beri title saat lulus" />
          </div>
          {v.titleOn ? (
            titles.length === 0 ? (
              <p className="text-body-md text-ink-500">Belum ada title aktif yang punya cakupan otoritas. Buat atau aktifkan title di Jalur Penghargaan terlebih dulu.</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {titles.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="radio"
                    aria-checked={v.awardsTitleDefinitionId === t.id}
                    onClick={() => set("awardsTitleDefinitionId", t.id)}
                    className={`flex flex-col gap-0.5 rounded-md border-[1.5px] p-3 text-left ${v.awardsTitleDefinitionId === t.id ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
                  >
                    <span className="text-label-lg">{t.name}</span>
                    {t.description ? <span className="text-caption">{t.description}</span> : null}
                  </button>
                ))}
                {errs.title ? <span className="text-caption text-danger-600">{errs.title}</span> : null}
              </div>
            )
          ) : null}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <span className="text-title-md">Template sertifikat</span>
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              role="radio"
              aria-checked={v.certificateTemplate === null}
              onClick={() => set("certificateTemplate", null)}
              className={`rounded-md border-[1.5px] p-3 text-left text-label-lg ${v.certificateTemplate === null ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
            >
              Ikuti template bawaan{defaults ? ` (${CERT_TEMPLATE_LABEL[defaults.defaultCertificateTemplate]})` : ""}
            </button>
            {(Object.keys(CERT_TEMPLATE_LABEL) as CertTemplate[]).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={v.certificateTemplate === t}
                onClick={() => set("certificateTemplate", t)}
                className={`rounded-md border-[1.5px] p-3 text-left text-label-lg ${v.certificateTemplate === t ? "border-blue-600 bg-blue-50" : "border-ink-100"}`}
              >
                {CERT_TEMPLATE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <span className="text-title-md">Penandatangan</span>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-label-lg">Ikuti penandatangan bawaan</span>
              <span className="text-caption">
                Bawaan: {defaults?.defaultSignerName ?? "—"}, {defaults?.defaultSignerTitle ?? "—"}.
              </span>
            </div>
            <Switch checked={v.signerDefault} onChange={(val) => set("signerDefault", val)} label="Ikuti penandatangan bawaan" />
          </div>
          {!v.signerDefault ? (
            <>
              <Field label="Nama penandatangan" required error={errs.signerName}>
                {(a) => <Input {...a} maxLength={120} value={v.signerName} onChange={(e) => set("signerName", e.target.value)} />}
              </Field>
              <Field label="Jabatan" required error={errs.signerTitle}>
                {(a) => <Input {...a} maxLength={120} value={v.signerTitle} onChange={(e) => set("signerTitle", e.target.value)} />}
              </Field>
              <AssetSlot
                label="Tanda tangan (opsional)"
                url={urls.signature}
                uploading={uploading === "signature"}
                inputRef={sigInput}
                onPick={(f) => void upload("signature", "signature", f)}
                onRemove={removeSignature}
              />
            </>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
          <span className="text-title-md">Logo mitra</span>
          <p className="text-caption">Logo RumahAgen selalu tampil. Tambahkan maksimal 2 logo mitra atau instruktur di sebelahnya.</p>
          {[0, 1].map((i) => (
            <AssetSlot
              key={i}
              label={`Logo mitra ${i + 1}`}
              url={urls.logos[i] ?? null}
              uploading={uploading === (i === 0 ? "logo0" : "logo1")}
              inputRef={i === 0 ? logoInput0 : logoInput1}
              onPick={(f) => void upload("logo", i === 0 ? "logo0" : "logo1", f)}
              onRemove={() => removeLogo(i)}
            />
          ))}
        </div>

        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </div>

      {dirty ? (
        <div className="fixed inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t border-ink-100 bg-white p-4 lg:px-8">
          <span className="text-body-md text-ink-700">Ada perubahan yang belum disimpan.</span>
          <div className="flex gap-2.5">
            <Button variant="secondary" disabled={busy} onClick={discard}>
              Batalkan
            </Button>
            <Button loading={busy} disabled={uploading !== null} onClick={() => void save()}>
              Simpan perubahan
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 flex-none rounded-pill border-none p-0 ${checked ? "bg-blue-600" : "bg-ink-200"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

function AssetSlot({
  label,
  url,
  uploading,
  inputRef,
  onPick,
  onRemove,
}: {
  label: string;
  url: string | null;
  uploading: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
  onPick: (f: File) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-label-lg">{label}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (inputRef.current) inputRef.current.value = "";
          if (f) onPick(f);
        }}
      />
      <div className="flex items-center gap-3 rounded-md border border-dashed border-ink-100 p-3">
        {uploading ? (
          <span className="text-body-md text-ink-700">Mengunggah…</span>
        ) : url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-12 w-20 flex-none rounded-sm bg-ink-50 object-contain" />
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              Ganti
            </Button>
            <Button variant="ghost" size="sm" className="text-danger-600" onClick={onRemove}>
              Hapus
            </Button>
          </>
        ) : (
          <>
            <span className="text-caption text-ink-500">PNG, JPG, atau WebP, maksimal 1 MB</span>
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              Pilih file
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
