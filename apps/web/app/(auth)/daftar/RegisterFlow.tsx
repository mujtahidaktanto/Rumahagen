"use client";

// app/(auth)/daftar/RegisterFlow.tsx — Daftar (M01-Register) lalu verifikasi kode (M01-OTP) dalam satu halaman: POST /auth/register mengirim OTP email,
// POST /auth/verify-otp memasang sesi (akun langsung aktif), POST /auth/resend-otp kirim ulang (jeda 60 detik, ditegakkan juga oleh Supabase).
// Nama lengkap wajib (dikirim ke API register -> user_metadata.full_name); nomor WhatsApp TIDAK diminta saat daftar (keputusan 2026-09-26), diisi nanti di Profil Saya.
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Button, LinkButton } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { CheckCircleIcon, KeyIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { OtpInput } from "@/components/auth/OtpInput";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { FormAlert, StatusPanel } from "@/components/auth/StatusPanel";
import { api, ApiClientError } from "@/lib/api-client";
import { fullNameSchema, passwordSchema } from "@/lib/validation/auth";

const RESEND_SECONDS = 60;

function rateMessage(err: ApiClientError) {
  return err.retryAfterSeconds ? `Terlalu banyak percobaan. Coba lagi dalam ${err.retryAfterSeconds} detik.` : "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
}

function registerMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.code === "CONFLICT") return "Email sudah terdaftar. Coba masuk, atau gunakan email lain.";
    if (err.code === "RATE_LIMITED") return rateMessage(err);
    if (err.code === "VALIDATION_ERROR") return "Periksa kembali email dan kata sandi Anda.";
    if (err.code === "NETWORK_ERROR") return err.message;
    return "Terjadi gangguan pada server. Coba lagi beberapa saat lagi.";
  }
  return "Terjadi kesalahan tak terduga. Coba lagi.";
}

function otpMessage(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.code === "RATE_LIMITED") return rateMessage(err);
    if (err.code === "NETWORK_ERROR") return err.message;
    if (err.code === "VALIDATION_ERROR") return "Kode salah atau sudah kedaluwarsa. Coba lagi.";
    return "Terjadi gangguan pada server. Coba lagi beberapa saat lagi.";
  }
  return "Terjadi kesalahan tak terduga. Coba lagi.";
}

type Stage = "form" | "otp" | "success";

export function RegisterFlow({ next }: { next: string }) {
  const [stage, setStage] = useState<Stage>("form");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const nameCheck = fullNameSchema.safeParse(fullName);
  const passwordCheck = passwordSchema.safeParse(password);
  const passwordError = touched && !passwordCheck.success ? passwordCheck.error.issues[0]?.message : undefined;
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());

  async function onRegister(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!nameCheck.success || !emailValid || !passwordCheck.success || confirm !== password || !agree) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/register", { full_name: fullName.trim(), email: email.trim(), password }, { idempotency: true, redirectOnUnauthenticated: false });
      setCode("");
      setCountdown(RESEND_SECONDS);
      setStage("otp");
    } catch (err) {
      setError(registerMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e?: FormEvent) {
    e?.preventDefault();
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/verify-otp", { email: email.trim(), token: code }, { redirectOnUnauthenticated: false });
      setStage("success");
    } catch (err) {
      setError(otpMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function onResend() {
    setError(null);
    setInfo(null);
    try {
      await api.post("/auth/resend-otp", { email: email.trim() }, { idempotency: true, redirectOnUnauthenticated: false });
      setInfo("Kode baru sudah dikirim.");
      setCountdown(RESEND_SECONDS);
    } catch (err) {
      setError(otpMessage(err));
      if (err instanceof ApiClientError && err.code === "RATE_LIMITED") setCountdown(err.retryAfterSeconds ?? RESEND_SECONDS);
    }
  }

  async function onGoogle() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ url: string }>("/auth/oauth/google", { redirect_to: next }, { redirectOnUnauthenticated: false });
      window.location.assign(res.data.url);
    } catch (err) {
      setError(registerMessage(err));
      setBusy(false);
    }
  }

  if (stage === "success") {
    return (
      <div className="flex flex-col gap-5">
        <StatusPanel tone="success" icon={<CheckCircleIcon size={28} />} title="Verifikasi Berhasil">
          Akun Anda sudah aktif. Selamat bergabung di RumahAgen — Anda bisa langsung mulai.
        </StatusPanel>
        <LinkButton href={next as Route} prefetch={false} className="w-full">
          Masuk ke Dashboard
        </LinkButton>
      </div>
    );
  }

  if (stage === "otp") {
    return (
      <form onSubmit={onVerify} className="flex flex-col items-stretch gap-5" noValidate>
        <StatusPanel icon={<ShieldCheckIcon size={28} />} title="Verifikasi Email Anda">
          Kami mengirim kode 6 digit ke <strong className="break-all text-ink-900">{email.trim()}</strong>. Cek juga folder spam.
        </StatusPanel>
        <OtpInput value={code} onChange={setCode} invalid={!!error} disabled={busy} />
        {error ? <FormAlert>{error}</FormAlert> : null}
        {info && !error ? <p role="status" className="text-center text-body-md text-success-600">{info}</p> : null}
        <Button type="submit" loading={busy} disabled={code.length !== 6} className="h-12 w-full">
          {busy ? "Memverifikasi…" : "Verifikasi"}
        </Button>
        <div className="flex flex-col items-center gap-1 text-caption">
          {countdown > 0 ? (
            <span aria-live="polite">Kirim ulang kode dalam {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}</span>
          ) : (
            <button type="button" onClick={onResend} className="min-h-11 font-bold text-blue-600">Kirim Ulang Kode</button>
          )}
          <button
            type="button"
            onClick={() => {
              setStage("form");
              setError(null);
              setInfo(null);
            }}
            className="min-h-11 text-ink-500 hover:text-ink-900"
          >
            Ubah email
          </button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onRegister} className="flex flex-col gap-4" noValidate>
      <div>
        <h1 className="text-headline">Buat Akun Baru</h1>
        <p className="mt-1 text-body-md text-ink-500">
          Sudah punya akun? <Link href={`/login${next === "/portal" ? "" : `?next=${encodeURIComponent(next)}`}` as Route}>Masuk di sini</Link>
        </p>
      </div>
      {error ? <FormAlert>{error}</FormAlert> : null}
      <Field label="Nama lengkap" required hint="Tulis sesuai KTP." error={touched && !nameCheck.success ? nameCheck.error.issues[0]?.message : undefined}>
        {(a) => <Input type="text" autoComplete="name" placeholder="Nama lengkap Anda" maxLength={100} value={fullName} onChange={(e) => setFullName(e.target.value)} {...a} />}
      </Field>
      <Field label="Email" required error={touched && !emailValid ? "Masukkan alamat email yang valid." : undefined}>
        {(a) => <Input type="email" autoComplete="email" inputMode="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} {...a} />}
      </Field>
      <Field label="Kata sandi" required hint="Minimal 8 karakter, memuat 1 huruf besar dan 1 angka." error={passwordError}>
        {(a) => <PasswordInput autoComplete="new-password" placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} {...a} />}
      </Field>
      <Field label="Ulangi kata sandi" required error={touched && confirm !== password ? "Konfirmasi kata sandi tidak sama." : undefined}>
        {(a) => <PasswordInput autoComplete="new-password" placeholder="Ketik ulang kata sandi" value={confirm} onChange={(e) => setConfirm(e.target.value)} {...a} />}
      </Field>
      <label className="flex cursor-pointer items-start gap-2.5">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 flex-none accent-blue-600" />
        <span className="text-body-md text-ink-700">
          Saya setuju dengan Syarat &amp; Ketentuan dan Kebijakan Privasi RumahAgen
        </span>
      </label>
      {touched && !agree ? <p role="alert" className="-mt-2 text-caption text-danger-600">Centang persetujuan untuk melanjutkan.</p> : null}
      <Button type="submit" loading={busy} className="h-12 w-full">
        {busy ? "Memproses…" : "Daftar Sekarang"}
      </Button>
      <div className="flex items-center gap-3 text-caption text-ink-300 before:h-px before:flex-1 before:bg-ink-100 after:h-px after:flex-1 after:bg-ink-100">atau</div>
      <Button type="button" variant="secondary" onClick={onGoogle} disabled={busy} className="h-12 w-full text-ink-700">
        <KeyIcon size={17} />
        Lanjutkan dengan Google
      </Button>
    </form>
  );
}
