"use client";

// components/admin/PartnerFormDialog.tsx — Tambah/Edit Developer Partner (Proyek Developer, tab Developer Partner): POST/PUT /developer-partners(/{id}) atas developer_partners (migration 0033).
// user_id TIDAK diisi di sini (perusahaan bisa terdaftar tanpa akun login untuk atribusi proyek) — menghubungkan akun lewat LinkPartnerAccountDialog terpisah.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { PartnerRow } from "@/lib/admin/developer-admin-data";
import { ApiClientError, api } from "@/lib/api-client";

type Form = { companyName: string; companyLogo: string; description: string; picName: string; picContact: string; status: "active" | "inactive" };
function formFrom(p?: PartnerRow): Form {
  return { companyName: p?.companyName ?? "", companyLogo: "", description: "", picName: p?.picName ?? "", picContact: p?.picContact ?? "", status: (p?.status as "active" | "inactive") ?? "active" };
}

export function PartnerFormDialog({ partner, trigger }: { partner?: PartnerRow; trigger: (open: () => void) => React.ReactNode }) {
  const router = useRouter();
  const isEdit = !!partner;
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Form>(formFrom(partner));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setF(formFrom(partner));
    setError(null);
    setOpen(true);
  }

  async function save() {
    if (!f.companyName.trim()) {
      setError("Nama perusahaan wajib diisi.");
      return;
    }
    setBusy(true);
    setError(null);
    const body = { company_name: f.companyName.trim(), company_logo: f.companyLogo.trim() || undefined, description: f.description.trim() || undefined, pic_name: f.picName.trim() || undefined, pic_contact: f.picContact.trim() || undefined, status: f.status };
    try {
      if (isEdit) await api.put(`/developer-partners/${partner.id}`, body, { idempotency: true });
      else await api.post("/developer-partners", body, { idempotency: true });
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
        title={isEdit ? "Edit Developer Partner" : "Tambah Developer Partner"}
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
        <div className="flex flex-col gap-3.5">
          <Field label="Nama Perusahaan" required>
            {(a) => <Input {...a} value={f.companyName} onChange={(e) => setF((x) => ({ ...x, companyName: e.target.value }))} />}
          </Field>
          <Field label="Logo (URL)">{(a) => <Input {...a} value={f.companyLogo} onChange={(e) => setF((x) => ({ ...x, companyLogo: e.target.value }))} />}</Field>
          <Field label="Tentang Developer">{(a) => <Textarea {...a} rows={2} value={f.description} onChange={(e) => setF((x) => ({ ...x, description: e.target.value }))} />}</Field>
          <Field label="Nama PIC">{(a) => <Input {...a} value={f.picName} onChange={(e) => setF((x) => ({ ...x, picName: e.target.value }))} />}</Field>
          <Field label="Kontak PIC">{(a) => <Input {...a} value={f.picContact} onChange={(e) => setF((x) => ({ ...x, picContact: e.target.value }))} />}</Field>
          <Field label="Status">
            {(a) => (
              <Select {...a} value={f.status} onChange={(e) => setF((x) => ({ ...x, status: e.target.value as Form["status"] }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
