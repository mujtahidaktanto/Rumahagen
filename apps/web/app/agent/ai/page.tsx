// app/agent/ai/page.tsx — Koneksi AI Saya (M13 BYOK): daftar koneksi + Tambah Koneksi. Permission m13.own_byok_connection.* untuk role Agent (migration 0164).
import { AiConnectionsView } from "@/components/agent/AiConnectionsView";
import { getAiConnectionsPage } from "@/lib/agent/ai-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Koneksi AI Saya | RumahAgen" };

export default async function AgentAiConnectionsPage() {
  const user = await requireArea("agent");
  return <AiConnectionsView data={await getAiConnectionsPage(user.id)} />;
}
