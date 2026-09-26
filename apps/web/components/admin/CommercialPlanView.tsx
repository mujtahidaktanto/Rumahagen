"use client";

// components/admin/CommercialPlanView.tsx — Paket Langganan (M14, wireframe 02-Admin/M14-Katalog-Paket). Superadmin+Admin bisa Buat/Ubah/Aktifkan/Nonaktifkan; Manager view-only (RLS
// subscription_plans_select hanya menunjukkan baris 'active' untuknya).
import { PlanFormDialog } from "@/components/admin/PlanFormDialog";
import { CatalogStatusToggle } from "@/components/admin/CatalogStatusToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { PlanRow, PlanStatus, PromotionRow } from "@/lib/admin/commercial-catalog-data";
import type { Part } from "@/lib/agent/dashboard-data";

const STATUS_LABEL: Record<PlanStatus, string> = { draft: "Draf", active: "Aktif", inactive: "Nonaktif" };
const STATUS_TONE: Record<PlanStatus, "neutral" | "success" | "warning"> = { draft: "neutral", active: "success", inactive: "warning" };

function formatRp(n: number | null): string {
  if (n == null || n <= 0) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function CommercialPlanView({ canManage, plans, promotions }: { canManage: boolean; plans: Part<PlanRow[]>; promotions: Part<PromotionRow[]> }) {
  const activePromotions = promotions.ok ? promotions.data : [];

  return (
    <div className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Paket Langganan</h1>
          <p className="text-caption">Paket Pro yang dijual ke agen dan organisasi</p>
        </div>
        {canManage ? <PlanFormDialog promotions={activePromotions} trigger={(open) => <Button onClick={open}>+ Buat Paket</Button>} /> : null}
      </div>

      {!canManage ? <p className="rounded-sm bg-info-100 p-3 text-body-md text-info-600">Peran Manager hanya bisa melihat katalog. Mengubah hanya untuk Admin dan Superadmin.</p> : null}

      {!plans.ok ? (
        <ErrorState title="Katalog paket gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : plans.data.length === 0 ? (
        <p className="py-12 text-center text-body-md text-ink-300">Belum ada paket langganan.</p>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Paket</TH>
              <TH>Durasi</TH>
              <TH>Harga pribadi</TH>
              <TH>Harga organisasi</TH>
              <TH>Terjual</TH>
              <TH>Status</TH>
              <TH>Aksi</TH>
            </TR>
          </THead>
          <TBody>
            {plans.data.map((p) => {
              const canActivate = (p.pricePersonal ?? 0) > 0 || (p.priceOrganization ?? 0) > 0;
              return (
                <TR key={p.id}>
                  <TD>
                    <div className="max-w-[260px]">
                      <span className="block text-label-lg">{p.name}</span>
                      <span className="block font-mono text-caption">{p.code}</span>
                      {p.promotionName ? <Badge tone="warning">{p.promotionName}</Badge> : null}
                    </div>
                  </TD>
                  <TD className="text-body-md">{p.durationMonths} bulan</TD>
                  <TD>
                    {(p.pricePersonal ?? 0) <= 0 ? <Badge tone="neutral">Tidak dijual</Badge> : null}
                    <span className="ml-1 text-label-lg">{formatRp(p.pricePersonal)}</span>
                  </TD>
                  <TD>
                    {(p.priceOrganization ?? 0) <= 0 ? <Badge tone="neutral">Tidak dijual</Badge> : null}
                    <span className="ml-1 text-label-lg">{formatRp(p.priceOrganization)}</span>
                  </TD>
                  <TD className="text-body-md">{p.orderCount}</TD>
                  <TD>
                    <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABEL[p.status]}</Badge>
                  </TD>
                  <TD>
                    {canManage ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <PlanFormDialog
                          plan={p}
                          promotions={activePromotions}
                          trigger={(open) => (
                            <Button variant="secondary" size="sm" onClick={open}>
                              Ubah
                            </Button>
                          )}
                        />
                        <CatalogStatusToggle
                          endpoint="/admin/commercial/plans"
                          id={p.id}
                          name={p.name}
                          isActive={p.status === "active"}
                          canActivate={canActivate}
                          activateBlockedReason={!canActivate ? "Belum ada harga" : undefined}
                          activateDescription="Paket tampil di katalog dan bisa dibeli dengan harga yang tersimpan sekarang."
                          deactivateDescription="Paket hilang dari katalog dan tidak bisa dibeli lagi. Langganan yang sudah ada tidak terpengaruh."
                        />
                      </div>
                    ) : null}
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      )}
    </div>
  );
}
