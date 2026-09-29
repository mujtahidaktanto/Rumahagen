"use client";

// components/admin/ProjectStatusDialog.tsx — Ubah Status (Proyek Developer, tab Proyek): PUT /admin/developer-projects/{id} { status }. Transisi ke 'active' butuh m06.developer_project.publish
// (permission terpisah dari update biasa, trigger enforce_developer_project_publish_permission) — "ordinary Project Update does not imply activation/publish"; server menegakkan, dialog hanya
// menampilkan peringatannya.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Field";
import { PROJECT_STATUS_OPTIONS, projectStatus } from "@/lib/admin/developer-admin-rules";
import { ApiClientError, api } from "@/lib/api-client";

export function ProjectStatusDialog({ projectId, projectName, currentStatus, trigger }: { projectId: string; projectName: string; currentStatus: string; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setStatus(currentStatus);
    setError(null);
    setOpen(true);
  }

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await api.put(`/admin/developer-projects/${projectId}`, { status }, { idempotency: true });
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Belum berhasil disimpan. Periksa koneksi Anda lalu coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {trigger(openDialog)}
      <Dialog
        open={open}
        onClose={() => (busy ? undefined : setOpen(false))}
        title={`Ubah Status — ${projectName}`}
        footer={
          <>
            <Button variant="secondary" disabled={busy} onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button loading={busy} onClick={() => void save()}>
              Simpan
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {PROJECT_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {projectStatus(s).label}
              </option>
            ))}
          </Select>
          <p className="text-caption">Transisi ke &apos;active&apos; akan gagal 403 kalau akun Anda tidak punya m06.developer_project.publish.</p>
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
