// app/partner/marketing-kit/page.tsx — Marketing Kit (M06, Fase 6). Proyek dipilih lewat ?proyek= (bawaan proyek pertama bila kosong).
import { MarketingKitView } from "@/components/partner/MarketingKitView";
import { getMarketingKitForProject, getMyProjectOptions } from "@/lib/partner/marketing-kit-data";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { requireArea } from "@/lib/auth/session";
import type { Part } from "@/lib/agent/dashboard-data";
import type { MarketingKitRow } from "@/lib/partner/marketing-kit-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marketing Kit | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function MarketingKitPage({ searchParams }: Props) {
  const user = await requireArea("partner");
  const profile = await getMyPartnerProfile(user.id);
  const linked = profile.ok && !!profile.data;

  const projects = linked ? await getMyProjectOptions(user.id) : [];
  const sp = await searchParams;
  const requested = one(sp.proyek);
  const selectedProjectId = requested && projects.some((p) => p.id === requested) ? requested : (projects[0]?.id ?? null);

  const kit: Part<MarketingKitRow[]> | null = selectedProjectId ? await getMarketingKitForProject(selectedProjectId) : null;

  return <MarketingKitView linked={linked} projects={projects} selectedProjectId={selectedProjectId} kit={kit} />;
}
