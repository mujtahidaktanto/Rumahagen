"use client";

// components/admin/DeveloperLegalDocsDialog.tsx — panel staf untuk MELIHAT berkas legalitas developer partner (Proyek Developer, tab Developer Partner).
// Baca-saja: memuat GET /developer-partners/{id}/legal-documents saat dialog dibuka (lazy, bukan di server list) -- otorisasi sepenuhnya lewat RLS
// developer_legal_documents_manage (migration 0172, staf m06.developer_partner.manage sudah termasuk). Pola unggah+hapus ada di
// components/partner/DeveloperLegalDocsPanel.tsx (sisi developer sendiri), sengaja TIDAK diulang di sini -- staf hanya melihat.
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { DocIcon } from "@/components/ui/icons";
import { formatDateTime } from "@/lib/format";
import { api } from "@/lib/api-client";

type DocRow = { id: string; document_name: string; download_url: string | null; created_at: string };
type Loaded = { ok: true; items: DocRow[] } | { ok: false };

export function DeveloperLegalDocsDialog({ partnerId, companyName, trigger }: { partnerId: string; companyName: string; trigger: (open: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  async function openDialog() {
    setOpen(true);
    setLoaded(null);
    try {
      const res = await api.get<DocRow[]>(`/developer-partners/${partnerId}/legal-documents`);
      setLoaded({ ok: true, items: res.data ?? [] });
    } catch {
      setLoaded({ ok: false });
    }
  }

  return (
    <>
      {trigger(() => void openDialog())}
      <Dialog open={open} onClose={() => setOpen(false)} title="Berkas Legalitas" description={companyName}>
        {!loaded ? (
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : !loaded.ok ? (
          <ErrorState title="Berkas gagal dimuat" message="Muat ulang beberapa saat lagi." />
        ) : loaded.items.length === 0 ? (
          <div className="py-8 text-center">
            <DocIcon size={28} />
            <p className="mt-2 text-body-md text-ink-500">Belum ada berkas legalitas diunggah.</p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-50 rounded-md border border-ink-100">
            {loaded.items.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <span className="block truncate text-body-md text-ink-900">{d.document_name}</span>
                  <p className="text-caption">Diunggah {formatDateTime(d.created_at)}</p>
                </div>
                {d.download_url ? (
                  <a href={d.download_url} target="_blank" rel="noreferrer" className="rounded-pill border-[1.5px] border-ink-100 px-3.5 py-1.5 text-[13px] font-bold text-blue-600 hover:border-blue-500">
                    Unduh
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Dialog>
    </>
  );
}
