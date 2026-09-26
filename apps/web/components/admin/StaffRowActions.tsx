"use client";

// components/admin/StaffRowActions.tsx — "Ubah Role" dan "Nonaktifkan" per baris di Staf Internal (M09, Superadmin-only): PUT /admin/internal-users/{id} { role_id } dan
// PUT /admin/internal-users/{id}/deactivate. Nonaktifkan hanya untuk akun yang sedang aktif; reaktivasi lewat "Ubah Role" (status kembali ke 'active' tidak diekspos di sini — bukan bagian
// kontrak endpoint deactivate, sesuai catatan route).
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Select } from "@/components/ui/Field";
import { STAFF_ROLE_OPTIONS } from "@/lib/admin/admin-rules";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";
import { ApiClientError, api } from "@/lib/api-client";

export function StaffRowActions({ userId, email, roleCode, canDeactivate, roleIdByCode }: { userId: string; email: string; roleCode: string; canDeactivate: boolean; roleIdByCode: Record<string, string> }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [newRole, setNewRole] = useState<RoleCode>((roleCode as RoleCode) ?? "admin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveRole() {
    const roleId = roleIdByCode[newRole];
    if (!roleId) return;
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/internal-users/${userId}`, { role_id: roleId }, { idempotency: true });
      setEditOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Role belum berhasil diubah. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/internal-users/${userId}/deactivate`, undefined, { idempotency: true });
      setDeactivateOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil menonaktifkan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        className="text-label-lg text-blue-600"
        onClick={() => {
          setNewRole((roleCode as RoleCode) ?? "admin");
          setError(null);
          setEditOpen(true);
        }}
      >
        Ubah Role
      </button>
      {canDeactivate ? (
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            setError(null);
            setDeactivateOpen(true);
          }}
        >
          Nonaktifkan
        </Button>
      ) : null}

      <Dialog
        open={editOpen}
        onClose={() => (busy ? undefined : setEditOpen(false))}
        title={`Ubah Role — ${email}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setEditOpen(false)}>
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
                {STAFF_ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <p className="text-caption">Perubahan role langsung memengaruhi seluruh akses akun ini di sistem — tidak ada konfirmasi tambahan lain selain aksi ini sendiri.</p>
          {error ? (
            <p role="alert" className="text-body-md text-danger-600">
              {error}
            </p>
          ) : null}
        </div>
      </Dialog>

      <Dialog
        open={deactivateOpen}
        onClose={() => (busy ? undefined : setDeactivateOpen(false))}
        title={`Nonaktifkan ${email}?`}
        description="Status akun menjadi 'suspended' — tidak bisa login ke admin console sampai diaktifkan kembali lewat &quot;Ubah Role&quot;."
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setDeactivateOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" loading={busy} onClick={() => void deactivate()}>
              Nonaktifkan
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
    </div>
  );
}
