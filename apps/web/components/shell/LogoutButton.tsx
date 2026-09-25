"use client";

// components/shell/LogoutButton.tsx — keluar dari sesi ini (POST /api/auth/logout, scope lokal), lalu ke /login. Bila API gagal (mis. sesi sudah habis), tetap ke /login.
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api-client";

export function LogoutButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await api.post("/auth/logout", undefined, { redirectOnUnauthenticated: false });
    } catch {
      // Sesi sudah tidak berlaku atau jaringan gagal: lanjut ke halaman masuk.
    }
    window.location.assign("/login");
  }

  return (
    <Button variant="ghost" size="sm" loading={busy} onClick={logout} className={className ?? "w-full justify-start text-white hover:bg-white/10"}>
      {busy ? "Keluar…" : "Keluar"}
    </Button>
  );
}
