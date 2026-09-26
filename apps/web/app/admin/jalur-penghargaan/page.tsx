// app/admin/jalur-penghargaan/page.tsx — Jalur Penghargaan (M15): tab lewat query string (?tab=titles|paths|scope).
import { AwardingPathAdminView } from "@/components/admin/AwardingPathAdminView";
import { getAwardingPathsWithVersions, getTitleAuthorityScopes, getTitleDefinitions } from "@/lib/admin/awarding-path-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Jalur Penghargaan | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminAwardingPathPage({ searchParams }: Props) {
  await requireArea("admin");
  const sp = await searchParams;
  const tabParam = one(sp.tab);
  const tab: "titles" | "paths" | "scope" = tabParam === "paths" ? "paths" : tabParam === "scope" ? "scope" : "titles";

  const [titles, paths, scopes] = await Promise.all([getTitleDefinitions(), getAwardingPathsWithVersions(), getTitleAuthorityScopes()]);

  return <AwardingPathAdminView tab={tab} titles={titles} paths={paths} scopes={scopes} />;
}
