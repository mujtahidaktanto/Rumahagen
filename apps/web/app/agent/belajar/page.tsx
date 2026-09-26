// app/agent/belajar/page.tsx — Pembelajaran (M04): Learning Points, Course Saya, Sertifikat Saya, Sesi Belajar Saya. Data dimuat di server (lib/agent/learning-data.ts); aksi (riwayat LP, unduh sertifikat) di komponen klien.
import { LearningView } from "@/components/agent/LearningView";
import { getMyLearning } from "@/lib/agent/learning-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pembelajaran | RumahAgen" };

export default async function AgentLearningPage() {
  const user = await requireArea("agent");
  return <LearningView data={await getMyLearning(user.id)} />;
}
