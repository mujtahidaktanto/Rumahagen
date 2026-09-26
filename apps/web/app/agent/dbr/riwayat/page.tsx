// app/agent/dbr/riwayat/page.tsx — Riwayat Simulasi DBR (M07). ?tampil= memuat lebih banyak (kelipatan 10). Hanya simulasi milik sendiri.
import { DbrHistoryView } from "@/components/agent/DbrViews";
import { DBR_PAGE_SIZE, getDbrHistory } from "@/lib/agent/dbr-data";
import { parseOrderLimit } from "@/lib/agent/commercial-rules";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Riwayat Simulasi DBR | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DbrHistoryPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const tampil = parseOrderLimit((await searchParams).tampil, DBR_PAGE_SIZE);
  return <DbrHistoryView history={await getDbrHistory(user.id, tampil)} tampil={tampil} />;
}
