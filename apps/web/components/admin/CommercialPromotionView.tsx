"use client";

// components/admin/CommercialPromotionView.tsx — Promosi (M14, wireframe 02-Admin/M14-Promosi-Admin). RLS promotions_manage (FOR ALL, m14.commercial_administration.configure) TIDAK punya
// select policy terpisah — Manager benar-benar tidak bisa melihat promosi sama sekali (berbeda dari Katalog Add-on/Paket yang setidaknya lihat baris 'active'), jadi ditolak eksplisit di sini.
import { useMemo, useState } from "react";
import { PromotionFormDialog } from "@/components/admin/PromotionFormDialog";
import { CatalogStatusToggle } from "@/components/admin/CatalogStatusToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { PromotionEffectiveStatus, PromotionRow, PromotionStatus } from "@/lib/admin/commercial-catalog-data";
import type { Part } from "@/lib/agent/dashboard-data";

const dtf = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" });
const STATUS_LABEL: Record<PromotionStatus, string> = { draft: "Draf", active: "Aktif", inactive: "Nonaktif", expired: "Kedaluwarsa" };
const EFFECTIVE_LABEL: Record<PromotionEffectiveStatus, string> = { draft: "Draf", scheduled: "Terjadwal", active: "Aktif", expired: "Kedaluwarsa", inactive: "Nonaktif" };
const EFFECTIVE_TONE: Record<PromotionEffectiveStatus, "neutral" | "info" | "success" | "danger" | "warning"> = { draft: "neutral", scheduled: "info", active: "success", expired: "danger", inactive: "warning" };

function formatRp(n: number): string {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

function window(from: string | null, to: string | null): string {
  if (from && to) return `${dtf.format(new Date(from))} – ${dtf.format(new Date(to))}`;
  if (from) return `Sejak ${dtf.format(new Date(from))}`;
  if (to) return `Sampai ${dtf.format(new Date(to))}`;
  return "Tanpa batas waktu";
}

export function CommercialPromotionView({ canView, canManage, promotions }: { canView: boolean; canManage: boolean; promotions: Part<PromotionRow[]> }) {
  const [filter, setFilter] = useState<"all" | PromotionStatus>("all");
  const [q, setQ] = useState("");

  const rows = promotions.ok ? promotions.data : [];
  const bySearch = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((p) => p.name.toLowerCase().includes(needle) || p.code.toLowerCase().includes(needle));
  }, [rows, q]);
  const filtered = filter === "all" ? bySearch : bySearch.filter((p) => p.status === filter);

  if (!canView) {
    return (
      <div className="mx-auto flex w-full max-w-[800px] flex-col items-center gap-3 p-4 py-20 text-center lg:p-8">
        <h1 className="text-title-lg">Akses Ditolak</h1>
        <p className="max-w-[420px] text-body-md text-ink-500">Promosi hanya untuk Admin dan Superadmin — Manager tidak diberi akses lihat sama sekali (tidak ada RLS select policy terpisah untuk tabel ini).</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Promosi</h1>
          <p className="text-caption">Potongan harga untuk add-on dan paket langganan</p>
        </div>
        {canManage ? <PromotionFormDialog trigger={(open) => <Button onClick={open}>+ Buat Promosi</Button>} /> : null}
      </div>

      <p className="text-body-md text-ink-500">
        Promosi memotong harga <strong>pesanan baru</strong> dan dihitung server; pesanan lama tidak berubah. Promosi yang dipakai add-on atau paket langganan tidak bisa dihapus (nonaktifkan
        saja).
      </p>

      {!promotions.ok ? (
        <ErrorState title="Promosi gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2.5">
              {(["all", "draft", "active", "inactive", "expired"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`rounded-pill border px-3.5 py-1.5 text-label-lg transition-colors ${
                    filter === key ? "border-blue-600 bg-blue-50 text-blue-700" : "border-ink-100 bg-white text-ink-500 hover:bg-ink-50"
                  }`}
                >
                  {key === "all" ? "Semua" : STATUS_LABEL[key]}
                </button>
              ))}
            </div>
            <div className="ml-auto w-[260px]">
              <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau kode…" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-body-md text-ink-300">{rows.length === 0 ? "Belum ada promosi." : "Tidak ada promosi yang cocok."}</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Promosi</TH>
                  <TH>Potongan</TH>
                  <TH>Masa berlaku</TH>
                  <TH>Pemakaian</TH>
                  <TH>Dipakai oleh</TH>
                  <TH>Status</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((p) => (
                  <TR key={p.id}>
                    <TD>
                      <div className="max-w-[280px]">
                        <span className="block text-label-lg">{p.name}</span>
                        <span className="block font-mono text-caption">{p.code}</span>
                      </div>
                    </TD>
                    <TD className="text-label-lg">{p.percentOff ? `${p.percentOff}%` : p.amountOff ? formatRp(p.amountOff) : "—"}</TD>
                    <TD className="whitespace-nowrap text-body-md">{window(p.validFrom, p.validTo)}</TD>
                    <TD className="text-body-md">
                      {p.redemptionCount}
                      {p.maxRedemptions ? ` / ${p.maxRedemptions}` : ""}
                      {p.maxRedemptions && p.redemptionCount >= p.maxRedemptions ? <Badge tone="danger">Kuota habis</Badge> : null}
                    </TD>
                    <TD className="text-body-md">{p.linkedAddonCount + p.linkedPlanCount === 0 ? "—" : `${p.linkedAddonCount} add-on, ${p.linkedPlanCount} paket`}</TD>
                    <TD>
                      <Badge tone={EFFECTIVE_TONE[p.effectiveStatus]}>{EFFECTIVE_LABEL[p.effectiveStatus]}</Badge>
                    </TD>
                    <TD>
                      {canManage ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <PromotionFormDialog
                            promotion={p}
                            trigger={(open) => (
                              <Button variant="secondary" size="sm" onClick={open}>
                                Ubah
                              </Button>
                            )}
                          />
                          <CatalogStatusToggle
                            endpoint="/admin/commercial/promotions"
                            id={p.id}
                            name={p.name}
                            isActive={p.status === "active"}
                            canActivate
                            activateDescription="Potongan berlaku untuk pesanan baru pada add-on/paket yang memakai promosi ini, selama masa berlakunya."
                            deactivateDescription="Pesanan baru tidak lagi mendapat potongan ini. Pesanan yang sudah dibuat tidak berubah."
                          />
                        </div>
                      ) : null}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
