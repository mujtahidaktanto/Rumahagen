"use client";

// components/auth/SignOutButton.tsx — keluar dari akun (POST /auth/logout lalu navigasi penuh ke /login). Dipakai layar yang tidak memakai AppShell (mis. Akun Dibatasi).
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ButtonVariant } from "@/components/ui/Button";
import { api } from "@/lib/api-client";

export function SignOutButton({ variant = "secondary", className }: { variant?: ButtonVariant; className?: string }) {
  const [busy, setBusy] = useState(false);
  async function signOut() {
    setBusy(true);
    // Kegagalan keluar tidak menghalangi: pengguna tetap dibawa ke /login (middleware/penjaga menilai sesi ulang).
    await api.post("/auth/logout", undefined, { redirectOnUnauthenticated: false }).catch(() => undefined);
    window.location.assign("/login");
  }
  return (
    <Button variant={variant} loading={busy} onClick={signOut} className={className}>
      Keluar dari Akun
    </Button>
  );
}
