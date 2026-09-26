// app/agent/kualifikasi/evaluasi/page.tsx — Status Evaluasi & Penghargaan (M15): riwayat evaluasi + award milik sendiri.
import { QualificationEvaluationView } from "@/components/agent/QualificationEvaluationView";
import { getQualificationEvaluationPage } from "@/lib/agent/qualification-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Status Evaluasi & Penghargaan | RumahAgen" };

export default async function AgentQualificationEvaluationPage() {
  const user = await requireArea("agent");
  return <QualificationEvaluationView data={await getQualificationEvaluationPage(user.id)} />;
}
