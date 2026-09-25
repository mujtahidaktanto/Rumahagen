"use client";

// app/(auth)/login/LoginForm.tsx — formulir masuk: POST /api/auth/login (cookie sesi diatur server), lalu navigasi penuh ke `next` agar middleware dan layout
// membaca sesi baru. 401 di sini berarti "email/kata sandi salah" (bukan sesi habis), jadi pengalihan otomatis ke /login dimatikan.
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { api, ApiClientError } from "@/lib/api-client";

function messageFor(err: unknown): string {
  if (err instanceof ApiClientError) {
    if (err.code === "RATE_LIMITED") {
      return err.retryAfterSeconds ? `Terlalu banyak percobaan. Coba lagi dalam ${err.retryAfterSeconds} detik.` : "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.";
    }
    if (err.code === "VALIDATION_ERROR") return "Periksa kembali email dan kata sandi Anda.";
    if (err.code === "UNAUTHENTICATED" || err.code === "FORBIDDEN" || err.code === "NETWORK_ERROR") return err.message;
    return "Terjadi gangguan pada server. Coba lagi beberapa saat lagi.";
  }
  return "Terjadi kesalahan tak terduga. Coba lagi.";
}

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/login", { email: email.trim(), password }, { redirectOnUnauthenticated: false });
      window.location.assign(next);
    } catch (err) {
      setError(messageFor(err));
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <div role="alert" className="rounded-md border border-danger-600/30 bg-danger-100 p-3 text-body-md text-danger-600">
          {error}
        </div>
      ) : null}
      <Field label="Email" required>
        {(a) => <Input type="email" autoComplete="username" inputMode="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} {...a} />}
      </Field>
      <Field label="Kata sandi" required>
        {(a) => <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} {...a} />}
      </Field>
      <Button type="submit" loading={busy} disabled={!email.trim() || !password} className="w-full">
        {busy ? "Memproses…" : "Masuk"}
      </Button>
    </form>
  );
}
