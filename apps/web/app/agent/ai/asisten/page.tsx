// app/agent/ai/asisten/page.tsx — AI Assistant (M13): chat dengan koneksi BYOK aktif milik sendiri.
import { AiAssistantView } from "@/components/agent/AiAssistantView";
import { getActiveAiConnectionsForChat } from "@/lib/agent/ai-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI Assistant | RumahAgen" };

export default async function AgentAiAssistantPage() {
  const user = await requireArea("agent");
  const data = await getActiveAiConnectionsForChat(user.id);
  return <AiAssistantView data={data} agentName={user.name} />;
}
