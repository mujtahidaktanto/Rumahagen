"use client";

// app/(auth)/lupa-password/RecoveryFlow.tsx — Pemulihan kata sandi (M01-Recovery): minta link -> "cek email" -> (dari link email) kata sandi baru -> berhasil / link tidak berlaku.
// Tahap `reset` hanya dirender halaman server bila sesi recovery sudah dipasang /api/auth/callback; tanpa sesi -> tahap `expired`.
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { AlertIcon, CheckCircleIcon, LockIcon, MailIcon } from "@/components/ui/icons";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormAlert, StatusPanel } from "@/components/auth/StatusPanel";
import { api, ApiClientError } from "@/lib/api-client";
import { passwordSchema } from "@/lib/validation/auth";

export type RecoveryStage = "request" | "reset" | "expired";

const RESEND_SECONDS = 60;
const RESET_RETURN = "/lupa-password?tahap=reset";

function errorText(err: unknown, fallback: string): string {
  if (err instanceof ApiClientError) {
    if (err.code === "RATE_LIMITED") return err.retryAfterSeconds ? `Terlalu banyak percobaan. Coba lagi dalam ${err.retryAfterSeconds} detik.` : "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    if (err.code === "NETWORK_ERROR") return err.message;
  }
  return fallback;
}

export function RecoveryFlow({ initial }: { initial: RecoveryStage }) {
  const [stage, setStage] = useState<RecoveryStage | "sent" | "done">(initial);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const passwordCheck = passwordSchema.safeParse(password);
  const passwordError = touched && !passwordCheck.success ? passwordCheck.error.issues[0]?.message : undefined;
  const confirmError = touched && confirm !== password ? "Konfirmasi kata sandi tidak sama." : undefined;

  async function sendLink() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email: email.trim(), redirect_to: RESET_RETURN }, { idempotency: true, redirectOnUnauthenticated: false });
      setCountdown(RESEND_SECONDS);
      setStage("sent");
    } catch (err) {
      setError(errorText(err, "Link reset belum terkirim karena ada gangguan. Email Anda tidak diubah; coba lagi."));
    } finally {
      setBusy(false);
    }
  }

  function onRequest(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (emailValid) void sendLink();
  }

  async function onReset(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!passwordCheck.success || confirm !== password) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/reset-password", { new_password: password }, { idempotency: true, redirectOnUnauthenticated: false });
      // Sesi recovery diakhiri agar pengguna masuk dengan kata sandi baru (sesuai wireframe "Masuk Sekarang"); kegagalan keluar tidak menghalangi.
      await api.post("/auth/logout", undefined, { redirectOnUnauthenticated: false }).catch(() => undefined);
      setStage("done");
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "UNAUTHENTICATED") setStage("expired");
      else if (err instanceof ApiClientError && err.code === "VALIDATION_ERROR") setError("Kata sandi baru tidak dapat dipakai. Gunakan kata sandi lain yang berbeda dari sebelumnya.");
      else setError(errorText(err, "Terjadi gangguan pada server. Coba lagi beberapa saat lagi."));
    } finally {
      setBusy(false);
    }
  }

  if (stage === "sent") {
    return (
      <div className="flex flex-col gap-5">
        <StatusPanel tone="success" icon={<CheckCircleIcon size={26} />} title="Cek Email Anda">
          Bila <strong className="break-all text-ink-900">{email.trim()}</strong> terdaftar, kami mengirim link reset kata sandi ke sana. Link berlaku 1 jam.
        </StatusPanel>
        {error ? <FormAlert>{error}</FormAlert> : null}
        <div className="flex flex-col items-center gap-1 text-caption">
          {countdown > 0 ? (
            <span aria-live="polite">Kirim ulang dalam {countdown} detik</span>
          ) : (
            <button type="button" onClick={() => void sendLink()} disabled={busy} className="min-h-11 font-bold text-blue-600">
              Tidak menerima email? Kirim ulang
            </button>
          )}
          <button type="button" onClick={() => { setStage("request"); setError(null); }} className="min-h-11 text-ink-500 hover:text-ink-900">
            Ubah email
          </button>
          <Link href="/login" className="min-h-11 leading-[44px]">← Kembali ke Masuk</Link>
        </div>
      </div>
    );
  }

  if (stage === "reset") {
    return (
      <form onSubmit={onReset} className="flex flex-col gap-4" noValidate>
        <StatusPanel icon={<LockIcon size={26} />} title="Buat Kata Sandi Baru">
          Kata sandi baru harus berbeda dari kata sandi sebelumnya.
        </StatusPanel>
        {error ? <FormAlert>{error}</FormAlert> : null}
        <Field label="Kata sandi baru" required hint="Minimal 8 karakter, memuat 1 huruf besar dan 1 angka." error={passwordError}>
          {(a) => <PasswordInput autoComplete="new-password" placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} {...a} />}
        </Field>
        <Field label="Konfirmasi kata sandi baru" required error={confirmError}>
          {(a) => <PasswordInput autoComplete="new-password" placeholder="Ulangi kata sandi baru" value={confirm} onChange={(e) => setConfirm(e.target.value)} {...a} />}
        </Field>
        <Button type="submit" loading={busy} className="h-12 w-full">
          {busy ? "Menyimpan…" : "Simpan Kata Sandi Baru"}
        </Button>
      </form>
    );
  }

  if (stage === "done") {
    return (
      <div className="flex flex-col gap-5">
        <StatusPanel tone="success" icon={<CheckCircleIcon size={26} />} title="Kata Sandi Berhasil Diubah">
          Gunakan kata sandi baru Anda untuk masuk mulai sekarang.
        </StatusPanel>
        <LinkButton href="/login" className="h-12 w-full">
          Masuk Sekarang
        </LinkButton>
      </div>
    );
  }

  if (stage === "expired") {
    return (
      <div className="flex flex-col gap-5">
        <StatusPanel tone="warning" icon={<AlertIcon size={26} />} title="Link Reset Tidak Berlaku">
          Link ini sudah kedaluwarsa (berlaku 1 jam) atau sudah pernah dipakai. Minta link baru untuk melanjutkan.
        </StatusPanel>
        <LinkButton href="/lupa-password" className="h-12 w-full">
          Minta Link Baru
        </LinkButton>
        <Link href="/login" className="min-h-11 text-center text-caption leading-[44px]">← Kembali ke Masuk</Link>
      </div>
    );
  }

  return (
    <form onSubmit={onRequest} className="flex flex-col gap-4" noValidate>
      <StatusPanel icon={<MailIcon size={26} />} title="Lupa Kata Sandi?">
        Masukkan email terdaftar Anda — kami akan mengirim link untuk membuat kata sandi baru.
      </StatusPanel>
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field label="Email" required error={touched && !emailValid ? "Masukkan alamat email yang valid." : undefined}>
        {(a) => <Input type="email" autoComplete="email" inputMode="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} {...a} />}
      </Field>
      <Button type="submit" loading={busy} className="h-12 w-full">
        {busy ? "Mengirim…" : "Kirim Link Reset"}
      </Button>
      <Link href="/login" className="min-h-11 text-center text-caption leading-[44px]">← Kembali ke Masuk</Link>
    </form>
  );
}
