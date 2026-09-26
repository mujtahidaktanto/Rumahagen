// app/agent/kualifikasi/page.tsx — Bukti Kualifikasi (M15): ajukan bukti + riwayat bukti milik sendiri.
import { QualificationEvidenceView } from "@/components/agent/QualificationEvidenceView";
import { getQualificationEvidencePage } from "@/lib/agent/qualification-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bukti Kualifikasi | RumahAgen" };

export default async function AgentQualificationEvidencePage() {
  const user = await requireArea("agent");
  return <QualificationEvidenceView userId={user.id} data={await getQualificationEvidencePage(user.id)} />;
}
