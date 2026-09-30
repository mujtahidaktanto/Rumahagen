// app/partner/hasil/page.tsx — Hasil Kemitraan (M04, Fase 6).
import { HasilKemitraanView } from "@/components/partner/HasilKemitraanView";
import { getMyLearningResults } from "@/lib/partner/learning-results-data";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { requireArea } from "@/lib/auth/session";
import type { Part } from "@/lib/agent/dashboard-data";
import type { LearningResultRow } from "@/lib/partner/learning-results-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hasil Kemitraan | RumahAgen" };

export default async function HasilKemitraanPage() {
  const user = await requireArea("partner");
  const profile = await getMyPartnerProfile(user.id);
  const linked = profile.ok && !!profile.data;
  const results: Part<LearningResultRow[]> = linked ? await getMyLearningResults(user.id) : { ok: true, data: [] };
  return <HasilKemitraanView linked={linked} results={results} />;
}
