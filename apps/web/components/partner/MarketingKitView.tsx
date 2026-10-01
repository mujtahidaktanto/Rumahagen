"use client";

// components/partner/MarketingKitView.tsx — Marketing Kit (M06, wireframe 03-Developer-Partner/M06-Marketing-Kit): brosur dan daftar harga PDF per proyek. Semua Agent RumahAgen
// bisa melihat/mengunduh tanpa perlu mengklaim proyek (SOURCE-Developer-Partner.md §4) — tapi layar KELOLA (unggah/hapus) ini hanya untuk pemilik proyek. Foto/video proyek
// ada di Detail Proyek (/partner/proyek/{id}), BUKAN di sini — dua resource terpisah (marketing_kit vs developer_project_media).
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { SUPPORT_EMAIL } from "@/lib/config";
import { formatDateTime } from "@/lib/format";
import { putToSignedUrl } from "@/lib/media/image-processing";
import { KIT_TYPE_OPTIONS, kitTypeLabel, validateKitFile } from "@/lib/partner/marketing-kit-rules";
import type { MarketingKitRow, ProjectOption } from "@/lib/partner/marketing-kit-data";
import { ApiClientError, api } from "@/lib/api-client";
import type { Part } from "@/lib/agent/dashboard-data";
import { BuildingIcon, DocIcon } from "@/components/ui/icons";

export function MarketingKitView({
  linked,
  projects,
  selectedProjectId,
  kit,
}: {
  linked: boolean;
  projects: ProjectOption[];
  selectedProjectId: string | null;
  kit: Part<MarketingKitRow[]> | null;
}) {
  const router = useRouter();

  if (!linked) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Marketing Kit</h1>
        <div className="flex flex-col items-center gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-8 text-center">
          <BuildingIcon size={28} />
          <span className="text-title-md text-ink-900">Akun Anda belum terhubung ke perusahaan developer</span>
          <p className="text-body-md text-ink-500">Selama belum terhubung, proyek, marketing kit, dan klaim belum bisa dikelola.</p>
          <LinkButton href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Hubungkan akun Developer Partner")}` as Route}>Hubungi Tim RumahAgen</LinkButton>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
        <h1 className="text-headline">Marketing Kit</h1>
        <div className="py-16 text-center">
          <p className="text-body-md text-ink-500">Buat proyek terlebih dahulu sebelum mengunggah marketing kit.</p>
          <div className="mt-4 flex justify-center">
            <LinkButton href={"/partner/proyek/baru" as Route}>+ Buat Proyek Baru</LinkButton>
          </div>
        </div>
      </div>
    );
  }

  const selected = selectedProjectId ?? projects[0]!.id;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 p-4 lg:p-8">
      <div>
        <h1 className="text-headline">Marketing Kit</h1>
        <p className="text-body-md text-ink-500">
          Marketing Kit berisi brosur dan daftar harga PDF. Semua agen RumahAgen dapat melihat dan mengunduhnya tanpa perlu mengklaim proyek. Foto dan video ada di{" "}
          <a href={`/partner/proyek/${selected}`} className="font-bold text-blue-600">
            Media proyek
          </a>
          .
        </p>
      </div>

      <Select value={selected} onChange={(e) => router.push(`/partner/marketing-kit?proyek=${e.target.value}` as Route)} className="max-w-sm">
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      {/* key={selected}: paksa KitList dipasang ulang saat proyek berganti -- useState(initial) di dalamnya hanya membaca nilai awal sekali, tidak pernah
          menyinkronkan ulang ke prop `initial` yang baru dari server saat dropdown proyek diganti (ditemukan lewat testing live: daftar berkas tetap
          menampilkan proyek sebelumnya sampai halaman di-refresh manual). */}
      <KitList key={selected} projectId={selected} initial={kit} />
    </div>
  );
}

function KitList({ projectId, initial }: { projectId: string; initial: Part<MarketingKitRow[]> | null }) {
  const router = useRouter();
  const [items, setItems] = useState<MarketingKitRow[]>(initial?.ok ? initial.data : []);
  const [fileType, setFileType] = useState<(typeof KIT_TYPE_OPTIONS)[number]>("brochure");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<MarketingKitRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    const problem = validateKitFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const up = await api.post<{ upload_url: string; file_url: string }>(
        `/developer-projects/${projectId}/uploads`,
        { kind: "marketing_kit", file_name: file.name, content_type: file.type, size_bytes: file.size },
        { idempotency: true },
      );
      await putToSignedUrl(up.data.upload_url, file, file.type);
      const created = await api.post<{ id: string; file_type: string; file_name: string; file_url: string; created_at: string }>(
        `/developer-projects/${projectId}/marketing-kit`,
        { file_type: fileType, file_name: file.name, file_url: up.data.file_url },
        { idempotency: true },
      );
      setItems((cur) => [{ id: created.data.id, fileType: created.data.file_type, fileName: created.data.file_name, fileUrl: created.data.file_url, downloadUrl: null, createdAt: created.data.created_at }, ...cur]);
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
      await api.delete(`/marketing-kit/${toDelete.id}`, { idempotency: true });
      setItems((cur) => cur.filter((k) => k.id !== toDelete.id));
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
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 className="text-title-md">Berkas proyek</h2>
        <span className="text-caption">{items.length} berkas</span>
      </div>

      {!initial ? (
        <ErrorState title="Berkas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : !initial.ok ? (
        <ErrorState title="Berkas gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : items.length === 0 ? (
        <div className="py-10 text-center">
          <DocIcon size={28} />
          <p className="mt-2 text-body-md text-ink-500">Belum ada marketing kit. Unggah brosur dan daftar harga agar agen bisa mengunduhnya untuk memasarkan proyek ini.</p>
        </div>
      ) : (
        <ul className="mb-4 flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100">
          {items.map((k) => (
            <li key={k.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-body-md text-ink-900">{k.fileName}</span>
                  <Badge tone="info">{kitTypeLabel(k.fileType)}</Badge>
                </div>
                <p className="text-caption">Diunggah {formatDateTime(k.createdAt)}</p>
              </div>
              <div className="flex gap-2">
                {k.downloadUrl ? (
                  <a href={k.downloadUrl} target="_blank" rel="noreferrer" className="rounded-pill border-[1.5px] border-ink-100 px-3.5 py-1.5 text-[13px] font-bold text-blue-600 hover:border-blue-500">
                    Unduh
                  </a>
                ) : null}
                <Button variant="secondary" size="sm" className="text-danger-600" onClick={() => setToDelete(k)}>
                  Hapus
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2.5 rounded-md border border-dashed border-ink-100 p-4">
        <span className="text-label-lg">Unggah berkas baru</span>
        <div className="flex flex-wrap gap-2">
          {KIT_TYPE_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={fileType === t}
              onClick={() => setFileType(t)}
              className={`rounded-pill border px-3 py-1.5 text-[13px] font-bold ${fileType === t ? "border-blue-600 bg-blue-50 text-blue-700" : "border-ink-100 bg-white text-ink-500"}`}
            >
              {kitTypeLabel(t)}
            </button>
          ))}
        </div>
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-pill bg-blue-600 px-4 py-2 text-label-lg text-white hover:bg-blue-700">
          {busy ? "Mengunggah…" : "Pilih file"}
          <input type="file" accept="application/pdf" disabled={busy} onChange={(e) => void onPick(e)} className="hidden" />
        </label>
        <span className="text-caption">Hanya file PDF, maksimal 20 MB. Bukan untuk foto atau video proyek.</span>
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
        description={toDelete ? `"${toDelete.fileName}" akan dihapus permanen dan tidak lagi bisa diunduh agen.` : undefined}
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
