"use client";

// components/agent/CatalogGrid.tsx — kartu add-on Katalog Komersial (wireframe 01-Agent/M14-Katalog-Komersial) dan dialog beli. Data (harga, kapasitas, penawaran promosi) datang dari server; kartu hanya membuka
// PurchaseDialog. Harga di kartu adalah tampilan: pesanan menghitung ulang harga di server.
import { useState } from "react";
import { PurchaseDialog, type PurchaseProduct } from "@/components/agent/PurchaseDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon } from "@/components/ui/icons";
import type { CatalogAddon, OwnerOption } from "@/lib/agent/commercial-data";
import { capacityLabel, displayedPrice, formatMoney } from "@/lib/agent/commercial-rules";

export function CatalogGrid({ addons, orgs, defaultOrgId }: { addons: CatalogAddon[]; orgs: OwnerOption[]; defaultOrgId: string | null }) {
  const [selected, setSelected] = useState<CatalogAddon | null>(null);

  const product: PurchaseProduct | null = selected
    ? { kind: "addon", id: selected.id, name: selected.name, lines: selected.capacities.map(capacityLabel), note: selected.validityLabel, listPrice: selected.price, offer: selected.offer, canPickOrg: selected.hasSlot }
    : null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {addons.map((a) => {
          const p = displayedPrice(a.price, a.offer);
          return (
            <li key={a.id} className="relative flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
              {p.discounted ? <Badge tone="danger" className="absolute top-3 right-3">Promo</Badge> : null}
              <div className="flex flex-col gap-1 pr-16">
                <span className="text-caption">{a.hasSlot ? "Kuota Listing" : "Add-on"}</span>
                <h2 className="text-title-md break-words">{a.name}</h2>
              </div>
              <ul className="flex flex-col gap-1">
                {a.capacities.map((c) => (
                  <li key={`${c.type}-${c.value}`} className="flex items-start gap-2 text-body-md">
                    <CheckCircleIcon size={16} className="mt-0.5 flex-none text-success-600" />
                    {capacityLabel(c)}
                  </li>
                ))}
              </ul>
              <p className="text-caption">{a.validityLabel}</p>
              <div className="mt-auto flex items-end justify-between gap-3 pt-2">
                <div>
                  {p.discounted ? <s className="block text-caption">{formatMoney(p.listPrice)}</s> : null}
                  <span className="text-title-lg text-blue-600">{formatMoney(p.amount)}</span>
                </div>
                <Button onClick={() => setSelected(a)}>Beli Add-on</Button>
              </div>
            </li>
          );
        })}
      </ul>
      <PurchaseDialog
        product={product}
        onClose={() => setSelected(null)}
        owners={orgs}
        orgUnavailableReason="Opsi organisasi muncul bila Anda anggota aktif sebuah organisasi."
        defaultOrgId={defaultOrgId}
      />
    </>
  );
}
