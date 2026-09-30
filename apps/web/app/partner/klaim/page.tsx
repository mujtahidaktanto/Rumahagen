// app/partner/klaim/page.tsx — Klaim Masuk / Review Klaim (M06, Fase 6). Filter proyek lewat ?proyek=; filter status ditangani di klien (semua status dimuat sekaligus, RPC dibatasi 200 baris).
import { ReviewClaimsView } from "@/components/partner/ReviewClaimsView";
import { getIncomingClaims } from "@/lib/partner/claims-data";
import { getMyProjectOptions } from "@/lib/partner/marketing-kit-data";
import { getMyPartnerProfile } from "@/lib/partner/profile-data";
import { CLAIM_STATUS_FILTERS, type ClaimStatusFilter } from "@/lib/partner/claims-rules";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Klaim Masuk | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ReviewClaimsPage({ searchParams }: Props) {
  const user = await requireArea("partner");
  const profile = await getMyPartnerProfile(user.id);
  const linked = profile.ok && !!profile.data;

  const sp = await searchParams;
  const projectFilter = one(sp.proyek) ?? null;
  const requestedStatus = one(sp.status);
  const initialStatus: ClaimStatusFilter = (CLAIM_STATUS_FILTERS as readonly string[]).includes(requestedStatus ?? "") ? (requestedStatus as ClaimStatusFilter) : "pending";

  const [projects, claims] = await Promise.all([
    linked ? getMyProjectOptions(user.id) : Promise.resolve([]),
    linked ? getIncomingClaims(undefined, projectFilter ?? undefined) : Promise.resolve({ ok: true as const, data: [] }),
  ]);

  return <ReviewClaimsView linked={linked} projects={projects} claims={claims} projectFilter={projectFilter} initialStatus={initialStatus} />;
}
