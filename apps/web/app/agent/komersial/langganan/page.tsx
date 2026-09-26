// app/agent/komersial/langganan/page.tsx — Langganan Saya (M14). Filter cakupan lewat URL (?cakupan=pribadi|organisasi). Data di server; beli paket lewat dialog klien (/api/commercial/*).
import { SubscriptionsView, parseScopeFilter } from "@/components/agent/SubscriptionsView";
import { getSubscriptionsData } from "@/lib/agent/commercial-data";
import { getActiveContext, getMyContextOrgs } from "@/lib/agent/shell-data";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Langganan Saya | RumahAgen" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function SubscriptionsPage({ searchParams }: Props) {
  const user = await requireArea("agent");
  const orgs = await getMyContextOrgs(user.id);
  const context = await getActiveContext(user.id, orgs);
  const data = await getSubscriptionsData(user.id, orgs, context.kind === "org" ? context.org.id : null);
  return <SubscriptionsView data={data} cakupan={parseScopeFilter((await searchParams).cakupan)} />;
}
