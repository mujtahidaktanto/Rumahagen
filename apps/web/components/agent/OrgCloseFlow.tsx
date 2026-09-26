"use client";

// components/agent/OrgCloseFlow.tsx — penutupan organisasi 2 langkah (M12, khusus leader). Langkah 1 "Tutup": organisasi aktif -> closing lewat DELETE /organizations/{id} (tanpa OTP). Langkah 2 "Konfirmasi
// Penutupan": kode OTP 6 digit dikirim ke email leader (POST /organizations/{id}/close-otp), lalu POST /organizations/{id}/close-otp/confirm { token } menutup PERMANEN (tidak bisa dibatalkan).
// variant="zona" = kartu "Tutup Organisasi" (organisasi aktif); variant="spanduk" = tombol "Konfirmasi Penutupan" di spanduk status closing. Pesan galat server ditampilkan apa adanya.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cleanOtp, isOtpShape } from "@/lib/agent/org-rules";
import { ApiClientError, api } from "@/lib/api-client";

type Props = { orgId: string; status: "active" | "closing"; maskedEmail: string | null; variant: "zona" | "spanduk" };

export function OrgCloseFlow({ orgId, status, maskedEmail, variant }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<"idle" | "close" | "send" | "verify">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  const msg = (e: unknown, fallback: string) => (e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : fallback);
  const netFail = "Permintaan belum berhasil. Periksa koneksi Anda lalu coba lagi.";

  function show() {
    setStep("confirm");
    setOtp("");
    setError(null);
    setResent(false);
    setOpen(true);
  }

  async function closeOrg() {
    setBusy("close");
    setError(null);
    try {
      await api.delete(`/organizations/${orgId}`, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(msg(e, netFail));
    } finally {
      setBusy("idle");
    }
  }

  async function sendOtp(again = false) {
    setBusy("send");
    setError(null);
    try {
      await api.post(`/organizations/${orgId}/close-otp`, {}, { idempotency: true });
      setStep("otp");
      setOtp("");
      setResent(again);
    } catch (e) {
      setError(msg(e, netFail));
    } finally {
      setBusy("idle");
    }
  }

  async function verify() {
    setBusy("verify");
    setError(null);
    try {
      await api.post(`/organizations/${orgId}/close-otp/confirm`, { token: otp }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(msg(e, netFail));
    } finally {
      setBusy("idle");
    }
  }

  const isActive = status === "active";
  return (
    <>
      {variant === "zona" ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-danger-100 bg-danger-100 p-5">
          <div className="min-w-0 flex-1 basis-64">
            <p className="text-label-lg text-danger-600">Tutup Organisasi</p>
            <p className="text-body-md text-ink-700">Tindakan 2 langkah: organisasi masuk status &quot;closing&quot; dulu, lalu perlu dikonfirmasi lagi (dengan kode OTP) untuk ditutup permanen.</p>
          </div>
          <Button variant="secondary" size="sm" className="border-danger-600 text-danger-600" onClick={show}>
            Tutup Organisasi
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="danger" onClick={show}>
          Konfirmasi Penutupan
        </Button>
      )}

      <Dialog
        open={open}
        onClose={() => (busy !== "idle" ? undefined : setOpen(false))}
        title={step === "otp" ? "Masukkan Kode OTP" : isActive ? "Tutup Organisasi Ini?" : "Konfirmasi Penutupan Permanen"}
        description={
          step === "otp"
            ? `Kode 6 digit sudah dikirim ke email terdaftar Anda${maskedEmail ? ` (${maskedEmail})` : ""}. Masukkan kodenya untuk menyelesaikan penutupan permanen. Setelah dikonfirmasi, tindakan ini tidak bisa dibatalkan.`
            : isActive
              ? 'Organisasi akan masuk status "closing": anggota masih bisa melihatnya, tetapi tidak bisa menerima anggota atau listing baru. Anda perlu konfirmasi sekali lagi untuk menutup permanen.'
              : "Tindakan ini permanen dan tidak bisa dibatalkan. Untuk keamanan, Anda perlu memverifikasi kode OTP yang dikirim ke email terdaftar Anda. Anggota tidak kehilangan listing atau riwayat mereka, tetapi organisasi tidak bisa dibuka kembali."
        }
        footer={
          step === "otp" ? (
            <>
              <Button variant="secondary" disabled={busy !== "idle"} onClick={() => setStep("confirm")}>
                Kembali
              </Button>
              <Button variant="danger" loading={busy === "verify"} disabled={!isOtpShape(otp) || busy !== "idle"} onClick={() => void verify()}>
                Konfirmasi Penutupan
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" disabled={busy !== "idle"} onClick={() => setOpen(false)}>
                Batal
              </Button>
              {isActive ? (
                <Button variant="danger" loading={busy === "close"} onClick={() => void closeOrg()}>
                  Ya, Tutup Organisasi
                </Button>
              ) : (
                <Button variant="danger" loading={busy === "send"} onClick={() => void sendOtp()}>
                  Kirim Kode OTP
                </Button>
              )}
            </>
          )
        }
      >
        {step === "otp" ? (
          <div className="flex flex-col gap-3">
            <label htmlFor="org-otp" className="sr-only">
              Kode OTP
            </label>
            <input
              id="org-otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(cleanOtp(e.target.value))}
              className="h-14 w-full rounded-md border-[1.5px] border-ink-200 text-center text-[22px] font-bold tracking-[8px] outline-offset-2 focus-visible:outline-2 focus-visible:outline-blue-600"
            />
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => void sendOtp(true)} disabled={busy !== "idle"} className="min-h-11 text-label-lg text-blue-600 disabled:opacity-50">
                Kirim ulang kode
              </button>
              {resent ? (
                <span role="status" className="text-caption text-success-600">
                  Kode baru terkirim.
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
        {error ? (
          <p role="alert" className="mt-3 text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>
    </>
  );
}
