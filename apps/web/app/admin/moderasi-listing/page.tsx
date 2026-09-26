// app/admin/moderasi-listing/page.tsx — Moderasi Listing (M03): tab lewat query string (?tab=pending|leads|published).
import { ListingModerationView } from "@/components/admin/ListingModerationView";
import { getAllLeads, getPendingReviewListings, getPublishedAndSuspendedListings } from "@/lib/admin/listing-moderation-data";
import { requireArea } from "@/lib/auth/session";
import type { AdminViewerRole } from "@/lib/admin/admin-rules";

export const dynamic = "force-dynamic";
export const metadata = { title: "Moderasi Listing | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminListingModerationPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const viewerRole = user.role as AdminViewerRole;
  const sp = await searchParams;

  const tabParam = one(sp.tab);
  const tab: "pending" | "leads" | "published" = tabParam === "leads" ? "leads" : tabParam === "published" ? "published" : "pending";

  const pending = tab === "pending" ? await getPendingReviewListings() : null;
  const published = tab === "published" ? await getPublishedAndSuspendedListings() : null;
  const leads = tab === "leads" && viewerRole === "superadmin" ? await getAllLeads() : null;

  return <ListingModerationView viewerRole={viewerRole} tab={tab} pending={pending} published={published} leads={leads} />;
}
