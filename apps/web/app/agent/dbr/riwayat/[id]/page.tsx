// app/agent/dbr/riwayat/[id]/page.tsx — Detail Simulasi DBR (M07). Hanya pemilik; milik orang lain/tidak ada = "tidak ditemukan".
import { notFound } from "next/navigation";
import { DbrDetailView } from "@/components/agent/DbrViews";
import { getDbrSimulation } from "@/lib/agent/dbr-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Detail Simulasi DBR | RumahAgen" };

type Props = { params: Promise<{ id: string }> };

export default async function DbrDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireArea("agent");
  const result = await getDbrSimulation(id, user.id);
  if (result.state === "not_found") notFound();
  return <DbrDetailView result={result} id={id} />;
}
