"use client";

// components/admin/CreateStaffDialog.tsx — "+ Tambah Akun Staf" (M09 Staf Internal, Superadmin-only): POST /admin/internal-users { email, password, role_id }. Akun langsung aktif (email
// terverifikasi otomatis) — dipanggil lewat Supabase Admin API di server (bukan alur daftar M01 biasa), sesuai catatan route.
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/Field";
import { STAFF_ROLE_OPTIONS, validateCreateStaff, type CreateStaffErrors, type CreateStaffForm } from "@/lib/admin/admin-rules";
import { ROLE_LABEL, type RoleCode } from "@/lib/auth/roles";
import { ApiClientError, api } from "@/lib/api-client";

const EMPTY: CreateStaffForm = { email: "", password: "", roleCode: "admin" };

export function CreateStaffDialog({ roleIdByCode }: { roleIdByCode: Record<string, string> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateStaffForm>(EMPTY);
  const [errors, setErrors] = useState<CreateStaffErrors>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setForm(EMPTY);
    setErrors({});
    setError(null);
  }

  async function submit() {
    const errs = validateCreateStaff(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const roleId = roleIdByCode[form.roleCode];
    if (!roleId) {
      setError("Role tidak dikenali. Muat ulang halaman ini.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post("/admin/internal-users", { email: form.email.trim(), password: form.password, role_id: roleId }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Akun belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          reset();
          setOpen(true);
        }}
      >
        + Tambah Akun Staf
      </Button>
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title="Tambah Akun Staf Baru"
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void submit()}>
              Buat Akun
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3.5">
          <Field label="Email" required error={errors.email}>
            {(a) => <Input {...a} type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="nama@rumahagen.com" />}
          </Field>
          <Field label="Kata sandi sementara" required error={errors.password} hint="Akun langsung aktif — staf disarankan ganti kata sandi setelah login pertama.">
            {(a) => <Input {...a} type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min. 8 karakter" />}
          </Field>
          <Field label="Role">
            {(a) => (
              <Select {...a} value={form.roleCode} onChange={(e) => setForm((f) => ({ ...f, roleCode: e.target.value as RoleCode }))}>
                {STAFF_ROLE_OPTIONS.map((r) => (
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
    </>
  );
}
