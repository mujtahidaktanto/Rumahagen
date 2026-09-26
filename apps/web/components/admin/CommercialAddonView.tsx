"use client";

// components/admin/CommercialAddonView.tsx — Katalog Add-on (M14, wireframe 02-Admin/M14-Katalog-Addon): daftar + filter status + pencarian (client-side atas data yang sudah dimuat).
// Superadmin+Admin bisa Buat/Ubah/Aktifkan/Nonaktifkan; Manager view-only (dan RLS addons_select hanya menunjukkan baris 'active' untuknya, bukan draft/inactive).
import { useMemo, useState } from "react";
import { AddonFormDialog } from "@/components/admin/AddonFormDialog";
import { CatalogStatusToggle } from "@/components/admin/CatalogStatusToggle";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ErrorState } from "@/components/ui/States";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/Table";
import type { AddonCapacityType, AddonRow, AddonStatus, PromotionRow } from "@/lib/admin/commercial-catalog-data";
import type { Part } from "@/lib/agent/dashboard-data";

const CAPACITY_LABEL: Record<AddonCapacityType, string> = { listing_refresh: "Refresh Listing", learning_point: "Poin Belajar", listing_slot: "Slot Listing" };
const STATUS_LABEL: Record<AddonStatus, string> = { draft: "Draf", active: "Aktif", inactive: "Nonaktif" };
const STATUS_TONE: Record<AddonStatus, "neutral" | "success" | "warning"> = { draft: "neutral", active: "success", inactive: "warning" };

function formatRp(n: number | null): string {
  if (n == null || n <= 0) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

export function CommercialAddonView({ canManage, addons, promotions }: { canManage: boolean; addons: Part<AddonRow[]>; promotions: Part<PromotionRow[]> }) {
  const [filter, setFilter] = useState<"all" | AddonStatus>("all");
  const [q, setQ] = useState("");

  const rows = addons.ok ? addons.data : [];
  const activePromotions = promotions.ok ? promotions.data : [];

  const bySearch = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((a) => a.name.toLowerCase().includes(needle) || a.code.toLowerCase().includes(needle));
  }, [rows, q]);

  const counts = useMemo(() => {
    const c: Record<"all" | AddonStatus, number> = { all: bySearch.length, draft: 0, active: 0, inactive: 0 };
    for (const a of bySearch) c[a.status]++;
    return c;
  }, [bySearch]);

  const filtered = filter === "all" ? bySearch : bySearch.filter((a) => a.status === filter);

  return (
    <div className="flex w-full flex-col gap-4 p-4 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-headline">Katalog Add-on</h1>
          <p className="text-caption">Produk kuota dan poin yang dijual ke agen</p>
        </div>
        {canManage ? (
          <AddonFormDialog promotions={activePromotions} trigger={(open) => <Button onClick={open}>+ Buat Add-on</Button>} />
        ) : null}
      </div>

      <p className="text-body-md text-ink-500">
        Harga di sini adalah <strong>satu-satunya sumber harga</strong> pesanan; harga dari klien diabaikan. Add-on yang sudah punya pesanan tidak bisa diubah kode, masa berlaku, dan
        kapasitasnya, dan tidak bisa dihapus (nonaktifkan saja).
      </p>
      {!canManage ? <p className="rounded-sm bg-info-100 p-3 text-body-md text-info-600">Peran Manager hanya bisa melihat katalog. Mengubah hanya untuk Admin dan Superadmin.</p> : null}

      {!addons.ok ? (
        <ErrorState title="Katalog gagal dimuat" message="Muat ulang halaman ini beberapa saat lagi." />
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2.5">
              {(["all", "draft", "active", "inactive"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={filter === key}
                  onClick={() => setFilter(key)}
                  className={`rounded-pill border px-3.5 py-1.5 text-label-lg transition-colors ${
                    filter === key ? "border-blue-600 bg-blue-50 text-blue-700" : "border-ink-100 bg-white text-ink-500 hover:bg-ink-50"
                  }`}
                >
                  {key === "all" ? "Semua" : STATUS_LABEL[key]} <span className="text-ink-300">{counts[key]}</span>
                </button>
              ))}
            </div>
            <div className="ml-auto w-[260px]">
              <Input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama atau kode…" />
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-body-md text-ink-300">{rows.length === 0 ? "Belum ada add-on." : "Tidak ada add-on yang cocok."}</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Add-on</TH>
                  <TH>Harga</TH>
                  <TH>Isi</TH>
                  <TH>Berlaku</TH>
                  <TH>Pesanan</TH>
                  <TH>Status</TH>
                  <TH>Aksi</TH>
                </TR>
              </THead>
              <TBody>
                {filtered.map((a) => {
                  const caps = a.capacityType ? [`${CAPACITY_LABEL[a.capacityType]} ${a.capacityValue}`] : [];
                  for (const c of a.additionalCapacities) caps.push(`${CAPACITY_LABEL[c.capacity_type]} ${c.capacity_value}`);
                  const canActivate = (a.price ?? 0) > 0 && !!a.capacityType;
                  return (
                    <TR key={a.id}>
                      <TD>
                        <div className="max-w-[260px]">
                          <span className="block text-label-lg">{a.name}</span>
                          <span className="block font-mono text-caption">{a.code}</span>
                          {a.promotionName ? <Badge tone="warning">{a.promotionName}</Badge> : null}
                        </div>
                      </TD>
                      <TD>
                        {(a.price ?? 0) <= 0 ? <Badge tone="danger">Belum ada harga</Badge> : null}
                        <span className="ml-1 text-label-lg">{formatRp(a.price)}</span>
                      </TD>
                      <TD className="text-body-md">{caps.length ? caps.join(" + ") : "—"}</TD>
                      <TD className="text-body-md">{a.validityType === "days" ? `${a.validityDays} hari` : "Tanpa batas"}</TD>
                      <TD>
                        <span className="text-body-md">{a.orderCount}</span>
                        {a.termsLocked ? <span className="block text-caption">Syarat terkunci</span> : null}
                      </TD>
                      <TD>
                        <Badge tone={STATUS_TONE[a.status]}>{STATUS_LABEL[a.status]}</Badge>
                      </TD>
                      <TD>
                        {canManage ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <AddonFormDialog addon={a} promotions={activePromotions} trigger={(open) => (
                              <Button variant="secondary" size="sm" onClick={open}>
                                Ubah
                              </Button>
                            )} />
                            <CatalogStatusToggle
                              endpoint="/admin/commercial/addons"
                              id={a.id}
                              name={a.name}
                              isActive={a.status === "active"}
                              canActivate={canActivate}
                              activateBlockedReason={!canActivate ? ((a.price ?? 0) <= 0 ? "Belum ada harga" : "Belum ada kapasitas") : undefined}
                              activateDescription="Add-on tampil di katalog agen dan bisa dibeli dengan harga yang tersimpan sekarang."
                              deactivateDescription="Add-on hilang dari katalog dan tidak bisa dipesan lagi. Pesanan yang sudah ada tidak terpengaruh."
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
        </>
      )}
    </div>
  );
}
