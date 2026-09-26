// app/admin/provider-ai/page.tsx — Provider AI (M13): tab lewat query string (?tab=catalogue|conn).
import { AiProviderCatalogueView } from "@/components/admin/AiProviderCatalogueView";
import { getAiProviderCatalog, getAllAiConnections } from "@/lib/admin/ai-provider-admin-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Provider AI | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminAiProviderPage({ searchParams }: Props) {
  const user = await requireArea("admin");
  const isSuperadmin = user.role === "superadmin";
  const sp = await searchParams;
  const tab: "catalogue" | "conn" = one(sp.tab) === "conn" ? "conn" : "catalogue";

  const providers = await getAiProviderCatalog();
  const connections = tab === "conn" && isSuperadmin ? await getAllAiConnections() : null;

  return <AiProviderCatalogueView isSuperadmin={isSuperadmin} tab={tab} providers={providers} connections={connections} />;
}
