"use client";

// components/agent/KtpCard.tsx — kartu Verifikasi KTP di Profil Saya (M02, wireframe 01-Agent/M02-Profil-Saya). Alur (keputusan produk 2026-09-25: langsung terverifikasi tanpa tinjauan staf):
// (1) POST /agents/me/ktp/upload-url -> (2) PUT foto ke upload_url bertanda tangan -> (3) PUT /agents/me/ktp { ktp_number, photo_path }. Foto dan nomor KTP privat; setelah terverifikasi
// hanya nomor tersamar yang tampil. NIK ganda -> 409; kode wilayah/tanggal lahir NIK diperiksa database (galat validasi dari server ditampilkan apa adanya).
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { DocIcon, LockIcon } from "@/components/ui/icons";
import { ApiClientError, api } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { KTP_ACCEPT, cleanNikInput, formatFileSize, isNikShape, ktpFileProblem } from "@/lib/validation/profile-form";

type Props = { state: "deferred" | "submitted" | "verified"; maskedNik: string | null; submittedAt: string | null; profileExists: boolean };
type UploadTarget = { path: string; upload_url: string };

export function KtpCard({ state, maskedNik, submittedAt, profileExists }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [nik, setNik] = useState("");
  const [nikError, setNikError] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "upload" | "verify">("idle");
  const [error, setError] = useState<string | null>(null);

  const verified = state === "verified" && !replacing;
  const busy = step !== "idle";
  const canSubmit = profileExists && !!file && isNikShape(nik) && !busy;

  function onPick(files: FileList | null) {
    const f = files?.[0] ?? null;
    setError(null);
    if (!f) return;
    const problem = ktpFileProblem(f);
    setFileError(problem);
    setFile(problem ? null : f);
  }

  async function submit() {
    if (!file || !isNikShape(nik)) return;
    setError(null);
    setNikError(null);
    try {
      setStep("upload");
      const target = await api.post<UploadTarget & { content_type: string }>("/agents/me/ktp/upload-url", { content_type: file.type, size_bytes: file.size }, { idempotency: true });
      const put = await fetch(target.data.upload_url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("upload");
      setStep("verify");
      await api.put("/agents/me/ktp", { ktp_number: nik, photo_path: target.data.path }, { idempotency: true });
      setFile(null);
      setNik("");
      setReplacing(false);
      setStep("idle");
      router.refresh();
    } catch (err) {
      setStep("idle");
      if (err instanceof ApiClientError && err.code === "CONFLICT") setNikError(err.message);
      else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") setNikError(err.message);
      else if (err instanceof ApiClientError) setError(err.message);
      else setError("Unggah foto KTP gagal. Periksa koneksi Anda lalu coba lagi.");
    }
  }

  return (
    <section aria-labelledby="ktp-title" className="flex flex-col gap-4 rounded-md border border-ink-100 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="ktp-title" className="text-title-md">
          Verifikasi KTP
        </h2>
        {state === "verified" ? <Badge tone="success">Terverifikasi</Badge> : <Badge tone="neutral">Belum diverifikasi</Badge>}
      </div>

      <div className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-info-100 p-3.5 text-body-md text-ink-900">
        <LockIcon size={16} className="mt-1 flex-none text-info-600" />
        <p>
          Foto dan nomor KTP <strong>bersifat privat</strong>: hanya Anda dan tim RumahAgen yang dapat melihatnya, dan tidak pernah tampil di profil publik. Setelah keduanya terkirim, akun langsung{" "}
          <strong>terverifikasi</strong> dan lencana “Terverifikasi” muncul di profil publik Anda.
        </p>
      </div>

      {verified ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink-100 p-4">
          <div className="min-w-0">
            <p className="font-mono text-title-md tracking-wide">{maskedNik ?? "—"}</p>
            <p className="text-caption">Terverifikasi{submittedAt ? ` ${formatDate(submittedAt)}` : ""} · foto KTP tersimpan aman</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setReplacing(true)}>
            Ganti Data KTP
          </Button>
        </div>
      ) : (
        <>
          {!profileExists ? (
            <p role="status" className="rounded-md bg-ink-50 p-3 text-body-md text-ink-500">
              Simpan profil Anda lebih dulu (nama dan nomor WhatsApp), lalu verifikasi KTP bisa dilakukan.
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3 text-body-md text-danger-600">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <span className="text-label-lg">
              Foto KTP <span className="text-danger-600">*</span>
            </span>
            <input ref={fileRef} type="file" accept={KTP_ACCEPT.join(",")} className="sr-only" tabIndex={-1} aria-label="Pilih foto KTP" onChange={(e) => onPick(e.target.files)} />
            {file ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-ink-100 p-3.5">
                <div className="flex min-w-0 items-center gap-3">
                  <DocIcon size={20} className="flex-none text-ink-500" />
                  <div className="min-w-0">
                    <p className="truncate text-label-lg">{file.name}</p>
                    <p className="text-caption">{formatFileSize(file.size)} · siap dikirim</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
                  Ganti
                </Button>
              </div>
            ) : (
              <div className={`flex flex-col items-center gap-2 rounded-md border-[1.5px] border-dashed p-6 text-center ${fileError ? "border-danger-600 bg-danger-100" : "border-ink-200 bg-ink-50"}`}>
                <DocIcon size={26} className="text-ink-300" />
                <p className="text-body-md text-ink-900">Unggah foto atau gambar KTP Anda</p>
                <Button variant="secondary" size="sm" disabled={!profileExists} onClick={() => fileRef.current?.click()}>
                  Pilih File
                </Button>
                <p className="text-caption">JPG, PNG, atau WebP · maks 5 MB · seluruh bagian KTP harus terlihat jelas</p>
              </div>
            )}
            {fileError ? (
              <p role="alert" className="text-caption text-danger-600">
                {fileError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nik" className="text-label-lg">
              Nomor KTP (NIK) <span className="text-danger-600">*</span>
            </label>
            <Input
              id="nik"
              inputMode="numeric"
              autoComplete="off"
              maxLength={16}
              placeholder="16 digit angka"
              value={nik}
              disabled={!profileExists || busy}
              aria-invalid={nikError ? true : undefined}
              aria-describedby="nik-hint"
              onChange={(e) => {
                setNik(cleanNikInput(e.target.value));
                setNikError(null);
              }}
            />
            {nikError ? (
              <p role="alert" className="text-caption text-danger-600">
                {nikError}
              </p>
            ) : null}
            <p id="nik-hint" className="text-caption">
              Isi manual sesuai KTP (16 digit angka). Satu nomor KTP hanya bisa dipakai oleh satu akun.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button loading={busy} disabled={!canSubmit} onClick={submit}>
              {step === "upload" ? "Mengunggah foto…" : step === "verify" ? "Memverifikasi…" : "Verifikasi Sekarang"}
            </Button>
            {replacing ? (
              <Button variant="ghost" disabled={busy} onClick={() => setReplacing(false)}>
                Batal
              </Button>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}
