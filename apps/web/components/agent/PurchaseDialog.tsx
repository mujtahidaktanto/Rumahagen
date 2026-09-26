"use client";

// components/agent/PurchaseDialog.tsx — dialog beli bersama untuk add-on (Katalog Komersial) dan paket langganan Pro (Langganan Saya), wireframe 01-Agent/M14-Katalog-Komersial: Konfirmasi → Pesanan Dibuat →
// Diarahkan ke Pembayaran. Alur: POST /commercial/orders (harga, promosi, dan snapshot dihitung SERVER; klien hanya menyebut produk, pemilik, dan promosi yang tampak berlaku) lalu
// POST /commercial/orders/{id}/checkout → Snap redirect_url (hanya https milik Midtrans yang diikuti). Kunci idempotensi dibuat per kombinasi produk+pemilik+promosi, jadi mencoba ulang setelah gangguan
// jaringan tidak membuat pesanan ganda. Penawaran promosi bergantung pada cakupan (pribadi/organisasi), jadi dimuat ulang saat pemilik diganti.
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CheckCircleIcon, InfoIcon } from "@/components/ui/icons";
import { ApiClientError, api, newIdempotencyKey } from "@/lib/api-client";
import { displayedPrice, formatMoney, promotionIdToSend, safePaymentUrl, type Offer } from "@/lib/agent/commercial-rules";

export type PurchaseOwner = { id: string; name: string };
export type PurchaseProduct =
  | { kind: "addon"; id: string; name: string; lines: string[]; note: string; listPrice: number; offer: Offer | null; canPickOrg: boolean }
  | { kind: "plan"; id: string; name: string; lines: string[]; note: string; pricePersonal: number | null; priceOrganization: number | null; offer: Offer | null; canPickOrg: true };

type Props = {
  product: PurchaseProduct | null;
  onClose: () => void;
  /** Organisasi yang boleh dipilih sebagai pemilik (add-on: semua anggota aktif; paket: hanya leader). */
  owners: PurchaseOwner[];
  /** Alasan pilihan Organisasi tidak tersedia (mis. hanya anggota, belum bergabung); dipakai bila owners kosong. */
  orgUnavailableReason: string;
  defaultOrgId: string | null;
  /** Peringatan tambahan di langkah konfirmasi (mis. penumpukan masa aktif Pro). */
  warning?: string | null;
};

type Step = "confirm" | "created" | "redirecting";
type Created = { id: string; number: string; amount: number };

function errText(e: unknown, fallback: string) {
  return e instanceof ApiClientError && e.code !== "UNKNOWN_ERROR" && e.code !== "NETWORK_ERROR" ? e.message : fallback;
}

export function PurchaseDialog({ product, onClose, owners, orgUnavailableReason, defaultOrgId, warning }: Props) {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [step, setStep] = useState<Step>("confirm");
  const [created, setCreated] = useState<Created | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [offerLoading, setOfferLoading] = useState(false);
  const key = useRef<{ sig: string; value: string } | null>(null);

  // Produk baru = mulai dari awal. Pemilik bawaan = konteks aktif bila sah untuk produk ini.
  const productId = product?.id ?? null;
  useEffect(() => {
    if (!product) return;
    setStep("confirm");
    setCreated(null);
    setError(null);
    setOffer(product.offer);
    setOrgId(product.canPickOrg && defaultOrgId && owners.some((o) => o.id === defaultOrgId) ? defaultOrgId : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Penawaran promosi menurut cakupan yang dipilih (organisasi punya aturan dan harga sendiri).
  useEffect(() => {
    if (!product) return;
    if (!orgId) {
      setOffer(product.offer);
      return;
    }
    let live = true;
    setOfferLoading(true);
    const path = product.kind === "addon" ? "/commercial/catalog" : "/commercial/plans";
    api
      .get<{ id: string; promotion_offer: Offer | null }[]>(path, { organization_id: orgId, limit: 100 })
      .then((r) => live && setOffer(r.data.find((x) => x.id === product.id)?.promotion_offer ?? null))
      .catch(() => live && setOffer(null))
      .finally(() => live && setOfferLoading(false));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, productId]);

  if (!product) return <Dialog open={false} onClose={onClose} title="" children={null} />;

  const scopePrice = product.kind === "addon" ? product.listPrice : orgId ? product.priceOrganization : product.pricePersonal;
  const price = scopePrice === null ? null : displayedPrice(scopePrice, offer);
  const sellable = price !== null;
  const promoId = promotionIdToSend(offer);
  const owner = owners.find((o) => o.id === orgId);

  async function createOrder() {
    if (!product || !sellable) return;
    setBusy(true);
    setError(null);
    const sig = `${product.kind}:${product.id}:${orgId}:${promoId ?? ""}`;
    if (key.current?.sig !== sig) key.current = { sig, value: newIdempotencyKey() };
    try {
      const res = await api.post<{ id: string; order_number: string; amount: number | string }>(
        "/commercial/orders",
        { ...(product.kind === "addon" ? { addon_id: product.id } : { subscription_plan_id: product.id }), ...(orgId ? { organization_id: orgId } : {}), ...(promoId ? { promotion_id: promoId } : {}) },
        { idempotency: key.current.value },
      );
      setCreated({ id: res.data.id, number: res.data.order_number, amount: Number(res.data.amount) });
      setStep("created");
    } catch (e) {
      setError(errText(e, "Pesanan belum berhasil dibuat. Periksa koneksi Anda lalu coba lagi; tidak ada pembayaran yang diproses."));
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    if (!created) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api.post<{ redirect_url?: string }>(`/commercial/orders/${created.id}/checkout`, undefined, { idempotency: true });
      const url = safePaymentUrl(res.data.redirect_url);
      if (!url) {
        setError("Alamat pembayaran dari server tidak valid. Pesanan Anda tetap tersimpan; coba bayar lagi dari halaman Pesanan.");
        return;
      }
      setStep("redirecting");
      window.location.assign(url);
    } catch (e) {
      setError(errText(e, "Halaman pembayaran belum bisa dibuka. Pesanan Anda tetap tersimpan; coba bayar lagi dari halaman Pesanan."));
    } finally {
      setBusy(false);
    }
  }

  const close = () => (busy || step === "redirecting" ? undefined : onClose());

  return (
    <Dialog
      open
      onClose={close}
      title={step === "confirm" ? "Konfirmasi Pembelian" : step === "created" ? "Pesanan Dibuat" : "Diarahkan ke Pembayaran"}
      footer={
        step === "confirm" ? (
          <>
            <Button variant="secondary" disabled={busy} onClick={onClose}>
              Batal
            </Button>
            <Button loading={busy} disabled={!sellable || offerLoading} onClick={() => void createOrder()}>
              Buat Pesanan
            </Button>
          </>
        ) : step === "created" ? (
          <>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => {
                onClose();
                router.push("/agent/komersial/pesanan" as Route);
              }}
            >
              Bayar Nanti (Lihat Pesanan)
            </Button>
            <Button loading={busy} onClick={() => void pay()}>
              Lanjut ke Pembayaran
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        {step === "confirm" ? (
          <>
            <div>
              <p className="text-title-md">{product.name}</p>
              <ul className="mt-2 flex flex-col gap-1">
                {product.lines.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-body-md">
                    <CheckCircleIcon size={16} className="mt-0.5 flex-none text-success-600" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-label-lg">{product.kind === "plan" ? "Langganan untuk siapa?" : "Slot untuk siapa?"}</legend>
              {product.canPickOrg ? (
                <div role="radiogroup" aria-label="Pemilik" className="grid gap-2 sm:grid-cols-2">
                  <OwnerChoice checked={!orgId} title="Pribadi" onClick={() => setOrgId("")} />
                  <OwnerChoice checked={!!orgId} disabled={owners.length === 0} title="Organisasi" hint={owners.length === 0 ? orgUnavailableReason : owner ? owner.name : undefined} onClick={() => setOrgId(owners[0]!.id)} />
                </div>
              ) : (
                <p className="text-body-md">Pribadi — add-on ini masuk ke kuota pribadi Anda.</p>
              )}
              {orgId && owners.length > 1 ? (
                <select aria-label="Organisasi" value={orgId} onChange={(e) => setOrgId(e.target.value)} className="h-11 rounded-md border-[1.5px] border-ink-100 bg-white px-3 text-body-md">
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : null}
              <p className="text-caption">{orgId ? (product.kind === "plan" ? "Langganan menjadi milik organisasi dan berlaku untuk seluruh anggotanya." : "Slot masuk ke kuota organisasi dan dipakai bersama seluruh anggota aktif.") : product.kind === "plan" ? "Langganan menjadi milik akun Anda." : "Masuk ke kuota pribadi Anda."}</p>
            </fieldset>

            <p className="text-caption">{product.note}</p>
            {warning ? (
              <p role="note" className="flex items-start gap-2 rounded-md bg-warning-100 p-3 text-body-md">
                <InfoIcon size={16} className="mt-0.5 flex-none" />
                {warning}
              </p>
            ) : null}

            <div className="rounded-md bg-ink-50 p-4">
              <p className="text-caption">Total Pembayaran</p>
              {offerLoading ? (
                <p className="text-title-lg">Menghitung…</p>
              ) : price ? (
                <>
                  <p className="flex items-baseline gap-2">
                    <span className="text-title-lg text-blue-600">{formatMoney(price.amount)}</span>
                    {price.discounted ? <s className="text-body-md text-ink-500">{formatMoney(price.listPrice)}</s> : null}
                  </p>
                  {price.discounted ? <p className="text-caption text-success-600">Promosi berlaku</p> : price.note ? <p className="text-caption">Promosi tidak berlaku: {price.note}. Harga normal dipakai.</p> : null}
                </>
              ) : (
                <p role="alert" className="text-body-md text-danger-600">
                  {orgId ? "Paket ini belum dijual untuk organisasi." : "Paket ini belum dijual."}
                </p>
              )}
              <p className="mt-2 text-caption">Harga ditentukan platform, bukan diisi manual — nominal final dikonfirmasi di halaman pembayaran Midtrans.</p>
            </div>
          </>
        ) : null}

        {step === "created" && created ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <CheckCircleIcon size={36} className="text-success-600" />
            <p className="text-body-md">
              Nomor pesanan <strong>{created.number}</strong> · {formatMoney(created.amount)}. Lanjutkan ke pembayaran via Midtrans untuk mengaktifkan {product.kind === "plan" ? "langganan" : "add-on"} Anda.
            </p>
          </div>
        ) : null}

        {step === "redirecting" ? <p className="py-4 text-center text-body-md">Anda akan diarahkan ke halaman pembayaran Midtrans. Status pesanan diperbarui setelah pembayaran terverifikasi; lihat di halaman Pesanan & Kuota.</p> : null}

        {error ? (
          <p role="alert" className="text-body-md text-danger-600">
            {error}
          </p>
        ) : null}
      </div>
    </Dialog>
  );
}

function OwnerChoice({ checked, title, hint, disabled, onClick }: { checked: boolean; title: string; hint?: string; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-11 w-full flex-col gap-0.5 rounded-md border-[1.5px] p-3 text-left disabled:cursor-not-allowed disabled:opacity-60 ${checked ? "border-blue-600 bg-blue-50" : "border-ink-100 bg-white hover:border-blue-500"}`}
    >
      <span className="text-label-lg text-ink-900">{title}</span>
      {hint ? <span className="text-caption">{hint}</span> : null}
    </button>
  );
}
