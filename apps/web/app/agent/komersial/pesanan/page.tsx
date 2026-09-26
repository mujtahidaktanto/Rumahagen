// app/agent/komersial/pesanan/page.tsx — Pesanan & Kuota Saya (M14). ?tampil= memuat lebih banyak pesanan (kelipatan 10). Data di server; Bayar/Batalkan lewat komponen klien.
import { OrdersView } from "@/components/agent/OrdersView";
import { ORDER_PAGE_SIZE, getOrdersData } from "@/lib/agent/commercial-data";
import { parseOrderLimit } from "@/lib/agent/commercial-rules";
import { getMyContextOrgs } from "@/lib/agent/shell-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pesanan & Kuota | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function OrdersPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const tampil = parseOrderLimit((await searchParams).tampil, ORDER_PAGE_SIZE);
  const data = await getOrdersData(user.id, await getMyContextOrgs(user.id), tampil);
  return <OrdersView data={data} tampil={tampil} />;
}
