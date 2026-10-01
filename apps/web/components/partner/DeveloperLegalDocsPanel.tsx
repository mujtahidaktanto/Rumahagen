"use client";

// components/partner/DeveloperLegalDocsPanel.tsx — Berkas Legalitas Pendukung Perusahaan (M06, migration 0172): PDF/foto scan, boleh lebih dari satu, tiap berkas
// punya nama sendiri. PRIVAT -- hanya pemilik akun dan staf yang bisa melihat (RLS developer_legal_documents_manage), tidak pernah publik. Pola sama seperti
// KitList di components/partner/MarketingKitView.tsx (unggah -> daftarkan -> tampilkan), diisi field "Nama berkas" dulu sebelum memilih file.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { DocIcon, LockIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/format";
import { putToSignedUrl } from "@/lib/media/image-processing";
import type { LegalDocumentRow } from "@/lib/partner/profile-data";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";

const MAX_LEGAL_DOC_BYTES = 20_971_520;
type UploadTarget = { upload_url: string; file_url: string };

function validateFile(file: File): string | null {
  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) return "Berkas harus PDF, JPEG, atau PNG.";
  if (file.size > MAX_LEGAL_DOC_BYTES) return "Ukuran berkas melebihi 20 MB.";
  return null;
}

export function DeveloperLegalDocsPanel({ developerId, initial }: { developerId: string; initial: Part<LegalDocumentRow[]> | null }) {
  const router = useRouter();
  const [items, setItems] = useState<LegalDocumentRow[]>(initial?.ok ? initial.data : []);
  const [docName, setDocName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<LegalDocumentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (!docName.trim()) {
      setError("Isi nama berkas dulu sebelum memilih file.");
      return;
    }
    const problem = validateFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const up = await api.post<UploadTarget>(
        `/developer-partners/${developerId}/legal-documents/upload-url`,
        { file_name: file.name, content_type: file.type, size_bytes: file.size },
        { idempotency: true },
      );
      await putToSignedUrl(up.data.upload_url, file, file.type);
      const created = await api.post<{ id: string; document_name: string; file_url: string; created_at: string }>(
        `/developer-partners/${developerId}/legal-documents`,
        { document_name: docName.trim(), file_url: up.data.file_url },
        { idempotency: true },
      );
      setItems((cur) => [{ id: created.data.id, documentName: created.data.document_name, fileUrl: created.data.file_url, downloadUrl: null, createdAt: created.data.created_at }, ...cur]);
      setDocName("");
      router.refresh();
    } catch (e2) {
      setError(e2 instanceof ApiClientError && e2.code !== "UNKNOWN_ERROR" ? e2.message : "Unggah gagal. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/developer-legal-documents/${toDelete.id}`, { idempotency: true });
      setItems((cur) => cur.filter((d) => d.id !== toDelete.id));
      setToDelete(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Berkas gagal dihapus. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-title-md">
          <LockIcon size={16} className="text-ink-400" />
          Berkas Legalitas Perusahaan
        </h2>
        <span className="text-caption">{items.length} berkas</span>
      </div>
      <p className="mb-3.5 text-body-md text-ink-500">Akta, NIB, SIUP, atau berkas legalitas lain untuk verifikasi tim RumahAgen. Privat — hanya Anda dan staf internal yang bisa melihatnya, tidak pernah tampil ke publik.</p>

      {!initial ? (
        <ErrorState title="Berkas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : !initial.ok ? (
        <ErrorState title="Berkas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <DocIcon size={28} />
          <p className="mt-2 text-body-md text-ink-500">Belum ada berkas legalitas.</p>
        </div>
      ) : (
        <ul className="mb-4 flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100">
          {items.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <span className="block truncate text-body-md text-ink-900">{d.documentName}</span>
                <p className="text-caption">Diunggah {formatDateTime(d.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                {d.downloadUrl ? (
                  <a href={d.downloadUrl} target="_blank" rel="noreferrer" className="rounded-pill border-[1.5px] border-ink-100 px-3.5 py-1.5 text-[13px] font-bold text-blue-600 hover:border-blue-500">
                    Unduh
                  </a>
                ) : null}
                <Button variant="secondary" size="sm" className="text-danger-600" onClick={() => setToDelete(d)}>
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-ink-100 p-4">
        <Field label="Nama berkas" hint="Diisi sebelum memilih file, mis. 'Akta Pendirian PT'.">
          {(a) => <Input {...a} maxLength={200} value={docName} onChange={(e) => setDocName(e.target.value)} />}
        </Field>
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-pill bg-blue-600 px-4 py-2 text-label-lg text-white hover:bg-blue-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
          {busy ? "Mengunggah…" : "Pilih file"}
          <input type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy} onChange={(e) => void onPick(e)} className="hidden" />
        </label>
        <span className="text-caption">PDF, JPEG, atau PNG, maksimal 20 MB. Boleh unggah lebih dari satu berkas.</span>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <Dialog
        open={!!toDelete}
        onClose={() => (deleting ? undefined : setToDelete(null))}
        title="Hapus berkas?"
        description={toDelete ? `"${toDelete.documentName}" akan dihapus permanen.` : undefined}
        footer={
          <>
            <Button variant="secondary" disabled={deleting} onClick={() => setToDelete(null)}>
              Batal
            </Button>
            <Button variant="danger" loading={deleting} onClick={() => void confirmDelete()}>
              Ya, Hapus
            </Button>
          </>
        }
      />
    </div>
  );
}
