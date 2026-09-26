// app/agent/dbr/page.tsx — Kalkulator DBR Agent (M07). Bank aktif dimuat di server; perhitungan lewat POST /api/dbr-simulations dari komponen klien.
import { DbrCalculatorView } from "@/components/agent/DbrViews";
import { getActiveBanks } from "@/lib/agent/dbr-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kalkulator DBR | RumahAgen" };

export default async function DbrPage() {
  await requireArea("agent");
  return <DbrCalculatorView banks={await getActiveBanks()} />;
}
