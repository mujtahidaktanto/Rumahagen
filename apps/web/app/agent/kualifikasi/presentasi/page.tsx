// app/agent/kualifikasi/presentasi/page.tsx — Presentasi Title (M15): atur title yang tampil di profil publik.
import { TitlePresentationView } from "@/components/agent/TitlePresentationView";
import { getTitlePresentationPage } from "@/lib/agent/qualification-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Presentasi Title | RumahAgen" };

export default async function AgentTitlePresentationPage() {
  const user = await requireArea("agent");
  const data = await getTitlePresentationPage(user.id);
  return <TitlePresentationView held={data.held} locked={data.locked} primaryId={data.primaryId} additionalIds={data.additionalIds} agentName={user.name} />;
}
