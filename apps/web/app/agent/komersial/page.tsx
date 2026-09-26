// app/agent/komersial/page.tsx — Katalog Komersial Agent (M14). Data di server (lib/agent/commercial-data.ts); pembelian lewat dialog klien (/api/commercial/*).
import { CatalogView } from "@/components/agent/CatalogView";
import { getCatalogData } from "@/lib/agent/commercial-data";
import { getActiveContext, getMyContextOrgs } from "@/lib/agent/shell-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Komersial | RumahAgen" };

export default async function CatalogPage() {
  const user = await requireArea("agent");
  const orgs = await getMyContextOrgs(user.id);
  const context = await getActiveContext(user.id, orgs);
  const data = await getCatalogData(user.id, orgs, context.kind === "org" ? context.org.id : null);
  return <CatalogView data={data} />;
}
