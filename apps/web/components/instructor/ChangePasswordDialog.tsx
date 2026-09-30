"use client";

// components/instructor/ChangePasswordDialog.tsx — Ganti Kata Sandi (Profil Saya, Instruktur): tidak ada API ganti-sandi-langsung, jadi tombol ini memakai ulang
// POST /auth/forgot-password ke email akun sendiri. redirect_to HARUS /lupa-password?tahap=reset (bukan /login) — satu-satunya halaman yang tahu menampilkan form
// "buat kata sandi baru" setelah /api/auth/callback memasang sesi recovery (lihat app/(auth)/lupa-password/RecoveryFlow.tsx dan bug yang sama di ChangePasswordDialog Admin).
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CheckCircleIcon } from "@/components/ui/icons";
import { ApiClientError, api } from "@/lib/api-client";

export function ChangePasswordDialog({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setSent(false);
    setError(null);
    setOpen(true);
  }

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await api.post("/auth/forgot-password", { email, redirect_to: "/lupa-password?tahap=reset" }, { idempotency: true });
      setSent(true);
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Link belum terkirim karena ada gangguan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="secondary" onClick={openDialog}>
        Ganti Kata Sandi
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Ganti Kata Sandi"
        description={sent ? undefined : `Kami mengirim link untuk membuat kata sandi baru ke ${email}. Link berlaku 1 jam.`}
        footer={
          sent ? (
            <Button onClick={() => setOpen(false)}>Tutup</Button>
          ) : (
            <>
              <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
                Batal
              </Button>
              <Button loading={busy} onClick={() => void send()}>
                Kirim Link
              </Button>
            </>
          )
        }
      >
        {sent ? (
          <div className="flex items-center gap-2.5 rounded-md bg-success-100 p-3 text-body-md text-success-600">
            <CheckCircleIcon size={20} />
            <span>Cek email {email} untuk melanjutkan.</span>
          </div>
        ) : error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </>
  );
}
