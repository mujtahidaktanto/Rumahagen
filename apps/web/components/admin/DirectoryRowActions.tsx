"use client";

// components/admin/DirectoryRowActions.tsx — aksi per baris Direktori Pengguna (M09): "Ubah Role" (PUT /admin/users/{id}/role — BERBEDA dari Staf Internal: di sini untuk mengonversi Agent
// menjadi mitra atau, khusus Superadmin, ke role apa pun termasuk staf), "KTP" (GET /admin/agents/{id}/ktp, hanya role agent) dengan "Cabut Verifikasi" (POST /admin/agents/{id}/ktp/reset
// { reason }), dan "Suspend" (PUT /admin/agents/{id}/suspend, hanya role agent + status active, Superadmin/Admin saja). Endpoint suspend TIDAK menerima body sama sekali (tidak ada kolom
// alasan di API meski wireframe menunjukkan textarea alasan) — dialog di sini sengaja tanpa textarea; celah ini dicatat di audit/FRONTEND_GAPS.md.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { roleOptionsForChangeRole, type AdminViewerRole } from "@/lib/admin/admin-rules";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";
import { ApiClientError, api } from "@/lib/api-client";

type KtpData = { user_id: string; ktp_number: string; photo_url: string; submitted_at: string; updated_at: string };

const dtfFull = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function DirectoryRowActions({
  userId,
  name,
  viewerRole,
  canKtp,
  canSuspend,
  canChangeRole,
}: {
  userId: string;
  name: string;
  viewerRole: AdminViewerRole;
  canKtp: boolean;
  canSuspend: boolean;
  canChangeRole: boolean;
}) {
  const router = useRouter();
  const [roleOpen, setRoleOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [ktpOpen, setKtpOpen] = useState(false);
  const [ktpResetOpen, setKtpResetOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = roleOptionsForChangeRole(viewerRole);
  const [newRole, setNewRole] = useState<RoleCode>(roleOptions[0] ?? "agent");
  const [ktpLoading, setKtpLoading] = useState(false);
  const [ktp, setKtp] = useState<KtpData | null | undefined>(undefined); // undefined = belum dimuat, null = tidak ada data
  const [ktpReason, setKtpReason] = useState("");

  async function saveRole() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/users/${userId}/role`, { role_id: newRole }, { idempotency: true });
      setRoleOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Role belum berhasil diubah. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmSuspend() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/agents/${userId}/suspend`, undefined, { idempotency: true });
      setSuspendOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil suspend. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function openKtp() {
    setKtpOpen(true);
    setKtpLoading(true);
    setError(null);
    try {
      const res = await api.get<KtpData>(`/admin/agents/${userId}/ktp`);
      setKtp(res.data);
    } catch {
      setKtp(null);
    } finally {
      setKtpLoading(false);
    }
  }

  async function confirmKtpReset() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/admin/agents/${userId}/ktp/reset`, { reason: ktpReason }, { idempotency: true });
      setKtpResetOpen(false);
      setKtpOpen(false);
      setKtpReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil mencabut verifikasi. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3.5">
      {canKtp ? (
        <button type="button" className="text-label-lg text-blue-600" onClick={() => void openKtp()}>
          KTP
        </button>
      ) : null}
      {canChangeRole ? (
        <button
          type="button"
          className="text-label-lg text-blue-600"
          onClick={() => {
            setNewRole(roleOptions[0] ?? "agent");
            setError(null);
            setRoleOpen(true);
          }}
        >
          Ubah Role
        </button>
      ) : null}
      {canSuspend ? (
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setError(null);
            setSuspendOpen(true);
          }}
        >
          Suspend
        </Button>
      ) : null}

      <Dialog
        open={roleOpen}
        onClose={() => (busy ? undefined : setRoleOpen(false))}
        title={`Ubah Role — ${name}`}
        description={
          viewerRole === "superadmin"
            ? "Superadmin bisa mengubah ke role apa pun — perubahan role adalah operasi paling sensitif di seluruh model otorisasi, tercatat di audit log."
            : "Manager hanya bisa mengubah akun Agent menjadi Instructor/Buyer/Developer Partner (onboarding mitra baru) — tidak bisa membalik arah atau mengubah role staf."
        }
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setRoleOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void saveRole()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Role baru">
            {(a) => (
              <Select {...a} value={newRole} onChange={(e) => setNewRole(e.target.value as RoleCode)}>
                {roleOptions.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={suspendOpen}
        onClose={() => (busy ? undefined : setSuspendOpen(false))}
        title={`Suspend akun ${name}?`}
        description="Akun tidak dapat mengakses fitur apa pun selama status ini aktif. Reaktivasi hanya lewat &quot;Ubah Role&quot; oleh Superadmin."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setSuspendOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void confirmSuspend()}>
              Suspend Akun
            </Button>
          </>
        }
      >
        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </Dialog>

      <Dialog
        open={ktpOpen}
        onClose={() => {
          setKtpOpen(false);
          setKtp(undefined);
        }}
        title={`Data KTP — ${name}`}
      >
        {ktpLoading ? (
          <p className="text-body-md text-ink-500">Memuat…</p>
        ) : ktp ? (
          <div className="flex flex-col gap-3">
            <div>
              <Badge tone="success">Terverifikasi</Badge>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-caption">Nomor KTP (NIK)</span>
              <span className="text-title-md font-mono tracking-wide">{ktp.ktp_number}</span>
            </div>
            <a href={ktp.photo_url} target="_blank" rel="noreferrer" className="overflow-hidden rounded-md border border-ink-100 bg-ink-50">
              <img src={ktp.photo_url} alt="Foto KTP" className="h-48 w-full object-cover" />
            </a>
            <span className="text-caption">Bersifat privat. Setiap kali data ini dibuka, aksinya tercatat di audit log — tautan foto berlaku 10 menit. Dikirim {dtfFull.format(new Date(ktp.submitted_at))}.</span>
            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={() => {
                  setKtpResetOpen(true);
                  setKtpReason("");
                  setError(null);
                }}
              >
                Cabut Verifikasi
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-body-md text-ink-500">Agent ini belum mengirim KTP (atau verifikasinya sudah dicabut). Status: belum diverifikasi.</p>
        )}
      </Dialog>

      <Dialog
        open={ktpResetOpen}
        onClose={() => (busy ? undefined : setKtpResetOpen(false))}
        title={`Cabut verifikasi KTP ${name}?`}
        description="Status kembali menjadi belum diverifikasi, lencana &quot;Terverifikasi&quot; hilang dari profil publik, dan data serta foto KTP dihapus. Agent bisa mengirim KTP lagi."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setKtpResetOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} disabled={ktpReason.trim().length < 3} onClick={() => void confirmKtpReset()}>
              Cabut Verifikasi
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Alasan pencabutan" required hint="Contoh: foto KTP tidak sesuai dengan nomor yang diisi.">
            {(a) => <Textarea {...a} value={ktpReason} onChange={(e) => setKtpReason(e.target.value)} placeholder="Jelaskan alasan pencabutan untuk audit log…" />}
          </Field>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>
    </div>
  );
}
