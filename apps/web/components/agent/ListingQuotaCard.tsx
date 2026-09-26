// components/agent/ListingQuotaCard.tsx — kartu "Kuota Penerbitan" di Listing Saya (dan ringkasan di Wizard): tiga jatah (Gratis, Pro, Slot beli) dengan bilah pemakaian, urutan pakai
// Gratis -> Pro -> Slot beli, dan peringatan menipis/habis. Keadaan gagal: pesan singkat (penyusunan listing tetap boleh; kuota diperiksa saat menerbitkan). Tautan Beli Slot/Paket Pro
// menuju layar Komersial (Fase 4) dan sementara nonaktif.
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";
import { bucketPercent, bucketTone, formatResetWIB, quotaLevel, quotaTotalLine, quotaValidityLine } from "@/lib/agent/listing-quota";
import type { Part } from "@/lib/agent/listing-data";
import type { ListingQuotaSummary } from "@/lib/validation/listing-quota";

const BAR = { danger: "bg-danger-600", warning: "bg-warning-600", blue: "bg-blue-600" } as const;

function Bucket({ label, used, limit, resetLine }: { label: string; used: number; limit: number; resetLine: string }) {
  const pct = bucketPercent(used, limit);
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-label-lg">{label}</span>
      <div role="progressbar" aria-label={`${label}: ${used} dari ${limit} terpakai`} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used} className="h-2 overflow-hidden rounded-full bg-ink-100">
        <div className={`h-full rounded-full ${BAR[bucketTone(used, limit)]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-body-md">{used} dari {limit} terpakai</span>
      <span className="text-caption">{resetLine}</span>
    </div>
  );
}

function Soon({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-label-lg text-ink-500">
      {children}
      <Badge tone="neutral" dot={false}>
        segera hadir
      </Badge>
    </span>
  );
}

export function ListingQuotaCard({ quota }: { quota: Part<ListingQuotaSummary> }) {
  if (!quota.ok) {
    return (
      <div role="alert" className="flex items-start gap-3 rounded-md border border-warning-600/30 bg-warning-100 p-4">
        <AlertIcon size={18} className="mt-0.5 flex-none text-warning-600" />
        <p className="text-body-md text-ink-900">Kuota penerbitan gagal dimuat. Anda tetap bisa menyusun listing; kuota diperiksa saat menerbitkan.</p>
      </div>
    );
  }
  const q = quota.data;
  const level = quotaLevel(q.total_remaining);
  const scopeLabel = q.scope === "organization" ? "Organisasi (dipakai bersama anggota)" : "Pribadi";
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-title-md">Kuota Penerbitan — {scopeLabel}</h2>
        <Badge tone={level === "penuh" ? "danger" : level === "hampir_habis" ? "warning" : "info"}>{quotaTotalLine(q)}</Badge>
      </div>

      {level === "penuh" ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger-600/30 bg-danger-100 p-3.5">
          <p className="text-body-md text-ink-900">
            <strong>Kuota habis.</strong> Semua jatah kuota {q.scope === "organization" ? "organisasi" : "pribadi"} terpakai. Listing baru hanya bisa disimpan sebagai draf sampai kuota tersedia.
          </p>
          <div className="flex gap-3">
            <Soon>Beli Slot Listing</Soon>
            <Soon>Lihat Paket Pro</Soon>
          </div>
        </div>
      ) : level === "hampir_habis" ? (
        <p role="status" className="rounded-md bg-warning-100 p-3 text-body-md text-ink-900">
          Sisa jatah menipis ({q.total_remaining}). Kuota tidak dibawa ke bulan berikutnya.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-3">
        <Bucket label="Gratis" used={q.free.used} limit={q.free.limit} resetLine={q.free.resets_at ? `Reset ${formatResetWIB(q.free.resets_at)}` : ""} />
        {q.pro.active ? (
          <Bucket label="Pro" used={q.pro.used} limit={q.pro.limit} resetLine={q.pro.resets_at ? `Reset ${formatResetWIB(q.pro.resets_at)} (siklus bulanan langganan)` : ""} />
        ) : (
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="text-label-lg">Pro</span>
            <span className="text-body-md text-ink-500">Belum berlangganan Pro: tambah jatah per siklus bulanan di atas kuota gratis.</span>
            <Soon>Lihat paket Pro</Soon>
          </div>
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="text-label-lg">Slot beli</span>
          <span className="text-title-md">{q.purchased.balance} slot tersisa</span>
          <span className="text-caption">Slot beli tidak reset dan tidak kedaluwarsa sebelum dipakai; dipakai terakhir setelah Gratis dan Pro.</span>
          <Soon>Beli slot listing</Soon>
        </div>
      </div>
      <p className="text-caption">{quotaValidityLine(q)} Urutan pemakaian: Gratis → Pro → Slot beli.</p>
    </Card>
  );
}
