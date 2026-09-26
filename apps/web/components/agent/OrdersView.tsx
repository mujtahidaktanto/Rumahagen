// components/agent/OrdersView.tsx — Pesanan & Kuota Saya (M14, wireframe 01-Agent/M14-Pesanan-Kuota): saldo yang bisa dipakai (Refresh add-on, slot listing), entitlement, dan riwayat pesanan dengan Bayar
// Sekarang/Batalkan untuk pesanan pending. Tiap bagian punya keadaan kosong/gagal sendiri; keadaan memuat = loading.tsx. Sisa per entitlement tidak dibuka API, jadi kartu entitlement menampilkan kapasitas
// yang diberikan, status, dan masa berlaku; saldo terpakai/sisa yang sah hanya ditampilkan pada dua kartu saldo di atas.
import Link from "next/link";
import type { Route } from "next";
import { CommercialTabs } from "@/components/agent/CommercialTabs";
import { OrderActions } from "@/components/agent/OrderActions";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { ORDER_PAGE_SIZE, type OrdersData } from "@/lib/agent/commercial-data";
import { canPayOrCancel, entitlementCapacityLabel, entitlementExpiry, entitlementLabel, entitlementStatus, formatMoney, orderStatus } from "@/lib/agent/commercial-rules";
import { formatDate } from "@/lib/format";

const nf = new Intl.NumberFormat("id-ID");

function Card({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3.5 rounded-md border border-ink-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-title-md">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  );
}

function Balance({ label, value, hint }: { label: string; value: number | null; hint: string }) {
  return (
    <div className="rounded-md border border-ink-100 bg-white p-4">
      <p className="text-caption">{label}</p>
      <p className="text-headline">{value === null ? "—" : nf.format(value)}</p>
      <p className="text-caption">{hint}</p>
    </div>
  );
}

export function OrdersView({ data, tampil }: { data: OrdersData; tampil: number }) {
  const orders = data.orders.ok ? data.orders.data : null;
  const ents = data.entitlements.ok ? data.entitlements.data : null;
  const bal = data.balances.ok ? data.balances.data : null;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 p-4 lg:p-8">
      <h1 className="text-headline">Komersial</h1>
      <CommercialTabs active="pesanan" />

      <section aria-label="Saldo" className="grid gap-3 sm:grid-cols-2">
        <Balance label="Saldo Refresh Listing (add-on)" value={bal ? bal.refreshStock : null} hint="Dipakai setelah jatah harian dan bonus habis. Tidak kedaluwarsa." />
        <Balance label="Slot Listing Beli (pribadi)" value={bal ? bal.slotBalance : null} hint="Dipakai setelah kuota Gratis dan Pro. Slot organisasi ada di halaman Organisasi." />
        {!data.balances.ok ? (
          <p role="alert" className="text-body-md text-danger-600 sm:col-span-2">
            Saldo gagal dimuat. Muat ulang halaman beberapa saat lagi.
          </p>
        ) : null}
      </section>

      <Card title="Kuota & Entitlement" right={ents ? <span className="text-caption">{ents.length} entitlement</span> : undefined}>
        {!ents ? (
          <ErrorState title="Entitlement gagal dimuat" message="Muat ulang halaman beberapa saat lagi." className="py-6" />
        ) : ents.length === 0 ? (
          <EmptyState title="Belum ada entitlement" message="Entitlement muncul setelah pembelian add-on terkonfirmasi." className="py-6" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ents.map((e) => {
              const st = entitlementStatus(e.status);
              return (
                <li key={e.id} className="flex flex-col gap-1.5 rounded-sm border border-ink-100 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-label-lg break-words">{entitlementLabel(e.type)}</span>
                    <Badge tone={st.tone} className="flex-none">
                      {st.label}
                    </Badge>
                  </div>
                  <span className="text-title-md">{entitlementCapacityLabel(e.type, e.capacity)}</span>
                  <span className="text-caption">{entitlementExpiry({ ends_at: e.endsAt, lifecycle_status: e.status }, formatDate)}</span>
                  {e.ownerOrg ? <span className="text-caption">Milik organisasi {e.ownerOrg}</span> : null}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card title="Riwayat Pesanan" right={orders ? <span className="text-caption">{nf.format(orders.total)} pesanan</span> : undefined}>
        {!orders ? (
          <>
            <ErrorState title="Pesanan gagal dimuat" message="Terjadi gangguan saat mengambil pesanan Anda. Tidak ada pembayaran yang berubah." className="py-6" />
            <div className="flex justify-center">
              <LinkButton href={"/agent/komersial/pesanan" as Route} variant="secondary" size="sm">
                Coba Lagi
              </LinkButton>
            </div>
          </>
        ) : orders.items.length === 0 ? (
          <>
            <EmptyState title="Belum ada pesanan" message="Pesanan add-on dan paket Pro Anda akan tampil di sini." className="py-6" />
            <div className="flex justify-center">
              <LinkButton href={"/agent/komersial" as Route} size="sm">
                Jelajahi Katalog
              </LinkButton>
            </div>
          </>
        ) : (
          <>
            <ul>
              {orders.items.map((o) => {
                const st = orderStatus(o.status);
                return (
                  <li key={o.id} className="flex flex-wrap items-center gap-3 border-b border-ink-50 py-3.5 last:border-b-0">
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="text-label-lg break-words">{o.name}</span>
                      <span className="text-caption break-words">
                        {o.kind} · {o.orderNumber} · {formatDate(o.placedAt)} · {formatMoney(o.amount)}
                        {o.ownerOrg ? ` · ${o.ownerOrg}` : ""}
                      </span>
                    </div>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    {canPayOrCancel(o.status) ? <OrderActions orderId={o.id} orderNumber={o.orderNumber} /> : null}
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-col items-center gap-2.5 pt-1">
              <span className="text-caption">
                Menampilkan {orders.items.length} dari {nf.format(orders.total)} pesanan
              </span>
              {orders.items.length < orders.total ? (
                <LinkButton href={`/agent/komersial/pesanan?tampil=${tampil + ORDER_PAGE_SIZE}` as Route} variant="secondary">
                  Muat Lebih Banyak
                </LinkButton>
              ) : null}
            </div>
          </>
        )}
      </Card>

      <p className="text-caption">
        Sudah membayar tetapi status belum berubah? Konfirmasi dari Midtrans bisa butuh beberapa menit;{" "}
        <Link href={"/agent/komersial/pesanan" as Route} className="font-bold">
          muat ulang halaman ini
        </Link>
        .
      </p>
    </div>
  );
}
