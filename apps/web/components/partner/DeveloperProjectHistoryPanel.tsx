"use client";

// components/partner/DeveloperProjectHistoryPanel.tsx — Riwayat Perumahan (M06, migration 0172): logo + nama perumahan yang pernah/sedang dikerjakan, boleh
// lebih dari satu. PUBLIK -- tampil di halaman profil publik Developer (/developer/{slug}) untuk citra brand, beda dari Berkas Legalitas yang privat. Logo
// dipangkas persegi 1:1 lewat CropDialog (pola sama seperti logo perusahaan di PartnerProfileView.tsx); upload+simpan jadi satu aksi per entri (bukan ditunda
// ke tombol Simpan global) supaya tiap kartu riwayat independen.
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { LayersIcon } from "@/components/ui/icons";
import { CropDialog } from "@/components/media/CropDialog";
import { loadSource, pickProblem, putToSignedUrl, type Encoded, type Source } from "@/lib/media/image-processing";
import { DEVELOPER_LOGO_SIZE } from "@/lib/media/variants";
import type { ProjectHistoryRow } from "@/lib/partner/profile-data";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";

const LOGO_FRAME = { w: 200, h: 200 };
type UploadTarget = { upload_url: string; public_url: string };

export function DeveloperProjectHistoryPanel({ developerId, initial }: { developerId: string; initial: Part<ProjectHistoryRow[]> | null }) {
  const router = useRouter();
  const [items, setItems] = useState<ProjectHistoryRow[]>(initial?.ok ? initial.data : []);
  const [projectName, setProjectName] = useState("");
  const [cropping, setCropping] = useState<Source | null>(null);
  const [pendingLogo, setPendingLogo] = useState<Encoded | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ProjectHistoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onPickLogo(files: FileList | null) {
    const file = files?.[0];
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    setError(null);
    const problem = pickProblem(file);
    if (problem) return setError(problem);
    try {
      setCropping(await loadSource(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Foto tidak bisa dibuka. Coba foto lain.");
    }
  }

  function applyCropped(enc: Encoded) {
    setCropping(null);
    if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    setPendingLogo(enc);
    setPendingPreview(URL.createObjectURL(enc.blob));
  }

  async function addEntry() {
    if (!projectName.trim()) {
      setError("Isi nama perumahan dulu.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let logoUrl: string | undefined;
      if (pendingLogo) {
        const t = await api.post<UploadTarget>(`/developer-partners/${developerId}/media-upload-url`, { kind: "history_logo", content_type: pendingLogo.type }, { idempotency: true });
        await putToSignedUrl(t.data.upload_url, pendingLogo.blob, pendingLogo.type);
        logoUrl = t.data.public_url;
      }
      const created = await api.post<{ id: string; project_name: string; logo_url: string | null; display_order: number; created_at: string }>(
        `/developer-partners/${developerId}/project-history`,
        { project_name: projectName.trim(), logo_url: logoUrl },
        { idempotency: true },
      );
      setItems((cur) => [{ id: created.data.id, projectName: created.data.project_name, logoUrl: created.data.logo_url, displayOrder: created.data.display_order, createdAt: created.data.created_at }, ...cur]);
      setProjectName("");
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
      setPendingLogo(null);
      setPendingPreview(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : e instanceof Error && e.message !== "upload" ? e.message : "Entri gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/developer-project-history/${toDelete.id}`, { idempotency: true });
      setItems((cur) => cur.filter((h) => h.id !== toDelete.id));
      setToDelete(null);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" ? e.message : "Entri gagal dihapus. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-md border border-ink-100 bg-white p-5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1.5 text-title-md">
          <LayersIcon size={16} className="text-ink-400" />
          Riwayat Perumahan
        </h2>
        <span className="text-caption">{items.length} entri</span>
      </div>
      <p className="mb-3.5 text-body-md text-ink-500">Logo dan nama perumahan yang pernah atau sedang dikerjakan. Tampil di halaman profil publik perusahaan Anda untuk memperkuat citra brand.</p>

      {!initial ? (
        <ErrorState title="Riwayat gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : !initial.ok ? (
        <ErrorState title="Riwayat gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : items.length === 0 ? (
        <div className="py-8 text-center">
          <LayersIcon size={28} />
          <p className="mt-2 text-body-md text-ink-500">Belum ada riwayat perumahan.</p>
        </div>
      ) : (
        <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((h) => (
            <li key={h.id} className="flex flex-col items-center gap-2 rounded-md border border-ink-100 p-3 text-center">
              <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-md bg-ink-100">
                {h.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.logoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <LayersIcon size={20} className="text-ink-400" />
                )}
              </span>
              <span className="line-clamp-2 text-body-md text-ink-900">{h.projectName}</span>
              <Button variant="ghost" size="sm" className="text-danger-600" onClick={() => setToDelete(h)}>
                Hapus
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-ink-100 p-4">
        <div className="flex items-center gap-3">
          <span className="flex aspect-square h-14 flex-none items-center justify-center overflow-hidden rounded-md bg-ink-100 text-caption">
            {pendingPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pendingPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              "Logo"
            )}
          </span>
          <Button variant="secondary" size="sm" disabled={busy} onClick={() => fileRef.current?.click()}>
            {pendingPreview ? "Ganti Logo" : "Pilih Logo (opsional)"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" onChange={(e) => void onPickLogo(e.target.files)} />
        </div>
        <Field label="Nama perumahan">{(a) => <Input {...a} maxLength={200} value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="mis. Cluster Kanaya Residence" />}</Field>
        <div>
          <Button loading={busy} onClick={() => void addEntry()}>
            + Tambah Riwayat
          </Button>
        </div>
        <span className="text-caption">Logo persegi 1:1, JPG/PNG/WebP hingga 25 MB. Boleh tambah lebih dari satu entri.</span>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-body-md text-danger-600">
          {error}
        </p>
      ) : null}

      <Dialog
        open={!!toDelete}
        onClose={() => (deleting ? undefined : setToDelete(null))}
        title="Hapus riwayat?"
        description={toDelete ? `"${toDelete.projectName}" akan dihapus dari halaman profil publik.` : undefined}
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

      <CropDialog
        source={cropping}
        frame={LOGO_FRAME}
        output={{ w: DEVELOPER_LOGO_SIZE, h: DEVELOPER_LOGO_SIZE }}
        title="Atur Logo Perumahan"
        description="Geser dan zoom foto sampai logo pas di dalam bingkai."
        onCancel={() => setCropping(null)}
        onConfirm={applyCropped}
      />
    </div>
  );
}
