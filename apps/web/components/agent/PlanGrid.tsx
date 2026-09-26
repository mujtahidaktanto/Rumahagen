"use client";

// components/agent/PlanGrid.tsx — kartu paket Pro (M14 Langganan Saya, wireframe 01-Agent/M14-Langganan-Saya) dan dialog beli. Harga per cakupan: pribadi dan organisasi (hanya leader yang bisa membeli
// langganan organisasi). Beli lagi = pembelian baru (masa aktif ditumpuk, kuota Pro direset; tidak ada perpanjangan). Harga tampilan hanya informasi: server menghitung ulang saat pesanan dibuat.
import { useState } from "react";
import { PurchaseDialog, type PurchaseProduct } from "@/components/agent/PurchaseDialog";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon } from "@/components/ui/icons";
import type { OwnerOption, PlanItem } from "@/lib/agent/commercial-data";
import { displayedPrice, durationLabel, formatMoney } from "@/lib/agent/commercial-rules";

type Props = {
  plans: PlanItem[];
  leaderOrgs: OwnerOption[];
  /** Jumlah organisasi tempat pengguna hanya anggota biasa (menentukan alasan Organisasi tidak tersedia). */
  memberOnlyOrgs: number;
  defaultOrgId: string | null;
  /** Peringatan penumpukan bila masih ada langganan Pro aktif. */
  stackWarning: string | null;
};

function PriceLine({ label, price, offer }: { label: string; price: number | null; offer: PlanItem["offer"] }) {
  if (price === null) {
    return (
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-body-md">{label}</span>
        <span className="text-caption">Tidak dijual</span>
      </div>
    );
  }
  const p = displayedPrice(price, label === "Pribadi" ? offer : null);
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-body-md">{label}</span>
      <span className="flex items-baseline gap-2">
        {p.discounted ? <s className="text-caption">{formatMoney(p.listPrice)}</s> : null}
        <span className="text-title-md text-blue-600">{formatMoney(p.amount)}</span>
      </span>
    </div>
  );
}

export function PlanGrid({ plans, leaderOrgs, memberOnlyOrgs, defaultOrgId, stackWarning }: Props) {
  const [selected, setSelected] = useState<PlanItem | null>(null);

  const product: PurchaseProduct | null = selected
    ? {
        kind: "plan",
        id: selected.id,
        name: selected.name,
        lines: [`Masa aktif ${durationLabel(selected.durationMonths)}`, "Menambah kuota penerbitan listing di atas kuota Gratis", "Kuota Pro reset tiap siklus bulanan sejak pembelian"],
        note: "Kuota Pro dihitung dari pembelian ini dan reset tiap siklus bulanan (Pro Tahunan juga bulanan). Kuota Gratis tetap reset tanggal 1.",
        pricePersonal: selected.pricePersonal,
        priceOrganization: selected.priceOrganization,
        offer: selected.offer,
        canPickOrg: true,
      }
    : null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => {
          const promo = p.offer?.eligible && p.pricePersonal !== null && p.offer.final_amount < p.pricePersonal;
          return (
            <li key={p.id} className="relative flex flex-col gap-3 rounded-md border border-ink-100 bg-white p-5">
              {promo ? <Badge tone="danger" className="absolute top-3 right-3">Promo</Badge> : null}
              <div className="flex flex-col gap-1 pr-16">
                <span className="text-caption">Paket Pro · {durationLabel(p.durationMonths)}</span>
                <h3 className="text-title-md break-words">{p.name}</h3>
                {p.description ? <p className="text-body-md break-words text-ink-500">{p.description}</p> : null}
              </div>
              <div className="flex flex-col gap-1.5 rounded-sm bg-ink-50 p-3">
                <PriceLine label="Pribadi" price={p.pricePersonal} offer={p.offer} />
                <PriceLine label="Organisasi" price={p.priceOrganization} offer={null} />
              </div>
              <ul className="flex flex-col gap-1">
                {["Ditambahkan di atas kuota Gratis", "Kuota Pro reset tiap siklus bulanan"].map((l) => (
                  <li key={l} className="flex items-start gap-2 text-body-md">
                    <CheckCircleIcon size={16} className="mt-0.5 flex-none text-success-600" />
                    {l}
                  </li>
                ))}
              </ul>
              <Button className="mt-auto" onClick={() => setSelected(p)}>
                Beli {p.name}
              </Button>
            </li>
          );
        })}
      </ul>
      <PurchaseDialog
        product={product}
        onClose={() => setSelected(null)}
        owners={leaderOrgs}
        orgUnavailableReason={memberOnlyOrgs > 0 ? "Hanya leader organisasi yang bisa membeli langganan organisasi." : "Anda belum menjadi leader organisasi mana pun."}
        defaultOrgId={defaultOrgId}
        warning={stackWarning}
      />
    </>
  );
}
